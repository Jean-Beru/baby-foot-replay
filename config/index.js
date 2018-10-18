const env = process.env.NODE_ENV || 'prod';

module.exports = require(`./${env}.json`);
