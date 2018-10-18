module.exports = function Stream(config) {
  const module = require('./'+config.module);

  this.start = function() { return module.start(config.options, config.arguments); };
  this.stop = module.stop;
};
