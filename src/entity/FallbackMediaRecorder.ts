import {
  ReadableStream,
  WritableStream
} from "@mattiasbuelens/web-streams-polyfill/ponyfill";
import { getVideoSpecs, injectMetadata } from "../util";

const DEFAULT_WORKER_PATH =
  "https://unpkg.com/webm-wasm@latest/dist/webm-worker.js";
const DEFAULT_WASM_PATH =
  "https://unpkg.com/webm-wasm@latest/dist/webm-wasm.wasm";

type FallbackConfig = {
  workerPath?: string;
  wasmPath?: string;

  width: number;
  height: number;
  bitrate: number;
  framerate: number;
};

export class FallbackMediaRecorder {
  private config: FallbackConfig;
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

  constructor(stream: MediaStream, config?: FallbackConfig) {
    this.stream = stream;
    this.buffers = [];

    const defaultConfig = {
      width: 640,
      height: 480,
      framerate: 30,
      bitrate: 1200
    };

    this.config = {
      ...defaultConfig,
      ...getVideoSpecs(stream),
      ...config
    };
  }

  private getWorkerPath() {
    if (this.config && this.config.workerPath) {
      return this.config.workerPath;
    }

    return DEFAULT_WORKER_PATH;
  }

  private getWasmPath() {
    if (this.config && this.config.wasmPath) {
      return this.config.wasmPath;
    }

    return DEFAULT_WASM_PATH;
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
    let res = await fetch(this.getWorkerPath());
    let buffer = await res.arrayBuffer();
    const workerPath = URL.createObjectURL(
      new Blob([buffer], {
        type: "text/javascript"
      })
    );

    this.worker = new Worker(workerPath);
    this.worker.postMessage(this.getWasmPath());
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
