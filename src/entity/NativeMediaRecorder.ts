import logger from "../main/logger";

export class NativeMediaRecorder {
  private stream: MediaStream;
  private mediaRecorder: MediaRecorder | null;
  private blobs: Array<Blob>;
  private latestRecording: Blob | null;
  private mimeType: string = "video/webm;codecs=vp8";

  paused: boolean;

  static isTypeSupported(mimeType: string): boolean {
    return MediaRecorder.isTypeSupported(mimeType);
  }

  constructor(stream: MediaStream) {
    this.stream = stream;
    this.blobs = [];
    this.mediaRecorder = null;
  }

  private destroy() {
    // TODO: any needed cleanup
  }

  private createRecorder() {
    this.mediaRecorder = null;

    try {
      this.mediaRecorder = new MediaRecorder(this.stream, {
        mimeType: this.mimeType
      });
    } catch (e) {
      logger.error("Exception while creating MediaRecorder:", e);
      return;
    }
    logger.log("Created MediaRecorder", this.mediaRecorder);
    this.mediaRecorder.onstop = (event: Object) => {
      logger.log("Recorder stopped: ", event);
    };
    this.mediaRecorder.ondataavailable = (event: BlobEvent) => {
      if (event.data && event.data.size > 0) {
        this.blobs.push(event.data);
      }
    };
    this.mediaRecorder.start(10); // collect 10ms of data
    logger.log("MediaRecorder started", this.mediaRecorder);
  }

  setMimeType(mimeType: string): boolean {
    this.mimeType = mimeType;

    return true;
  }

  resetRecording() {
    this.blobs = [];
    this.paused = false;
    this.latestRecording = null;
  }

  async resume() {
    if (this.mediaRecorder) {
      this.mediaRecorder.resume();
      this.paused = false;
    }
  }

  async pause() {
    if (this.mediaRecorder) {
      this.mediaRecorder.pause();
      this.paused = true;
    }
  }

  async start() {
    if (this.paused) {
      await this.resume();
      return;
    }

    this.createRecorder();
  }

  async stop(): Promise<Blob> {
    this.destroy();

    this.latestRecording = new Blob(this.blobs, {
      type: this.mimeType
    });

    return this.latestRecording;
  }

  getLatestRecording() {
    return this.latestRecording;
  }
}
