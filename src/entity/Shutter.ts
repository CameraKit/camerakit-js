import settings from "../main/settings";
import { saveImage, downloadImage } from "../util";
import { StorageMethod } from "../types";

export class Shutter {
  private videoInput: HTMLVideoElement;
  private previewInput: HTMLVideoElement;
  private latestCapture: string;

  /**
   * Shutter is used for taking pictures from the video stream
   * @param {Object} opts
   * @param {HTMLVideoElement} opts.original - The raw, higher resolution video to pull photos from
   * @param {HTMLVideoElement} opts.preview - Another video stream, can be used as a downscaled preview of the original stream
   */
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

  /**
   * Helper function for choosing correct video element
   * @param {Object} opts
   * @param {("original" | "preview")} [opts.source=original] - Which stream should be selected
   * @returns {HTMLVideoElement} The video element all changes should be applied to
   */
  private selectVideoInput({
    source
  }: {
    source?: "original" | "preview";
  } = {}): HTMLVideoElement {
    source = source || "original";
    if (source === "preview") {
      return this.previewInput;
    }
    return this.videoInput;
  }

  /**
   * Takes and possibly saves a photo of the specified stream
   * @param {Object} opts
   * @param {StorageMethod} [opts.save] - If the photo should be saved to LocalStorage
   * @param {("original" | "preview")} [opts.source=original] - Which stream the capture should be performed on
   * @returns {string} Photo represented as data URL
   */
  capture({
    save,
    source
  }: { save?: StorageMethod; source?: "original" | "preview" } = {}): string {
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

  /**
   * Captures an image from the video stream and downloads it to the browser
   * @param {Object} opts
   * @param {("original" | "preview")} [opts.source=original] - Which stream the capture should be performed on
   * @param {string} [opts.filename] - Name to use for downloaded image
   * @returns {boolean} If the image was downloaded successfully
   */
  captureAndDownload({
    source,
    filename
  }: {
    source?: "original" | "preview";
    filename?: string;
  }): boolean {
    return downloadImage(this.capture({ source }), filename);
  }

  /**
   * Downloads the image last captured by the shutter
   * @param {string} [filename] - Name to use for downloaded image
   * @returns {boolean} If the iamge was downloaded successfully
   */
  downloadLatestCapture(filename?: string): boolean {
    if (!this.latestCapture) {
      return false;
    }

    return downloadImage(this.latestCapture, filename);
  }
}
