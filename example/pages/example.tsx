import * as React from "react";
import * as CameraKitWeb from "../../src";
import { CaptureStream, CaptureSource } from "../../src";

type Props = {};

type State = {
  audioSources: Array<CaptureSource>;
  videoSources: Array<CaptureSource>;
  image: string | undefined;
  imageTaken: boolean;
  stream: CaptureStream | undefined;
  video: Blob | undefined;
  videoTaken: boolean;
  audio: Blob | null;
  recording: boolean;
};

class Example extends React.Component {
  state: State;

  audioSource: HTMLSelectElement | null;
  videoSource: HTMLSelectElement | null;
  src: HTMLVideoElement | null;
  out: HTMLVideoElement | null;
  imageContainer: HTMLImageElement | null;

  constructor(props: Props) {
    super(props);
    this.state = {
      audioSources: [],
      videoSources: [],
      image: undefined,
      imageTaken: false,
      stream: undefined,
      video: undefined,
      videoTaken: false,
      audio: null,
      recording: false
    };

    CameraKitWeb.Loader.base = "/ogv";
    const videoElem = new CameraKitWeb.Player();
    this.out = videoElem;
  }

  handleError = (error: Error) => {
    console.log("Error: ", error.toString());
  };

  getDevices = () => {
    CameraKitWeb.getDevices()
      .then(({ video, audio }) => {
        this.setState({ videoSources: video, audioSources: audio });
      })
      .catch(this.handleError);
  };

  gotStream = (stream: CaptureStream) => {
    if (!this.src) return;
    this.setState({ stream });
    this.src.srcObject = stream.getMediaStream();
    this.src.play();
    this.src.muted = true;
  };

  requestCamera = () => {
    let { videoSources, audioSources, stream } = this.state;
    if (stream) {
      stream.destroy();
    }

    if (!this.videoSource || !this.audioSource) return;

    CameraKitWeb.createCaptureStream({
      video: videoSources.find(
        (s: CaptureSource) =>
          s.device.deviceId === (this.videoSource || { value: "" }).value
      ),
      audio: audioSources.find(
        (s: CaptureSource) =>
          s.device.deviceId === (this.audioSource || { value: "" }).value
      ),
      fallbackConfig: {
        base: "/webm"
      }
    })
      .then(this.gotStream)
      .catch(this.handleError);
  };

  takePicture = () => {
    let { stream } = this.state;
    if (!stream) return;
    this.setState(
      {
        imageTaken: true,
        image: stream.shutter.capture()
      },
      this.showPicture
    );
  };

  showPicture = () => {
    const { image } = this.state;
    if (!image || !this.imageContainer) return;
    this.imageContainer.src = image;
  };

  downloadPicture = () => {
    let { stream } = this.state;
    if (!stream) return;
    stream.shutter.downloadLatestCapture();
  };

  startRecording = async () => {
    const { stream } = this.state;
    if (!stream) return;
    await stream.recorder.start();
    this.setState({ recording: true });
  };

  stopRecording = async () => {
    let { stream } = this.state;
    if (!stream) return;
    const [buffer, audioBuffer] = await stream.recorder.stop();
    this.setState(
      { video: buffer, audio: audioBuffer, recording: false, videoTaken: true },
      () => {
        const { video } = this.state;
        if (!video || !this.out) return;
        this.out.src = "";
        this.out.srcObject = null;
        this.out.src = window.URL.createObjectURL(video);
        this.out.controls = true;
        this.out.width = 200;
        this.out.height = 150;
        this.out.play();
      }
    );
  };

  downloadVideo = () => {
    let { stream } = this.state;
    if (!stream) return;
    stream.recorder.downloadLatestRecording();
  };

  render() {
    const {
      audioSources,
      videoSources,
      imageTaken,
      recording,
      videoTaken
    } = this.state;
    return (
      <div>
        <p>Choose a connected audio/video device or use default</p>
        <button type="button" onClick={this.getDevices}>
          Get Audio/Video Devices
        </button>
        <select
          ref={select => {
            this.audioSource = select;
          }}
        >
          {audioSources.map(source => (
            <option key={source.label} value={source.device.deviceId}>
              {source.label}
            </option>
          ))}
        </select>
        <select
          ref={select => {
            this.videoSource = select;
          }}
        >
          {videoSources.map(source => (
            <option key={source.label} value={source.device.deviceId}>
              {source.label}
            </option>
          ))}
        </select>
        <br />
        <p>Start streaming selected devices</p>
        <button type="button" onClick={this.requestCamera}>
          Request Stream
        </button>
        <br />
        <video
          playsInline
          autoPlay
          width="200"
          ref={video => {
            this.src = video;
          }}
        />
        <br />
        <p>Take a snapshot of the stream</p>
        <button type="button" onClick={this.takePicture}>
          Take Snapshot
        </button>
        {imageTaken && (
          <button type="button" onClick={this.downloadPicture}>
            Download Image
          </button>
        )}
        <br />
        {imageTaken && (
          <img
            width="200"
            alt="capture of webcam screen"
            ref={img => {
              this.imageContainer = img;
            }}
          />
        )}
        <br />
        <p>Record the stream (will not record on safari/ios)</p>
        <button
          type="button"
          disabled={recording}
          onClick={this.startRecording}
        >
          Start Recording
        </button>
        <button
          type="button"
          disabled={!recording}
          onClick={this.stopRecording}
        >
          Stop Recording
        </button>
        {videoTaken && (
          <button
            type="button"
            disabled={recording}
            onClick={this.downloadVideo}
          >
            Download Video
          </button>
        )}
        <br />

        {videoTaken && (
          <div
            ref={ref => {
              if (this.out && ref) {
                ref.appendChild(this.out);
              }
            }}
          />
        )}
      </div>
    );
  }
}

export default Example;
