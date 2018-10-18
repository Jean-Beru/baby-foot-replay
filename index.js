const express = require('express');
const serveStatic = require('serve-static');
const fs = require('fs');
const bodyParser = require('body-parser');
const http = require('http');
const execSync = require('child_process').execSync;
const Stream = require('./src/stream');
const config = require('./config');

// Const
const FOLDER_PUBLIC = __dirname + config.folder.public;
const FOLDER_LIVE = FOLDER_PUBLIC + config.folder.live;
const FOLDER_REPLAY = FOLDER_PUBLIC + config.folder.replay;
const FOLDER_SAVE = FOLDER_PUBLIC + config.folder.save;
const FOLDER_ASSETS = config.folder.assets;

// Server
const app = express();
app.set('views', __dirname + '/templates');
app.set('view engine', 'twig');
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

// Homepage
app.get('/', function(req, res) {
    fs.readdir(FOLDER_SAVE, function(err, files) {
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
  const videos = fs.readdirSync(FOLDER_LIVE).filter(function (file) {
      return file.match(/.*\.h264/ig);
  });
  const outputFile = 'video/replay/'+(new Date()).getTime()+'.mp4';

  try {
    const command = 'MP4Box -add '+videos
      .slice(videos.length - last)
      .map(function(file) {
        return `${FOLDER_LIVE}/${file}`;
      })
      .join(' -cat ')+' '+FOLDER_PUBLIC+'/'+outputFile;
    execSync(command);

    res.send(outputFile);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// Save
app.post('/save', function(req, res) {
    const filename = req.body.file.split('/').pop();

    fs.copyFile(`${FOLDER_REPLAY}/${filename}`, `${FOLDER_SAVE}/${filename}`, function(error) {
        if (error) {
            res.status(500).json({error});

            return;
        }

        res.status(200).json({file: `${SAVE_FOLDER}/${filename}`, recordedAt: filename.split('.').slice(0, -1).join('.') / 1000});
    });
});

// Public
app.use(serveStatic(FOLDER_PUBLIC));

// Assets
app.use(FOLDER_ASSETS+'/bootstrap', express.static(__dirname + '/node_modules/bootstrap/dist/'));
app.use(FOLDER_ASSETS+'/jquery', express.static(__dirname + '/node_modules/jquery/dist/'));
app.use(FOLDER_ASSETS+'/plyr', express.static(__dirname + '/node_modules/plyr/dist/'));
app.use(FOLDER_ASSETS+'/socket.io', express.static(__dirname + '/node_modules/socket.io-client/dist/'));

// Start server
const server = http.createServer(app).listen(config.server.port);
console.log(`Server started on port ${config.server.port}`);

// Start stream
const io = require('socket.io')(server);


const stream = new Stream(config.stream);
let connectedUsers = 0;

io.on('connection', function(socket) {
  console.log('Incoming connection');

  stream.start();

  connectedUsers++;

  socket.on('disconnect', function () {
    console.log('Connection lost');
    connectedUsers--;

    if (connectedUsers <= 0) {
      stream.stop();
    }
  });
});
