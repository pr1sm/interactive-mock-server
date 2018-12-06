const express = require('express');
const cors = require('cors');
const path = require('path');

const setupApiRoutes = require('./routes/api');

const PORT = process.env.PORT || 9000;
const app = express();

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

setupApiRoutes(app);

app.listen(PORT);
