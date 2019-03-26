declare module "webm-media-recorder" {
  type CustomRecorderOptions = {
    width: number,
    height: number,
    framerate: number
  };

  type WorkerOptions = {
    encoderWorkerFactory?: () => Worker,
    OggOpusEncoderWasmPath?: string,
    WebMOpusEncoderWasmPath?: string,
  };

  class FediaRecorder extends MediaRecorder {
    constructor(
      stream: MediaStream,
      config: MediaRecorderOptions & CustomRecorderOptions,
      workerOptions?: Object
    );
  }

  export = FediaRecorder;
}
