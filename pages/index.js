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
    }
  }

  getDevices = () => {
    CameraKitWeb.getDevices().then(({ audioSources, videoSources }) => {
      this.setState({ audioSources, videoSources });
    }).catch(error => console.log(error));
  };

  requestCamera = () => {
    CameraKitWeb.initializeCamera({
      videoElement: this.video,
      audioDeviceId: this.audioSource.value,
      videoDeviceId: this.videoSource.value,
    });
  }

  takePicture = () => {
    this.setState({
      imageTaken: true,
      image: CameraKitWeb.takePicture({
        videoElement: this.video,
      }),
    }, this.showPicture);
  }

  showPicture = () => {
    console.log(this.imageContainer);
    this.imageContainer.src = this.state.image;
  }

  downloadPicture = () => {
    const a = document.createElement('a');
    a.download = `CKW-${new Date}`;
    a.href = this.state.image;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  render() {
    return (
      <div>
        <button onClick={this.getDevices}>Get Audio/Video Devices</button>
        <select ref={select => this.audioSource = select} >
          {
            this.state.audioSources.map(source => (
              <option key={source.label} value={source.device.deviceId}>{source.label}</option>
            ))
          }
        </select>
        <select ref={select => this.videoSource = select }>
          {
            this.state.videoSources.map(source => (
              <option key={source.label} value={source.device.deviceId}>{source.label}</option>
            ))
          }
        </select>
        <br />
        <button onClick={this.requestCamera}>Request Audio/Video Stream</button>
        <video ref={video => (this.video = video)}></video>
        <br />
        <button onClick={this.takePicture}>Take Picture</button>
        {this.state.imageTaken && (<img ref={img => this.imageContainer = img}></img>)}
        {this.state.imageTaken && (<button onClick={this.downloadPicture}>Download Image</button>)}
      </div>
    );
  }
}

export default Example;
