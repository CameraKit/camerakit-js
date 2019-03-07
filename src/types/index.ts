export type CaptureSource = {
  device: MediaDeviceInfo;
  label: string;
};

export type StorageMethod = "localStorage" | "sessionStorage" | null;

export type CKSettings = {
  storageMethod: StorageMethod;
};

export type FallbackMediaRecorderConfig = {
  base: string;

  width: number;
  height: number;
  bitrate: number;
  framerate: number;
};
