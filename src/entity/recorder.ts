import whammy from "whammy";
import { downloadVideo } from "../util";

export class Recorder {
  private recordedBlobs: Array<Blob>;
  private latestRecording: Blob;
  private mediaRecorder: MediaRecorder;

  private mediaStream: MediaStream;
  private previewStream: MediaStream;

  private mimeType: string = "video/webm;codecs=vp8";

  /**
   * Recorder is used to take recordings of the CaptureStream
   * @param {Object} opts
   * @param {MediaStream} opts.original - The raw, higher resolution stream to record
   * @param {MediaStream} opts.preview - Another stream, can be used as a downscaled preview of the original stream
   */
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

  /**
   * Helper function for choosing correct media stream
   * @param {Object} opts
   * @param {("original" | "preview")} [opts.source=original] - Which stream should be selected
   * @returns {MediaStream} The media stream all changes should be applied to
   */
  private selectMediaStream({
    source
  }: {
    source?: "original" | "preview";
  } = {}): MediaStream {
    return source === "preview" ? this.previewStream : this.mediaStream;
  }

  /**
   * Starts or resumes video recording on specified stream
   * @param {Object} [opts={}]
   * @param {("original" | "preview")} [opts.source=original] - Which stream should be selected
   */
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

  /**
   * Temporarily pauses video recording
   */
  pause() {
    if (this.mediaRecorder) {
      this.mediaRecorder.pause();
    }
  }

  /**
   * Stops video recording
   * @returns {(Blob | null)} The completed video recording stored in a Blob
   */
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

  /**
   * Retrieves the latest video recorded by the Recorder
   * @returns {(Blob | null)} The video recording stored in a Blob
   */
  getLatestRecording(): Blob | null {
    return this.latestRecording ? this.latestRecording : null;
  }

  /**
   * Downloads the latest video recording to the browser
   * @param {string} [filename] - Name to use for downloaded video
   * @returns {boolean} If the recording was successfully downloaded
   */
  downloadLatestRecording(filename?: string): boolean {
    if (!this.latestRecording) {
      return false;
    }

    return downloadVideo(this.latestRecording, filename);
  }

  /**
   * Sets the mime type for all recorded videos
   * @param {string} mimeType - Mime type to be used
   */
  setMimeType(mimeType: string) {
    if (MediaRecorder.isTypeSupported(mimeType)) {
      this.mimeType = mimeType;
    }
  }
}
