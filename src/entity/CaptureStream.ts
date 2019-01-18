import { CaptureSource } from "../types";
import { Shutter } from "./Shutter";
import { Recorder } from "./Recorder";

export class CaptureStream {
  private mediaStream: MediaStream;
  private previewStream: MediaStream;

  private videoSource: CaptureSource | undefined;
  private audioSource: CaptureSource | undefined;
  private previewVideoSource = this.videoSource;
  private previewAudioSource = this.audioSource;

  shutter: Shutter;
  recorder: Recorder;

  constructor({
    video,
    audio
  }: {
    video?: CaptureSource;
    audio?: CaptureSource;
  }) {
    this.previewVideoSource = this.videoSource = video;
    this.previewAudioSource = this.audioSource = audio;

    if (!video && !audio) {
      throw new Error("No media source provided to stream");
    }
  }

  private generateConstraints({
    source
  }: { source?: "original" | "preview" } = {}) {
    const video = (source === "preview"
      ? this.previewVideoSource
      : this.videoSource)!.device!.deviceId;
    const audio = (source === "preview"
      ? this.previewAudioSource
      : this.audioSource)!.device!.deviceId;
    if (!video && !audio) {
      throw new Error("No compatible media sources");
    }

    return {
      video: { deviceId: video ? { exact: video } : undefined },
      audio: { deviceId: audio ? { exact: audio } : undefined }
    };
  }

  private async initalizeMediaStream() {
    this.mediaStream = await navigator.mediaDevices.getUserMedia(
      this.generateConstraints({ source: "original" })
    );
    this.previewStream = this.mediaStream.clone();

    return this.mediaStream;
  }

  private async initalizeShutter() {
    const original = document.createElement("video");
    const preview = document.createElement("video");

    original.srcObject = this.mediaStream;
    original.play();
    preview.srcObject = this.previewStream;
    preview.play();

    this.shutter = new Shutter({ original, preview });
  }

  private async initalizeRecorder() {
    this.recorder = new Recorder({
      original: this.mediaStream,
      preview: this.previewStream
    });
  }

  async init() {
    await this.initalizeMediaStream();
    await this.initalizeShutter();
    await this.initalizeRecorder();
  }

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
  } = {}) {
    source = source || "original";
    const stream = source === "preview" ? this.previewStream : this.mediaStream;

    const track = stream.getVideoTracks()[0];
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
  }

  async setSource({
    video,
    audio,
    source
  }: {
    video?: CaptureSource;
    audio?: CaptureSource;
    source?: "original" | "preview";
  }) {
    this.previewVideoSource = this.videoSource = video;
    this.previewAudioSource = this.audioSource = audio;

    if (!video && !audio) {
      throw new Error("No media source provided to stream");
    }

    this.previewStream = await navigator.mediaDevices.getUserMedia(
      this.generateConstraints({ source })
    );
  }

  getMediaStream({ source }: { source?: "original" | "preview" } = {}) {
    return source === "preview" ? this.previewStream : this.mediaStream;
  }

  destroy() {
    const tracks = this.mediaStream
      .getTracks()
      .concat(this.previewStream.getTracks());

    for (let track of tracks) {
      track.stop();
    }
  }
}
