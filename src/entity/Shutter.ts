import settings from "../main/settings";
import { saveImage, downloadImage } from "../util";
import { StorageMethod } from "../types";

export class Shutter {
  private videoInput: HTMLVideoElement;
  private previewInput: HTMLVideoElement;
  private latestCapture: string;

  constructor({
    original,
    preview
  }: {
    original: HTMLVideoElement;
    preview: HTMLVideoElement;
  }) {
    this.videoInput = original;
    this.previewInput = preview;
  }

  private selectVideoInput({
    source
  }: {
    source?: "original" | "preview";
  } = {}) {
    source = source || "original";
    if (source === "preview") {
      return this.previewInput;
    }
    return this.videoInput;
  }

  capture({
    save,
    source
  }: { save?: StorageMethod; source?: "original" | "preview" } = {}) {
    const videoInput = this.selectVideoInput({ source });

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    canvas.width = videoInput.videoWidth;
    canvas.height = videoInput.videoHeight;
    context!.drawImage(
      videoInput,
      0,
      0,
      videoInput.videoWidth,
      videoInput.videoHeight
    );

    this.latestCapture = canvas.toDataURL("image/png");

    if (save || settings.storageMethod) {
      saveImage(this.latestCapture, {
        storageMethod: save || settings.storageMethod
      });
    }

    return this.latestCapture;
  }

  captureAndDownload({
    source,
    filename
  }: {
    source?: "original" | "preview";
    filename?: string;
  }) {
    return downloadImage(this.capture({ source }), filename);
  }

  downloadLatestCapture(filename?: string): boolean {
    if (!this.latestCapture) {
      return false;
    }

    return downloadImage(this.latestCapture, filename);
  }
}
