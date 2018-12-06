import React from 'react';
import CameraKitWeb from 'camerakit-web';

class Example extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      audioSources: [],
      videoSources: [],
      image: undefined,
      imageTaken: false,
      stream: undefined,
      videoTaken: undefined,
    };
  }

  handleError = (error) => {
    console.log('Error: ', error);
  }

  getDevices = () => {
    CameraKitWeb.getDevices().then(({ audioSources, videoSources }) => {
      this.setState({ audioSources, videoSources });
    }).catch(this.handleError);
  };

  gotStream = (stream) => {
    this.setState({ stream });
    this.src.srcObject = stream;
    this.src.play();
  };

  requestCamera = () => {
    CameraKitWeb.initializeCamera({
      audioDeviceId: this.audioSource.value,
      videoDeviceId: this.videoSource.value,
    }).then(this.gotStream).catch(this.handleError);
  }

  takePicture = () => {
    this.setState({
      imageTaken: true,
      image: CameraKitWeb.takePicture({
        videoElement: this.src,
      }),
    }, this.showPicture);
  }

  showPicture = () => {
    const { image } = this.state;
    this.imageContainer.src = image;
  }

  downloadPicture = () => {
    const a = document.createElement('a');
    const { image } = this.state;
    a.download = `CKW-${new Date()}`;
    a.href = image;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  startRecording = () => {
    const { stream } = this.state;
    CameraKitWeb.startRecording({ stream });
    this.setState({ recording: true });
  }

  stopRecording = () => {
    const buffer = CameraKitWeb.stopRecording();
    this.setState({ video: buffer, recording: false, videoTaken: true }, () => {
      const { video } = this.state;
      this.out.src = null;
      this.out.srcObject = null;
      this.out.src = window.URL.createObjectURL(video);
      this.out.controls = true;
      this.out.play();
    });
  }

  downloadVideo = () => {
    const a = document.createElement('a');
    const { video } = this.state;
    a.download = `CKW-${new Date()}`;
    a.href = window.URL.createObjectURL(video);
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  render() {
    const {
      audioSources, videoSources, imageTaken, recording, videoTaken,
    } = this.state;
    return (
      <div>
        <button type="button" onClick={this.getDevices}>Get Audio/Video Devices</button>
        <select ref={(select) => { this.audioSource = select; }}>
          {
            audioSources.map(source => (
              <option key={source.label} value={source.device.deviceId}>{source.label}</option>
            ))
          }
        </select>
        <select ref={(select) => { this.videoSource = select; }}>
          {
            videoSources.map(source => (
              <option key={source.label} value={source.device.deviceId}>{source.label}</option>
            ))
          }
        </select>
        <br />
        <button type="button" onClick={this.requestCamera}>Request Audio/Video Stream</button>
        <video ref={(video) => { this.src = video; }} />
        <br />
        <button type="button" onClick={this.takePicture}>Take Picture</button>
        {imageTaken && (<img alt="capture of webcam screen" ref={(img) => { this.imageContainer = img; }} />)}
        {imageTaken && (<button type="button" onClick={this.downloadPicture}>Download Image</button>)}
        <br />
        <button type="button" disabled={recording} onClick={this.startRecording}>Start Recording</button>
        <button type="button" disabled={!recording} onClick={this.stopRecording}>Stop Recording</button>
        {videoTaken && (<video ref={(video) => { this.out = video; }} />)}
        {videoTaken && (<button type="button" disabled={recording} onClick={this.downloadVideo}>Download Video</button>)}
      </div>
    );
  }
}

export default Example;
