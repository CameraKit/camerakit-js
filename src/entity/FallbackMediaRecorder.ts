import {
  ReadableStream,
  WritableStream
} from "@mattiasbuelens/web-streams-polyfill/ponyfill";
import * as path from "path";
import { getVideoSpecs, injectMetadata } from "../util";
import { FallbackMediaRecorderConfig } from "../types";

const WORKER_NAME = "webm-worker.js";
const WASM_NAME = "webm-wasm.wasm";

const DEFAULT_CONFIG: FallbackMediaRecorderConfig = {
  base: "",

  width: 640,
  height: 480,
  framerate: 30,
  bitrate: 1200
};

export class FallbackMediaRecorder {
  private config: FallbackMediaRecorderConfig;
  private stream: MediaStream;
  private worker: Worker | null;
  private buffers: Array<Buffer>;
  private latestRecording: Blob | null;
  private mimeType: string = "video/webm";

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
  }

  async pause() {
    this.paused = true;
  }

  async stop(): Promise<Blob> {
    this.destroy();

    let blob = new Blob(this.buffers, {
      type: this.mimeType
    });

    this.latestRecording = await injectMetadata(blob);

    return this.latestRecording;
  }

  getLatestRecording() {
    return this.latestRecording;
  }
}
