import { CaptureStream, CaptureSource } from "../entity";
import { StorageMethod, FallbackMediaRecorderConfig } from "../types";
import { requestAndCloseStream, registerVideoElement } from "../util";
import { triggerEvent } from "./events";
import settings from "./settings";

/**
 * Returns media devices available to browser
 * @param {Object} [opts]
 * @param {boolean} [opts.noRequest] - Return devices without requesting audio/video permissions
 * @returns {Promise<{audio: Array<CaptureSource>, video: Array<CaptureSource>}>} Available audio and video sources
 */
export async function getDevices(
  opts: {
    noRequest?: boolean;
  } = {}
) {
  if (!opts.noRequest) {
    await requestAndCloseStream();
  }

  const video: Array<CaptureSource> = [];
  const audio: Array<CaptureSource> = [];

  const devices = await navigator.mediaDevices.enumerateDevices();
  devices.forEach(device => {
    switch (device.kind) {
      case "videoinput":
        video.push(
          new CaptureSource({
            device,
            label: device.label || "Unnamed video input"
          })
        );
        break;
      case "audioinput":
        audio.push(
          new CaptureSource({
            device,
            label: device.label || "Unnamed audio input"
          })
        );
        break;
      default:
        console.log("Other input type detected:", device.kind);
    }
  });

  return { audio, video };
}

/**
 * Creates capture stream via chosen CaptureSource's
 * @param {Object} [opts]
 * @param {CaptureSource | "front" | "back"} [opts.video] - Video source to create CaptureStream from
 * @param {CaptureSource} [opts.video] - Audio source to create CaptureStream from
 * @returns {Promise<CaptureStream>} Freshly created CaptureStream from sources
 */
export async function createCaptureStream({
  video,
  audio,
  fallbackConfig
}: {
  video?: CaptureSource | "front" | "back";
  audio?: CaptureSource;
  fallbackConfig?: Partial<FallbackMediaRecorderConfig>;
}) {
  const captureStream = new CaptureStream({ video, audio, fallbackConfig });
  await captureStream.init();

  return captureStream;
}

/**
 * Registers a newly created video element and tells existing ones to restart
 * @param {HTMLVideoElement} [video] - Video source to be registered
 */
export function registerVideo(video?: HTMLVideoElement) {
  // Tell all the other video elements they need to be restarted
  triggerEvent("video");

  if (video) {
    // Register this video for restarting incase we do it internally
    registerVideoElement(video);
  }
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
