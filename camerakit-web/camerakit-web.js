import adapter from 'webrtc-adapter';

console.log(`Using webrtc-adapter ${adapter.extractVersion}`);

let recordedBlobs = [];
let mediaRecorder;
const CameraKitWeb = {
  getDevices: async () => {
    const audioSources = [];
    const videoSources = [];
    await navigator.mediaDevices.enumerateDevices().then((devices) => {
      devices.forEach((device) => {
        switch (device.kind) {
          case 'audioinput':
            audioSources.push({ device, label: device.label || 'audioinput' });
            break;
          case 'videoinput':
            videoSources.push({ device, label: device.label || 'videoinput' });
            break;
          default: console.log('Other input type detected.');
        }
      });
    });
    return { audioSources, videoSources };
  },

  initializeCamera: ({
    audioDeviceId, videoDeviceId,
  }) => {
    const constraints = {
      audio: { deviceId: audioDeviceId ? { exact: audioDeviceId } : undefined },
      video: { deviceId: videoDeviceId ? { exact: videoDeviceId } : undefined },
    };
    return navigator.mediaDevices.getUserMedia(constraints);
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
  },

  startRecording: ({ stream }) => {
    const mediaSource = new MediaSource();
    recordedBlobs = [];

    const handleDataAvailable = (event) => {
      if (event.data && event.data.size > 0) {
        recordedBlobs.push(event.data);
      }
    };
    mediaSource.addEventListener('sourceopen', () => {
      mediaSource.addSourceBuffer('video/webm; codecs="vp8"');
    }, false);
    try {
      mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp8' });
    } catch (e) {
      console.error('Exception while creating MediaRecorder:', e);
      return;
    }
    console.log('Created MediaRecorder', mediaRecorder);
    mediaRecorder.onstop = (event) => {
      console.log('Recorder stopped: ', event);
    };
    mediaRecorder.ondataavailable = handleDataAvailable;
    mediaRecorder.start(10); // collect 10ms of data
    console.log('MediaRecorder started', mediaRecorder);
  },

  stopRecording: () => {
    mediaRecorder.stop();
    return new Blob(recordedBlobs, { type: 'video/webm' });
  },
};


export default CameraKitWeb;
