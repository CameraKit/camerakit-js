import settings from "../main/settings";
import { saveImage, downloadImage } from "../util";
import { StorageMethod } from "../types";

export class Shutter {
  private videoInput: HTMLVideoElement;
  private latestCapture: string;

  constructor(videoInput: HTMLVideoElement) {
    this.videoInput = videoInput;
  }

  capture({ save }: { save?: StorageMethod } = {}) {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    canvas.width = this.videoInput.videoWidth;
    canvas.height = this.videoInput.videoHeight;
    context!.drawImage(
      this.videoInput,
      0,
      0,
      this.videoInput.videoWidth,
      this.videoInput.videoHeight
    );

    this.latestCapture = canvas.toDataURL("image/png");

    if (save || settings.storageMethod) {
      saveImage(this.latestCapture, {
        storageMethod: save || settings.storageMethod
      });
    }

    return this.latestCapture;
  }

  captureAndDownload(filename?: string) {
    downloadImage(this.capture(), filename);
  }

  downloadLatestCapture(filename?: string): boolean {
    if (!this.latestCapture) {
      return false;
    }

    downloadImage(this.latestCapture, filename);

    return true;
  }
}
