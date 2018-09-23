const express = require('express');
const serveStatic = require('serve-static');
const videoStitch = require('video-stitch');
const fs = require('fs');

const SCHEME = 'http';
const HOST = 'localhost';
const PORT = 80;
const DEBUG = process.NODE_ENV !== 'prod';

// Server
const app = express();
app.set('views', __dirname + '/templates');
app.set('view engine', 'twig');

// Homepage
app.get('/', function(req, res) {
  res.render('index', {
    title: 'Baby-foot replay',
    replays: [
      { file: '/replay/xxx.mp4', recordedAt: new Date('2018-06-30 16:30:00') },
      { file: '/replay/xxx.mp4', recordedAt: new Date('2018-06-30 16:30:00') },
      { file: '/replay/xxx.mp4', recordedAt: new Date('2018-06-30 16:30:00') },
      { file: '/replay/xxx.mp4', recordedAt: new Date('2018-06-30 16:30:00') },
      { file: '/replay/xxx.mp4', recordedAt: new Date('2018-06-30 16:30:00') },
      { file: '/replay/xxx.mp4', recordedAt: new Date('2018-06-30 16:30:00') },
    ],
  });
});

// Replay
app.get('/replay/:last', function(req, res) {
  const last = req.params.last;
  const videos = fs.readdirSync(__dirname + '/public/video/live');
  const filename = 'video/replay/'+(new Date()).getTime()+'.mp4';

  videoStitch
    .concat({
      silent: !DEBUG,
      overwrite: true,
    })
    .clips(
      videos
        .slice(videos.length - last)
        .map(function(file) {
          return { fileName: `${__dirname}/public/video/live/${file}` };
        })
    )
    .output(__dirname+'/public/'+filename)
    .concat()
    .then(function() {
      res.send(filename);
    })
  ;
});

// Public
app.use(serveStatic(__dirname + '/public/'));

// Start
app.listen(PORT);

console.log(`Server started on ${SCHEME}://${HOST}:${PORT}`);
