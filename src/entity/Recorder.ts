import { NativeMediaRecorder } from "./NativeMediaRecorder";
import { FallbackMediaRecorder } from "./FallbackMediaRecorder";
import { FallbackMediaRecorderConfig } from "../types";
import { downloadVideo } from "../util";

export class Recorder {
  private mediaRecorder: NativeMediaRecorder | FallbackMediaRecorder;

  private mediaStream: MediaStream;
  private previewStream: MediaStream;

  private fallbackConfig: Partial<FallbackMediaRecorderConfig> | undefined;

  /**
   * Recorder is used to take recordings of the CaptureStream
   * @param {Object} opts
   * @param {MediaStream} opts.original - The raw, higher resolution stream to record
   * @param {MediaStream} opts.preview - Another stream, can be used as a downscaled preview of the original stream
   * @param {Partial<FallbackMediaRecorderConfig>} [opts.fallbackConfig] - Optional config for FallbackMediaRecorder
   */
  constructor({
    original,
    preview,
    fallbackConfig
  }: {
    original: MediaStream;
    preview: MediaStream;
    fallbackConfig?: Partial<FallbackMediaRecorderConfig>;
  }) {
    this.mediaStream = original;
    this.previewStream = preview;
    this.fallbackConfig = fallbackConfig || undefined;
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
  async start(opts: { source?: "original" | "preview" } = {}) {
    if (this.mediaRecorder && this.mediaRecorder.paused) {
      this.mediaRecorder.resume();
    }

    const ChosenMediaRecorder =
      typeof MediaRecorder === "undefined"
        ? FallbackMediaRecorder
        : NativeMediaRecorder;

    this.mediaRecorder = new ChosenMediaRecorder(
      this.selectMediaStream(opts),
      this.fallbackConfig
    );
    return this.mediaRecorder.start();
  }

  /**
   * Temporarily pauses video recording
   * @returns {Promise<void>}
   */
  async pause() {
    if (this.mediaRecorder) {
      return this.mediaRecorder.pause();
    }
  }

  /**
   * Stops video recording
   * @returns {Promise<(Blob | null)>} The completed video recording stored in a Blob
   */
  async stop(): Promise<Blob | null> {
    if (this.mediaRecorder) {
      return this.mediaRecorder.stop();
    }

    return null;
  }

  /**
   * Retrieves the latest video recorded by the Recorder
   * @returns {(Blob | null)} The video recording stored in a Blob
   */
  getLatestRecording(): Blob | null {
    if (this.mediaRecorder) {
      return this.mediaRecorder.getLatestRecording();
    }

    return null;
  }

  /**
   * Downloads the latest video recording to the browser
   * @param {string} [filename] - Name to use for downloaded video
   * @returns {boolean} If the recording was successfully downloaded
   */
  downloadLatestRecording(filename?: string): boolean {
    if (!this.mediaRecorder) {
      return false;
    }

    const latestRecording = this.mediaRecorder.getLatestRecording();
    if (!latestRecording) {
      return false;
    }

    return downloadVideo(latestRecording, filename);
  }

  /**
   * Sets the mime type for all recorded videos
   * @param {string} mimeType - Mime type to be used
   * @returns {boolean} If the mime type was set successfully
   */
  setMimeType(mimeType: string): boolean {
    const ChosenMediaRecorder =
      typeof MediaRecorder === "undefined"
        ? FallbackMediaRecorder
        : NativeMediaRecorder;

    if (ChosenMediaRecorder.isTypeSupported(mimeType) && this.mediaRecorder) {
      return this.mediaRecorder.setMimeType(mimeType);
    }

    return false;
  }
}
