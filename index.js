const express = require('express');
const serveStatic = require('serve-static');
const fs = require('fs');
const bodyParser = require('body-parser');
const http = require('http');
const stream = require('./src/stream');
const execSync = require('child_process').execSync;

const SCHEME = 'http';
const HOST = 'localhost';
const PORT = 8080;
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
  const videos = fs.readdirSync(PUBLIC_FOLDER + LIVE_FOLDER).filter(function (file) {
      return file.match(/.*\.h264/ig);
  });
  const outputFile = 'video/replay/'+(new Date()).getTime()+'.mp4';

  try {
    const command = 'MP4Box -add '+videos
      .slice(videos.length - last)
      .map(function(file) {
        return `${PUBLIC_FOLDER + LIVE_FOLDER}/${file}`;
      })
      .join(' -cat ')+' '+PUBLIC_FOLDER+'/'+outputFile;
    execSync(command);

    res.send(outputFile);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
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

  stream.start(PUBLIC_FOLDER + LIVE_FOLDER + '/%d.h264');

  socket.on('disconnect', function () {
    console.log('Connection lost');
    connectedUsers--;

    if (connectedUsers <= 0) {
      stream.stop();
    }
  });
});
