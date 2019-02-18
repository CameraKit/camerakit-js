import * as path from "path";
import * as express from "express";
import * as webpackMiddleware from "webpack-dev-middleware";
import * as webpackHotMiddleware from "webpack-hot-middleware";
import * as webpack from "webpack";

const webpackCompiler = webpack(require("./webpack.config.server"));
const port = 3000;

const app = express();

app.use(webpackMiddleware(webpackCompiler));
app.use(webpackHotMiddleware(webpackCompiler));
app.use((req, res) => {
  res.setHeader("Acess-Control-Allow-Origin", "*");
  res.status(200).sendFile(path.resolve(__dirname, "pages/index.html"));
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Sever running at http://localhost:${port}/`);
});
