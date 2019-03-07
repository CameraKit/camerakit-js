import * as path from "path";
import * as fs from "fs";
import * as express from "express";
import * as webpackMiddleware from "webpack-dev-middleware";
import * as webpackHotMiddleware from "webpack-hot-middleware";
import * as webpack from "webpack";

const webpackCompiler = webpack(require("./webpack.config.server"));
const port = 3000;

const app = express();

app.use(webpackMiddleware(webpackCompiler));
app.use(webpackHotMiddleware(webpackCompiler));

// Host `ogv` wasm/worker files
app.get("/ogv/*", (req, res) => {
  const fileRegex = /^\/ogv\/([a-zA-Z0-9\-]+\.(wasm|js))$/;
  const match = req.path.match(fileRegex);
  if (match && match[1]) {
    const filePath = path.resolve(
      __dirname,
      "../node_modules/ogv/dist/",
      match[1]
    );

    if (fs.existsSync(filePath)) {
      res.status(200).sendFile(filePath);
      return;
    }
  }

  res.status(404).end();
});

// Host `webm-wasm` wasm/worker files
app.get("/webm/*", (req, res) => {
  const fileRegex = /^\/webm\/([a-zA-Z0-9\-]+\.(wasm|js|(js\.map)))$/;
  const match = req.path.match(fileRegex);
  if (match && match[1]) {
    const filePath = path.resolve(
      __dirname,
      "../node_modules/webm-wasm/dist/",
      match[1]
    );

    if (fs.existsSync(filePath)) {
      res.status(200).sendFile(filePath);
      return;
    }
  }

  res.status(404).end();
});

// Serve main example page
app.get("/*", (req, res) => {
  res.setHeader("Acess-Control-Allow-Origin", "*");
  res.status(200).sendFile(path.resolve(__dirname, "pages/index.html"));
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Sever running at http://localhost:${port}/`);
});
