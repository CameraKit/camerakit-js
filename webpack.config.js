const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  entry: "./src/index.ts",
  mode: process.env.NODE_ENV === "production" ? "production" : "development",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/
      }
    ]
  },
  plugins: [
    new CopyPlugin(
      [
        "ogv-worker-video.js",
        "ogv-demuxer-webm-wasm*",
        "ogv-decoder-video-vp8-wasm*"
      ]
        .map(f => ({
          from: "./node_modules/ogv/dist/" + f,
          flatten: true
        }))
        .concat(
          ["encoderWorker.umd.js", "WebMOpusEncoder.wasm"].map(f => ({
            from: "./node_modules/webm-media-recorder/" + f,
            flatten: true
          }))
        )
    )
  ],
  resolve: {
    extensions: [".tsx", ".ts", ".js"]
  },
  output: {
    filename: "browser.min.js",
    path: path.resolve(__dirname, "dist/browser"),
    library: "camerakit"
  }
};
