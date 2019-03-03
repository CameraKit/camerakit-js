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
    new CopyPlugin([
      {
        from: "./node_modules/ogv/dist/ogv-*",
        flatten: true
      }
    ])
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
