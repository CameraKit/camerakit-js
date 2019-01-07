type MediaSource = {
  device: MediaDeviceInfo;
  label: string;
};

export async function getDevices() {
  const audioSources: Array<MediaSource> = [];
  const videoSources: Array<MediaSource> = [];

  const devices = await navigator.mediaDevices.enumerateDevices();
  devices.forEach(device => {
    switch (device.kind) {
      case "audioinput":
        audioSources.push({ device, label: device.label || "audioinput" });
        break;
      case "videoinput":
        videoSources.push({ device, label: device.label || "videoinput" });
        break;
      default:
        console.log("Other input type detected.");
    }
  });

  return { audioSources, videoSources };
}

export async function initializeCamera({
  audioDeviceId,
  videoDeviceId
}: {
  audioDeviceId?: string;
  videoDeviceId?: string;
}) {
  const constraints = {
    audio: { deviceId: audioDeviceId ? { exact: audioDeviceId } : undefined },
    video: { deviceId: videoDeviceId ? { exact: videoDeviceId } : undefined }
  };
  return navigator.mediaDevices.getUserMedia(constraints);
}

export function takePicture({
  videoElement
}: {
  videoElement: HTMLVideoElement;
}) {
  const canvas = document.createElement("canvas");
  canvas.style.display = "none";
  document.body.appendChild(canvas);
  const context = canvas.getContext("2d");
  canvas.width = videoElement.videoWidth;
  canvas.height = videoElement.videoHeight;
  context!.drawImage(
    videoElement,
    0,
    0,
    videoElement.videoWidth,
    videoElement.videoHeight
  );
  return canvas.toDataURL("image/png");
}
