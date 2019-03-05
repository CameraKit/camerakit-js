import {
  ReadableStream,
  WritableStream
} from "@mattiasbuelens/web-streams-polyfill/ponyfill";
import * as path from "path";
import {
  getVideoSpecs,
  injectMetadata,
  downloadVideo,
  downloadAudio
} from "../util";
import { FallbackMediaRecorderConfig } from "../types";

const AudioRecorder = require("audio-recorder-polyfill");

const WORKER_NAME = "webm-worker.js";
const WASM_NAME = "webm-wasm.wasm";

const DEFAULT_CONFIG: FallbackMediaRecorderConfig = {
  base: "",

  width: 640,
  height: 480,
  framerate: 30,
  bitrate: 1200
};

function nextMessage(target: MediaRecorder, what: string): Promise<Blob> {
  return new Promise(resolve => {
    return target.addEventListener(what, (e: BlobEvent) => resolve(e.data), {
      once: true
    });
  });
}

export class FallbackMediaRecorder {
  private config: FallbackMediaRecorderConfig;
  private stream: MediaStream;
  private worker: Worker | null;
  private buffers: Array<Buffer>;
  private latestRecording: Blob | null;
  private mimeType: string = "video/webm";

  private audioRecorder: MediaRecorder | null;
  private latestAudioRecording: Blob | null;

  paused: boolean;

  static isTypeSupported(mimeType: string): boolean {
    const supportedTypes = ["video/webm"];

    return supportedTypes.indexOf(mimeType) !== -1;
  }

  constructor(
    stream: MediaStream,
    config?: Partial<FallbackMediaRecorderConfig>
  ) {
    this.stream = stream;
    this.buffers = [];

    this.config = {
      ...DEFAULT_CONFIG,
      ...getVideoSpecs(stream),
      ...config
    };
  }
  private createReadStream(): ReadableStream {
    const { width, height, framerate } = this.config;
    return new ReadableStream({
      start: controller => {
        const canvas = document.createElement("canvas");
        const video = document.createElement("video");
        video.srcObject = this.stream;
        video.onplaying = () => {
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          const frameTimeout = 1000 / framerate;
          setTimeout(function f() {
            ctx!.drawImage(video, 0, 0);
            controller.enqueue(ctx!.getImageData(0, 0, width, height));
            setTimeout(f, frameTimeout);
          });
        };
        video.play();
      }
    });
  }

  private createWriteStream(): WritableStream {
    return new WritableStream({
      write: (image: ImageData) => {
        if (!this.worker) {
          return;
        }
        this.worker.postMessage(image.data.buffer, [image.data.buffer]);
      }
    });
  }

  private handleWasmMessage(event: MessageEvent) {
    const { width, height, bitrate, framerate } = this.config;
    if (!this.worker) {
      return;
    }

    switch (event.data) {
      case "READY":
        this.worker.postMessage({
          width,
          height,
          bitrate,
          timebaseDen: framerate,
          realtime: true
        });

        this.createReadStream().pipeTo(this.createWriteStream());
        break;
      default:
        if (event.data && !this.paused) {
          this.buffers.push(event.data);
        }
        break;
    }
  }

  private async createWorker(): Promise<Worker> {
    this.worker = new Worker(path.join(this.config.base, WORKER_NAME));
    this.worker.postMessage(path.join(this.config.base, WASM_NAME));
    this.worker.addEventListener("message", (event: MessageEvent) =>
      this.handleWasmMessage(event)
    );

    return this.worker;
  }

  private createRecorder() {
    this.audioRecorder = null;

    try {
      this.audioRecorder = new AudioRecorder(this.stream, {
        mimeType: this.mimeType
      });
    } catch (e) {
      console.error("Exception while creating audioRecorder:", e);
      return;
    }

    if (!this.audioRecorder) {
      return;
    }

    console.log("Created audioRecorder", this.audioRecorder);
    this.audioRecorder.onstop = (event: Object) => {
      console.log("Recorder stopped: ", event);
    };
    this.audioRecorder.start(); // collect 10ms of data
  }

  private destroy() {
    if (!this.worker) {
      return;
    }

    this.worker.postMessage(null);
    this.worker.terminate();
    this.worker = null;
  }

  setMimeType(mimeType: string): boolean {
    this.mimeType = mimeType;

    return true;
  }

  resetRecording() {
    this.buffers = [];
    this.paused = false;
    this.latestRecording = null;
    this.latestAudioRecording = null;
  }

  resume() {
    this.paused = false;
  }

  async start() {
    if (this.paused) {
      this.resume();
      return;
    }

    this.resetRecording();
    await this.createWorker();
    this.createRecorder();
  }

  async pause() {
    this.paused = true;
  }

  async stop(): Promise<[Blob, Blob | null]> {
    this.destroy();

    if (this.audioRecorder) {
      this.audioRecorder.stop();
      this.latestAudioRecording = await nextMessage(
        this.audioRecorder,
        "dataavailable"
      );
    }

    let videoBlob = new Blob(this.buffers, {
      type: this.mimeType
    });

    this.latestRecording = await injectMetadata(videoBlob);

    return [this.latestRecording, this.latestAudioRecording];
  }

  getLatestRecording() {
    return this.latestRecording;
  }

  downloadLatestRecording(filename?: string): boolean {
    if (!this.latestRecording) {
      return false;
    }

    setTimeout(() => {
      if (this.latestAudioRecording) {
        downloadAudio(this.latestAudioRecording, filename);
      }
    }, 200);

    return downloadVideo(this.latestRecording, filename);
  }
}
