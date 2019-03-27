import { Shutter } from "./Shutter";
import { Recorder } from "./Recorder";
import { CaptureSource, FallbackMediaRecorderConfig } from "../types";

export class CaptureStream {
  private mediaStream: MediaStream;
  private previewStream: MediaStream;

  private videoSource: CaptureSource | undefined;
  private audioSource: CaptureSource | undefined;
  private previewVideoSource = this.videoSource;
  private previewAudioSource = this.audioSource;

  private fallbackConfig: Partial<FallbackMediaRecorderConfig> | undefined;

  shutter: Shutter;
  recorder: Recorder;

  /**
   * CaptureStream provides access to streaming related functions
   * @param {Object} opts
   * @param {CaptureSource} [opts.video] - Video source to create CaptureStream from
   * @param {CaptureSource} [opts.audio] - Audio source to create CaptureStream from
   * @param {Partial<FallbackMediaRecorderConfig>} [opts.fallbackConfig] - Optional config for FallbackMediaRecorder
   */
  constructor({
    video,
    audio,
    fallbackConfig
  }: {
    video?: CaptureSource;
    audio?: CaptureSource;
    fallbackConfig?: Partial<FallbackMediaRecorderConfig>;
  }) {
    this.previewVideoSource = this.videoSource = video;
    this.previewAudioSource = this.audioSource = audio;
    this.fallbackConfig = fallbackConfig;

    if (!video && !audio) {
      throw new Error("No media source provided to stream");
    }
  }

  /**
   * Utility method for generating constraints for getUserMedia based on stream
   * @param {Object} [opts={}]
   * @param {("original" | "preview")} [opts.source=original] - Which stream contrains should be generated for
   * @returns {MediaStreamConstraints} Generated constrains for input source
   */
  private generateConstraints({
    source
  }: { source?: "original" | "preview" } = {}): MediaStreamConstraints {
    const video = (source === "preview"
      ? this.previewVideoSource
      : this.videoSource)!.device!.deviceId;
    const audio = (source === "preview"
      ? this.previewAudioSource
      : this.audioSource)!.device!.deviceId;
    if (video === undefined && audio === undefined) {
      throw new Error("No compatible media sources");
    }

    return {
      video: { deviceId: video ? { exact: video } : undefined },
      audio: { deviceId: audio ? { exact: audio } : undefined }
    };
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
   * Generates constraints and requests media stream
   * @returns {Promise<MediaStream>} Newly created MediaStream to be used
   */
  private async initalizeMediaStream(): Promise<MediaStream> {
    this.mediaStream = await navigator.mediaDevices.getUserMedia(
      this.generateConstraints({ source: "original" })
    );
    this.previewStream = this.mediaStream.clone();

    return this.mediaStream;
  }

  /**
   * Sets up internal Shutter instance from MediaStream
   * @returns {Promise<Shutter>} Newly created shutter instance
   */
  private async initalizeShutter(): Promise<Shutter> {
    const original = document.createElement("video");
    const preview = document.createElement("video");

    original.srcObject = this.mediaStream;
    original.play();
    original.muted = true;
    preview.srcObject = this.previewStream;
    preview.play();
    preview.muted = true;

    this.shutter = new Shutter({ original, preview });
    return this.shutter;
  }

  /**
   * Sets up internal Recorder instance from MediaStream
   * @returns {Promise<Recorder>} Newly created recorder instance
   */
  private async initalizeRecorder(): Promise<Recorder> {
    this.recorder = new Recorder({
      original: this.mediaStream,
      preview: this.previewStream,
      fallbackConfig: this.fallbackConfig
    });

    return this.recorder;
  }

  /**
   * Requests stream permissions, generates Shutter and recorder.
   */
  async init() {
    await this.initalizeMediaStream();
    await this.initalizeShutter();
    await this.initalizeRecorder();
  }

  /**
   * Sets the resolution of the specified media stream
   * @param {Object} [opts={}]
   * @param {number} [opts.width] - Video width
   * @param {number} [opts.height] - Video height
   * @param {number} [opts.aspect] - Video aspect ratio
   * @param {("original" | "preview")} [opts.source=original] - Which stream the resolution should change for
   * @returns {Promise<MediaStream>} The updated MediaStream with new resolution
   */
  async setResolution({
    width,
    height,
    aspect,
    source
  }: {
    width?: number;
    height?: number;
    aspect?: number;
    source?: "original" | "preview";
  } = {}): Promise<MediaStream> {
    const stream = this.selectMediaStream({ source });

    const track = stream.getVideoTracks()[0];
    if (!track) {
      throw new Error("No video stream to set resolution");
    }

    const constraints = track.getConstraints();

    if (width) {
      constraints.width = { exact: width };
    }
    if (height) {
      constraints.height = { exact: height };
    }
    if (aspect) {
      constraints.aspectRatio = { exact: aspect };
    }

    await track.applyConstraints(constraints);
    return this.selectMediaStream({ source });
  }

  /**
   * Re-sets the audio/video source for the specified stream
   * @param {Object} [opts={}]
   * @param {CaptureSource} [opts.video] - New video source
   * @param {CaptureSource} [opts.audio] - New audio source
   * @param {("original" | "preview")} [opts.source=original] - Which stream the to set the new sources
   * @returns {Promise<MediaStream>} The new stream with updated source
   */
  async setSource({
    video,
    audio,
    source
  }: {
    video?: CaptureSource;
    audio?: CaptureSource;
    source?: "original" | "preview";
  }): Promise<MediaStream> {
    if (!video && !audio) {
      throw new Error("No media source provided to stream");
    }

    if (source === "preview") {
      this.previewVideoSource = video;
      this.previewAudioSource = audio;
    } else {
      this.videoSource = video;
      this.audioSource = audio;
    }

    const newStream = await navigator.mediaDevices.getUserMedia(
      this.generateConstraints({ source })
    );

    if (source === "preview") {
      this.previewStream = newStream;
    } else {
      this.mediaStream = newStream;
    }

    return newStream;
  }

  /**
   * Retrieves the raw MediaStream for use in video display
   * @param opts
   * @param {("original" | "preview")} [opts.source=original] - Which stream to use
   */
  getMediaStream({ source }: { source?: "original" | "preview" } = {}) {
    return source === "preview" ? this.previewStream : this.mediaStream;
  }

  /**
   * Closes all open video streams for when usage is complete
   */
  destroy() {
    const tracks = this.mediaStream
      .getTracks()
      .concat(this.previewStream.getTracks());

    for (let track of tracks) {
      track.stop();
    }
  }
}
