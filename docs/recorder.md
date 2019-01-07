# `Recorder`

Used to create video recordings given a media stream.

### Example usage

```js
import * as CameraKitWeb from "camerakit-web";

const stream = // ... Setup & get devices here

const recorder = new CameraKitWeb.Recorder(stream);
recorder.startRecording();

// Video recording...


const videoBuffer = recorder.stopRecording();
```
