const { createServer } = require('http');
const express = require('express');
const enforce = require('express-sslify');
const next = require('next');
const bodyParser = require('body-parser');

const port = parseInt(process.env.PORT, 10) || 3000;
const dev = true;
const app = next({ dev });
const handle = app.getRequestHandler();

const handleResponse = (req, res) => {
  handle(req, res);
};

const handleError = (err) => {
  if (err) throw err;
  console.log(`Ready on localhost:${port}`);
};

app.prepare().then(() => {
  const expressApp = express();
  expressApp.use(bodyParser.urlencoded({ extended: false }));
  expressApp.use(bodyParser.json());

  if (!dev) {
    expressApp.use(enforce.HTTPS({ trustProtoHeader: true }));
    console.log('Using enforced https;');
  }

  expressApp.use(handleResponse);

  createServer(expressApp).listen(port, handleError);
});
