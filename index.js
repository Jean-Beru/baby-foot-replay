const express = require('express');
const serveStatic = require('serve-static');
const videoStitch = require('video-stitch');
const fs = require('fs');
const bodyParser = require('body-parser');
const http = require('http');
const stream = require('./src/stream');

const SCHEME = 'http';
const HOST = 'localhost';
const PORT = 80;
const DEBUG = process.NODE_ENV !== 'prod';
const PUBLIC_FOLDER = __dirname + '/public';
const LIVE_FOLDER = '/video/live';
const REPLAY_FOLDER = '/video/replay';
const SAVE_FOLDER = '/video/save';
const ASSETS_FOLDER = '/assets';

// Server
const app = express();
app.set('views', __dirname + '/templates');
app.set('view engine', 'twig');
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

// Homepage
app.get('/', function(req, res) {
    fs.readdir(PUBLIC_FOLDER + SAVE_FOLDER, function(err, files) {
        res.render('index', {
            title: 'Baby-foot replay',
            replays: files.filter(function (file) {
                return file.match(/.*\.mp4/ig);
            }).map(function(file) {
                return {file: 'video/save/' + file, recordedAt: file.split('.').slice(0, -1).join('.') / 1000};
            }),
        });
    });
});

// Replay
app.get('/replay/:last', function(req, res) {
  const last = req.params.last;
  const videos = fs.readdirSync(PUBLIC_FOLDER + LIVE_FOLDER);
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
          return { fileName: `${PUBLIC_FOLDER + LIVE_FOLDER}/${file}` };
        })
    )
    .output(PUBLIC_FOLDER + '/' + filename)
    .concat()
    .then(function() {
      res.send(filename);
    })
  ;
});

// Save
app.post('/save', function(req, res) {
    const filename = req.body.file.split('/').pop();

    fs.copyFile(`${PUBLIC_FOLDER + REPLAY_FOLDER}/${filename}`, `${PUBLIC_FOLDER + SAVE_FOLDER}/${filename}`, function(error) {
        if (error) {
            res.status(500).json({error});

            return;
        }

        res.status(204).json();
    });
});

// Public
app.use(serveStatic(PUBLIC_FOLDER));

// Assets
app.use(ASSETS_FOLDER+'/bootstrap', express.static(__dirname + '/node_modules/bootstrap/dist/'));
app.use(ASSETS_FOLDER+'/jquery', express.static(__dirname + '/node_modules/jquery/dist/'));
app.use(ASSETS_FOLDER+'/plyr', express.static(__dirname + '/node_modules/plyr/dist/'));
app.use(ASSETS_FOLDER+'/socket.io', express.static(__dirname + '/node_modules/socket.io-client/dist/'));

// Start server
const server = http.createServer(app).listen(PORT);
console.log(`Server started on ${SCHEME}://${HOST}:${PORT}`);

// Start stream
const io = require('socket.io')(server);

let connectedUsers = 0;
io.on('connection', function(socket) {
  console.log('Incoming connection');

  connectedUsers++;

  stream.start();

  socket.on('disconnect', function () {
    console.log('Connection lost');
    connectedUsers--;

    if (connectedUsers <= 0) {
      stream.stop();
    }
  });
});
