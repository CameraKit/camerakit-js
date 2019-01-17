export class Shutter {
  private videoInput: HTMLVideoElement;
  private latestCapture: string;

  constructor(videoInput: HTMLVideoElement) {
    this.videoInput = videoInput;
  }

  private downloadImage(image: string, filename?: string): boolean {
    if (!image) {
      return false;
    }

    const a = document.createElement("a");
    const img = new Blob([image], { type: "image/png" });
    a.download = filename || `CKW-${new Date()}`;
    a.href = window.URL.createObjectURL(img);
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    return true;
  }

  capture() {
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
    return this.latestCapture;
  }

  captureAndDownload(filename?: string) {
    this.downloadImage(this.capture(), filename);
  }

  downloadLatestCapture(filename?: string): boolean {
    if (!this.latestCapture) {
      return false;
    }

    this.downloadImage(this.latestCapture, filename);

    return true;
  }
}
