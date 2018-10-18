const spawn = require('child_process').spawn;

let streamProcess;

function start(options = {}, arguments = []) {
  if (streamProcess) {
    return;
  }

  const params = [];

  for (var key in options) {
    params.push(key+' '+options[key]);
  }

  streamProcess = spawn('raspivid', params.concat(arguments));
}

function stop() {
  if (!streamProcess) {
    return;
  }

  streamProcess.kill();
}

module.exports = { start, stop };
