# CameraKit Web

## Setup and usage

Install the package:

```
$ npm install camerakit-web
```

Import it in your project

```js
import camerakit from "camerakit-web";

// ...

async function () {
  const devices = await camerakit.getDevices();

  const myStream = await camerakit.createCaptureStream({
    audio: devices.audio[0],
    video: devices.video[0]
  });

  myStream.setResolution({width: 1920, height: 1080});
  const myPicture = myStream.shutter.capture();

  myStream.recorder.start();

  // Wait...

  // Pause the recording & resume
  myRecorder.pause();
  myRecorder.start();

  // Wait some more...

  const recordedVideo = myRecorder.stop(); // Use the video yourself

  myRecorder.downloadLatestRecoring(); // Download the video direct from browser

  // Stop using camera
  myStream.destroy();
}
```

## API documentation

### `camerakit`

| Name                            | Parameters                                   | Return                                                            | Description                                                     |
| ------------------------------- | -------------------------------------------- | ----------------------------------------------------------------- | --------------------------------------------------------------- |
| `camerakit.getDevices`          | none                                         | `Promise<{audio: Array<MediaSource>, video: Array<MediaSource>}>` | Returns available media devices for streaming                   |
| `camerakit.createCaptureStream` | `{audio?: MediaSource, video?: MediaSource}` | `Promise<CaptureStream>`                                          | Creates new `CaptureStream` instance with provided media inputs |

### `CaptureStream`

#### Instance methods

| Name                    | Parameters                                                                             | Return                 | Description                                             |
| ----------------------- | -------------------------------------------------------------------------------------- | ---------------------- | ------------------------------------------------------- |
| `stream.init`           | none                                                                                   | `Promise<void>`        | Initalizes stream and requests permissions from browser |
| `stream.setResolution`  | `{width?: number, height?: number, aspect?: number, source?: "original" \| "preview"}` | `Promise<void>`        | Sets the video resolution of the specified source       |
| `stream.setSource`      | `{audio?: MediaSource, video?: MediaSource, source?: "original" \| "preview"}`         | `Promise<void>`        | Overrides original media inputs for specified source    |
| `stream.getMediaStream` | `{source?: "original" \| "preview"}`                                                   | `Promise<MediaStream>` | Returns raw `MediaStream` for use in video display      |
| `stream.destroy`        | none                                                                                   | `void`                 | Closes all open streams and cancels capture             |

#### Properties

| Name              | Type       |
| ----------------- | ---------- |
| `stream.shutter`  | `Shutter`  |
| `stream.recorder` | `Recorder` |

### `Shutter`

Used for taking photos of the `CaptureStream`.

### Instance methods

| name                            | Parameters                                              | Return    | Description                                           |
| ------------------------------- | ------------------------------------------------------- | --------- | ----------------------------------------------------- |
| `shutter.capture`               | `{source?: "original" \| "preview", save?: boolean}`    | `string`  | Takes and returns picture from specified source       |
| `shutter.captureAndDownload`    | `{source?: "original" \| "preview", filename?: string}` | `boolean` | Calls `capture` and creates file download from result |
| `shutter.downloadLatestCapture` | `filename?: string`                                     | `boolean` | Downloads the last picture taken                      |

### `Recorder`

Used for recording video of the the `CaptureStream`.

### Instance methods

| name                               | Parameters                           | Return    | Description                                                |
| ---------------------------------- | ------------------------------------ | --------- | ---------------------------------------------------------- |
| `recorder.start`                   | `{source?: "original" \| "preview"}` | `void`    | Starts the recording from the specified source             |
| `recorder.stop`                    | none                                 | `?Blob`   | Stops the recording and returns a completed video file     |
| `recorder.pause`                   | none                                 | `void`    | Pauses the recording until resumed with `recorder.start()` |
| `recorder.getLatestRecording`      | none                                 | `?Blob`   | Returns last recorded video file                           |
| `recorder.downloadLatestRecording` | `filename?: string`                  | `boolean` | Creates file download from last video recording            |
| `recorder.setMimeType`             | none                                 | `void`    | Sets the video recording mime type for all sources         |

## License

CameraKit Website is [MIT License](https://github.com/CameraKit/CameraKit-Android/blob/master/LICENSE)
