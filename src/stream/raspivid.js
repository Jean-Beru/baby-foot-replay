const spawn = require('child_process').spawn;

let streamProcess;

function start() {
  if (streamProcess) {
    return;
  }

  streamProcess = spawn('raspivid', ['--segment 5000', '--wrap 5', '-t 0', '-o %d.h264']);
}

function stop() {
  if (!streamProcess || !streamProcess.connected) {
    return;
  }

  streamProcess.disconnect();
}

module.exports = { start, stop };
