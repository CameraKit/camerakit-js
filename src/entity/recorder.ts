export class Recorder {
  private recordedBlobs: Array<Blob>;
  private mediaRecorder: MediaRecorder;
  private stream: MediaStream;

  constructor(stream: MediaStream) {
    this.stream = stream;
  }

  public startRecording() {
    const mediaSource = new MediaSource();
    this.recordedBlobs = [];

    const handleDataAvailable = (event: BlobEvent) => {
      if (event.data && event.data.size > 0) {
        this.recordedBlobs.push(event.data);
      }
    };
    mediaSource.addEventListener(
      "sourceopen",
      () => {
        mediaSource.addSourceBuffer('video/webm; codecs="vp8"');
      },
      false
    );
    try {
      this.mediaRecorder = new MediaRecorder(this.stream, {
        mimeType: "video/webm;codecs=vp8"
      });
    } catch (e) {
      console.error("Exception while creating MediaRecorder:", e);
      return;
    }
    console.log("Created MediaRecorder", this.mediaRecorder);
    this.mediaRecorder.onstop = (event: Object) => {
      console.log("Recorder stopped: ", event);
    };
    this.mediaRecorder.ondataavailable = handleDataAvailable;
    this.mediaRecorder.start(10); // collect 10ms of data
    console.log("MediaRecorder started", this.mediaRecorder);
  }

  public stopRecording(): Blob {
    this.mediaRecorder.stop();
    return new Blob(this.recordedBlobs, { type: "video/webm" });
  }
}
