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
      videoCaptured: false,
      capturedVideo: undefined,
      imageCaptured: false,
      capturedImage: undefined,
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

  videoCaptured = (event) => {
    this.setState({ capturedVideo: event.target.files[0], videoCaptured: true }, () => {
      const { capturedVideo } = this.state;
      this.captureOut.controls = true;
      this.captureOut.src = null;
      this.captureOut.srcObject = null;
      this.captureOut.src = window.URL.createObjectURL(capturedVideo);
    });
  }

  imageCaptured = (event) => {
    this.setState({ capturedImage: event.target.files[0], imageCaptured: true }, () => {
      const { capturedImage } = this.state;

      const reader = new FileReader();

      reader.onload = (e) => {
        this.imageCapture.src = e.target.result;
      };
      reader.readAsDataURL(capturedImage);
    });
  }

  downloadCapturedImage = () => {
    const a = document.createElement('a');
    const { capturedImage } = this.state;
    const img = new Blob([capturedImage], { type: 'image/png' });
    a.download = `CKW-${new Date()}`;
    a.href = window.URL.createObjectURL(img);
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  downloadCapturedVideo = () => {
    const a = document.createElement('a');
    const { capturedVideo } = this.state;
    const video = new Blob([capturedVideo], { type: 'video/mp4' });
    a.download = `CKW-${new Date()}`;
    a.href = window.URL.createObjectURL(video);
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  render() {
    const {
      audioSources, videoSources, imageTaken, recording, videoTaken, videoCaptured, imageCaptured
    } = this.state;
    return (
      <div>
        <p>Choose a connected audio/video device or use default</p>
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
        <p>Start streaming selected devices</p>
        <button type="button" onClick={this.requestCamera}>Request Stream</button>
        <br />
        <video width="200" ref={(video) => { this.src = video; }} />
        <br />
        <p>Take a snapshot of the stream</p>
        <button type="button" onClick={this.takePicture}>Take Snapshot</button>
        {imageTaken && (<button type="button" onClick={this.downloadPicture}>Download Image</button>)}
        <br />
        {imageTaken && (<img width="200" alt="capture of webcam screen" ref={(img) => { this.imageContainer = img; }} />)}
        <br />
        <p>Record the stream (will not record on safari/ios)</p>
        <button type="button" disabled={recording} onClick={this.startRecording}>Start Recording</button>
        <button type="button" disabled={!recording} onClick={this.stopRecording}>Stop Recording</button>
        {videoTaken && (<button type="button" disabled={recording} onClick={this.downloadVideo}>Download Video</button>)}
        <br />
        {videoTaken && (<video width="200" ref={(video) => { this.out = video; }} />)}
        <br />
        <p>Fallbacks for iOS/mobile:</p>
        <p>Take picture (mobile)</p>
        <input ref={(input) => { this.input = input; }} onChange={this.imageCaptured} type="file" accept="image/*;capture=camcorder" />
        {imageCaptured && (<button type="button" onClick={this.downloadCapturedImage}>Download Image</button>)}
        <br />
        {imageCaptured && (<img width="200" ref={(img) => { this.imageCapture = img; }} />)}
        <br />
        <p>Record video (mobile)</p>
        <input ref={(input) => { this.input = input; }} onChange={this.videoCaptured} type="file" accept="video/*;capture=camcorder" />
        {videoCaptured && (<button type="button" onClick={this.downloadCapturedVideo}>Download Video</button>)}
        <br />
        {videoCaptured && (<video width="200" autoplay loop ref={(video) => { this.captureOut = video; }} />)}
        <br />

      </div>
    );
  }
}

export default Example;
