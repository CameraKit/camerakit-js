import { downloadVideo } from "../util";

export class Recorder {
  private recordedBlobs: Array<Blob>;
  private latestRecording: Blob;
  private mediaRecorder: MediaRecorder;

  private mediaStream: MediaStream;
  private previewStream: MediaStream;

  private mimeType: string = "video/webm;codecs=vp8";

  constructor({
    original,
    preview
  }: {
    original: MediaStream;
    preview: MediaStream;
  }) {
    this.mediaStream = original;
    this.previewStream = preview;
  }

  private selectMediaStream({
    source
  }: {
    source?: "original" | "preview";
  } = {}) {
    return source === "preview" ? this.previewStream : this.mediaStream;
  }

  start(opts: { source?: "original" | "preview" } = {}) {
    if (this.mediaRecorder && this.mediaRecorder.state === "paused") {
      this.mediaRecorder.resume();
      return;
    }

    const mediaSource = new MediaSource();
    this.recordedBlobs = [];

    const handleDataAvailable = (event: BlobEvent) => {
      if (event.data && event.data.size > 0) {
        this.recordedBlobs.push(event.data);
      }
    };
    mediaSource.addEventListener(
      "sourceopen",
      () => {
        mediaSource.addSourceBuffer(this.mimeType);
      },
      false
    );
    try {
      this.mediaRecorder = new MediaRecorder(this.selectMediaStream(opts), {
        mimeType: this.mimeType
      });
    } catch (e) {
      console.error("Exception while creating MediaRecorder:", e);
      return;
    }
    console.log("Created MediaRecorder", this.mediaRecorder);
    this.mediaRecorder.onstop = (event: Object) => {
      console.log("Recorder stopped: ", event);
    };
    this.mediaRecorder.ondataavailable = handleDataAvailable;
    this.mediaRecorder.start(10); // collect 10ms of data
    console.log("MediaRecorder started", this.mediaRecorder);
  }

  pause() {
    if (this.mediaRecorder) {
      this.mediaRecorder.pause();
    }
  }

  stop(): Blob | null {
    if (this.mediaRecorder) {
      this.mediaRecorder.stop();
      this.latestRecording = new Blob(this.recordedBlobs, {
        type: this.mimeType
      });

      return this.latestRecording;
    }

    return null;
  }

  getLatestRecording(): Blob | null {
    return this.latestRecording ? this.latestRecording : null;
  }

  downloadLatestRecording(filename?: string): boolean {
    if (!this.latestRecording) {
      return false;
    }

    return downloadVideo(this.latestRecording, filename);
  }

  setMimeType(mimeType: string) {
    if (MediaRecorder.isTypeSupported(mimeType)) {
      this.mimeType = mimeType;
    }
  }
}
