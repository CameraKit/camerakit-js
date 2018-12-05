import React from 'react';
import CameraKitWeb from 'camerakit-web';

class Example extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      audioSources: [],
      videoSources: [],
    }
  }

  componentDidMount() {
    CameraKitWeb.getDevices().then((devices) => {
      devices.forEach(device => {
        switch(device.kind) {
          case 'audioinput':
            this.setState({ audioSources: [...this.state.audioSources, { device, label: device.label || `audioinput` }] });
            break;
          case 'videoinput':
            this.setState({ videoSources: [...this.state.videoSources, { device, label: device.label || `videoinput` }] });
        }
      });
    });
  }

  render() {
    return (
      <div>
        <select>
          {
            this.state.audioSources.map(source => (
              <option>{source.label}</option>
            ))
          }
        </select>
        <select>
          {
            this.state.videoSources.map(source => (
              <option>{source.label}</option>
            ))
          }
        </select>
      </div>
    );
  }
}

export default Example;
