export type CaptureSource = {
  device: MediaDeviceInfo;
  label: string;
};

export type StorageMethod = "localStorage" | "sessionStorage" | null;

export type CKSettings = {
  storageMethod: StorageMethod;
};
