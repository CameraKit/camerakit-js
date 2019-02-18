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
