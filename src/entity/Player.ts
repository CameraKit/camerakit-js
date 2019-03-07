import { FallbackPlayer, OGVLoader } from "./FallbackPlayer";

export class Player extends FallbackPlayer implements HTMLVideoElement {
  /**
   * Recorder is used to take recordings of the CaptureStream
   * @param {string} [mimeType] - Mime type you plan to be exporting in
   * @returns {HTMLVideoElemement | FallbackPlayer} Appropriate video element that supports requested mimeType
   */
  constructor(mimeType: string = "video/webm") {
    super();

    const videoElem = document.createElement("video");

    if (!videoElem.canPlayType(mimeType)) {
      return new FallbackPlayer();
    }

    return videoElem;
  }
}

export { OGVLoader as Loader };
