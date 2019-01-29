const webpack = require("webpack");
const path = require("path");

module.exports = {
  mode: "development",
  entry: [path.resolve(__dirname, "index.tsx")],
  output: {
    filename: "bundle.js",
    path: "/",
    publicPath: "/"
  },
  devtool: "source-map",
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx"],
    alias: {
      Test$: path.resolve(__dirname, "../dist/compiled/index.js")
    }
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/
      }
    ]
  },
  stats: {
    colors: true
  }
};
