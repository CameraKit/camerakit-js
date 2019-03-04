// TODO: Write (and publish?) full typings for ogv
declare module "ogv" {
  class OGVPlayer extends HTMLVideoElement {}
  class OGVLoader {
    static base: string;
  }
}
