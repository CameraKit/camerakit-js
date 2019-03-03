import { FallbackPlayer, OGVLoader } from "./FallbackPlayer";

export class Player extends FallbackPlayer implements HTMLVideoElement {
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
