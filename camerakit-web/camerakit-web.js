import adapter from 'webrtc-adapter';

const CameraKitWeb = {};
CameraKitWeb.getDevices = () => {
  return navigator.mediaDevices.enumerateDevices();
};

export default CameraKitWeb;
