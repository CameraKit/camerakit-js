import { CaptureSource } from "../types";
import { Shutter } from "./Shutter";
import { Recorder } from "./Recorder";

export class CaptureStream {
  private mediaStream: MediaStream;
  private previewStream: MediaStream;

  private videoElem: HTMLVideoElement;
  private videoPreview: HTMLVideoElement;

  private videoSource: CaptureSource | undefined;
  private audioSource: CaptureSource | undefined;

  shutter: Shutter;
  recorder: Recorder;

  constructor({
    video,
    audio
  }: {
    video?: CaptureSource;
    audio?: CaptureSource;
  }) {
    this.videoSource = video;
    this.audioSource = audio;
    this.videoElem = document.createElement("video");

    if (!video && !audio) {
      throw new Error("No media source provided to stream");
    }
  }

  private async initalizeMediaStream() {
    const videoDeviceId =
      (this.videoSource &&
        this.videoSource.device &&
        this.videoSource.device.deviceId) ||
      undefined;
    const audioDeviceId =
      (this.audioSource &&
        this.audioSource.device &&
        this.audioSource.device.deviceId) ||
      undefined;

    if (!videoDeviceId && !audioDeviceId) {
      throw new Error("No compatible media sources");
    }

    const constraints = {
      audio: { deviceId: audioDeviceId ? { exact: audioDeviceId } : undefined },
      video: { deviceId: videoDeviceId ? { exact: videoDeviceId } : undefined }
    };

    this.mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
    this.previewStream = this.mediaStream.clone();

    this.videoElem.srcObject = this.mediaStream;
    this.videoElem.play();

    return this.mediaStream;
  }

  private async initalizeShutter() {
    this.shutter = new Shutter({
      original: this.videoElem,
      preview: this.videoPreview
    });
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

  getMediaStream() {
    return this.mediaStream;
  }

  destroy() {
    const tracks = this.mediaStream.getTracks();
    for (let track of tracks) {
      track.stop();
    }
  }
}
