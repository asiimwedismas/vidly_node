const logger = require('winston');
require('express-async-errors');

module.exports = function() {
  let consoleLogOptions = {colorize: true, prettyPrint: true};
  let fileLogOptions = {filename: 'uncaughtExceptions.log'};

  logger.exceptions.handle(
      new logger.transports.Console(consoleLogOptions),
      new logger.transports.File(fileLogOptions));
};