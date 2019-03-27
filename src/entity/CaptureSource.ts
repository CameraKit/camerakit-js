export class CaptureSource {
  device: MediaDeviceInfo;
  label: string;

  constructor({ device, label }: { device: MediaDeviceInfo; label: string }) {
    this.device = device;
    this.label = label || "Unnamed source";
  }
}
