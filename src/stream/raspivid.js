const spawn = require('child_process').spawn;

let streamProcess;

function start(filename) {
  if (streamProcess) {
    return;
  }

  streamProcess = spawn('raspivid', ['--segment', 5000, '--wrap', 5, '-t', 0, '-o', filename]);
}

function stop() {
  if (!streamProcess) {
    return;
  }

  streamProcess.kill();
}

module.exports = { start, stop };
