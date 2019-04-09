import { CaptureSource } from "../entity";

export async function closeStream(stream: MediaStream): Promise<void> {
  stream.getVideoTracks().forEach(track => track.stop());
  stream.getAudioTracks().forEach(track => track.stop());
}

// Used if we want viewing permissions, but don't need to use it yet
export async function requestAndCloseStream(
  opts: MediaStreamConstraints = {
    video: true,
    audio: true
  }
): Promise<MediaStream> {
  const stream = await navigator.mediaDevices.getUserMedia(opts);
  await closeStream(stream);

  return stream;
}

export function getVideoSpecs(
  stream: MediaStream
): { width: number; height: number; framerate: number } | null {
  const videoTrack = stream.getVideoTracks()[0];

  if (!videoTrack) {
    return null;
  }

  const { width, height, frameRate } = videoTrack.getSettings();

  if (width && height && frameRate) {
    return { width, height, framerate: frameRate };
  }

  return null;
}

export function createVideoElement(stream: MediaStream): HTMLVideoElement {
  const video = document.createElement("video");
  video.srcObject = stream;
  video.muted = true;
  // @ts-ignore: playsInline is a Apple webkit only option
  video.playsInline = true;
  video.play();
  return video;
}

export function toTrackConstraints(
  input: CaptureSource | MediaTrackConstraints | "front" | "back" | undefined
): MediaTrackConstraints {
  if (input === undefined) {
    return {};
  }

  if (typeof input === "string") {
    if (!["front", "back"].includes(input)) {
      throw new Error(`Unknown media selector: ${input}`);
    }

    return {
      facingMode: input === "front" ? "user" : "environment"
    };
  }

  if (input instanceof CaptureSource) {
    return {
      deviceId: {
        exact: input.device.deviceId
      }
    };
  }

  if (input instanceof Object) {
    return input;
  }

  return {};
}
