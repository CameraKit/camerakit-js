import { CaptureStream } from "../entity";
import { CaptureSource, StorageMethod } from "../types";
import settings from "../main/settings";

export async function getDevices() {
  const video: Array<CaptureSource> = [];
  const audio: Array<CaptureSource> = [];

  const devices = await navigator.mediaDevices.enumerateDevices();
  devices.forEach(device => {
    switch (device.kind) {
      case "videoinput":
        video.push({ device, label: device.label || "Unnamed video input" });
        break;
      case "audioinput":
        audio.push({ device, label: device.label || "Unnamed audio input" });
        break;
      default:
        console.log("Other input type detected:", device.kind);
    }
  });

  return { audio, video };
}

export async function createCaptureStream({
  video,
  audio
}: {
  video?: CaptureSource;
  audio?: CaptureSource;
}) {
  const captureStream = new CaptureStream({ video, audio });
  await captureStream.init();

  return captureStream;
}

export function enableStorage(method?: StorageMethod) {
  if (method !== undefined) {
    settings.storageMethod = method;
  } else {
    settings.storageMethod = "localStorage";
  }
}

export function disableStorage() {
  settings.storageMethod = null;
}
