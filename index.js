const express = require('express');
const serveStatic = require('serve-static');

const SCHEME = 'http';
const HOST = 'localhost';
const PORT = 1664;

// Server
const app = express();
app.set('views', __dirname + '/templates');
app.set('view engine', 'hjs');

// Homepage
app.get('/', function(req, res) {
  res.render('index', { title: 'Baby-foot replay', message: 'Welcome !' });
});

// Replay
app.get('/replay/:last', function(req, res) {
  const last = req.params.last || 5;

  res.send(last);
});

// Public
app.use(serveStatic(__dirname + '/public/'));

// Start
app.listen(PORT);

console.log(`Server started on ${SCHEME}://${HOST}:${PORT}`);
