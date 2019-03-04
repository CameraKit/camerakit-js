import { CaptureStream } from "../entity";
import {
  CaptureSource,
  StorageMethod,
  FallbackMediaRecorderConfig
} from "../types";
import settings from "../main/settings";

/**
 * Returns media devices available to browser
 * @returns {Promise<{audio: Array<CaptureSource>, video: Array<CaptureSource>}>} Available audio and video sources
 */
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

/**
 * Creates capture stream via chosen CaptureSource's
 * @returns {Promise<CaptureStream>} Freshly created CaptureStream from sources
 */
export async function createCaptureStream({
  video,
  audio,
  fallbackConfig
}: {
  video?: CaptureSource;
  audio?: CaptureSource;
  fallbackConfig?: Partial<FallbackMediaRecorderConfig>;
}) {
  const captureStream = new CaptureStream({ video, audio, fallbackConfig });
  await captureStream.init();

  return captureStream;
}

/**
 * Enables saving of images to LocalStorage or SessionStorage
 * @param {StorageMethod} [method] - String representing method to use
 */
export function enableStorage(method?: StorageMethod) {
  if (method !== undefined) {
    settings.storageMethod = method;
  } else {
    settings.storageMethod = "localStorage";
  }
}

/**
 * Disables local storing of images
 */
export function disableStorage() {
  settings.storageMethod = null;
}
