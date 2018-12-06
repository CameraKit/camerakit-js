import adapter from 'webrtc-adapter';

const handleError = (error) => {
  console.log('Error: ', error);
};

const CameraKitWeb = {
  getDevices: async () => {
    const audioSources = [];
    const videoSources = [];
    await navigator.mediaDevices.enumerateDevices().then((devices) => {
      devices.forEach(device => {
        switch(device.kind) {
          case 'audioinput':
            audioSources.push({ device, label: device.label || `audioinput` });
            break;
          case 'videoinput':
            videoSources.push({ device, label: device.label || `videoinput` });
        }
      })
    });
    return { audioSources, videoSources };
  },

  initializeCamera: ({ videoElement, audioDeviceId, videoDeviceId, height, width, ideal, max, facingMode = 'environment' }) => {
    const constraints = {
      audio: {
        deviceId: { exact: audioDeviceId },
      },
      video: {
        deviceId: { exact: videoDeviceId },
        width,
        height,
        frameRate: {
          ideal,
          max,
        },
        facingMode,
      },
    };
    const gotStream = (stream) => {
      window.stream = stream;
      videoElement.srcObject = stream;
      videoElement.play();
    };
    navigator.mediaDevices.getUserMedia(constraints).then(gotStream).catch(handleError);
  },

  takePicture: ({ videoElement }) => {
    const canvas = document.createElement('canvas');
    canvas.style.display = 'none';
    document.body.appendChild(canvas);
    const context = canvas.getContext('2d');
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    context.drawImage(videoElement, 0, 0, videoElement.videoWidth, videoElement.videoHeight);
    return canvas.toDataURL('image/png');
  }
}
export default CameraKitWeb;
