const stream = process.env.NODE_ENV === 'dev' ? require('./dummy') : require('./raspivid');

module.exports = stream;
