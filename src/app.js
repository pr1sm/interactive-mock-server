const express = require('express');
const cors = require('cors');
const path = require('path');

const setupApiRoutes = require('./routes/api');
const Store = require('./store');

const PORT = process.env.PORT || 9000;

function startMockServer() {
  const app = express();
  const store = new Store();

  app.use(cors());
  app.use(express.json());
  app.use(/\/__dashboard.*/, (req, res) => {
    const whitelist = ['.js', '.css', '.html'];
    if (whitelist.every(e => !new RegExp(`${e}/?`).test(req.baseUrl))) {
      res.sendFile(path.resolve(__dirname, '..', 'dist', '__dashboard', 'index.html'));
      return;
    }
    res.sendFile(path.resolve(__dirname, '..', 'dist', req.baseUrl.substring(1)));
  });

  setupApiRoutes(app, store);

  // Setup final handler for defaulting to 404s
  app.use('*', (req, res) => {
    res.status(404);

    if (req.accepts('html')) {
      res.set('Content-Type', 'text/html');
      res.send('404 Not Found').end();
      return;
    }
    if (req.accepts('json')) {
      res.send({ error: 'Not Found', status: 404 }).end();
      return;
    }

    res
      .type('txt')
      .send('404 Not Found')
      .end();
  });

  const listener = app.listen(PORT, () => {
    console.log(`Interactive Mock Server started on port ${listener.address().port}`);
  });

  return [app, store];
}

module.exports = startMockServer;
