const logger = require('winston');

module.exports = function(err, req, res) {
  logger.error(err.message, err);
  res.status(500).send('Internal server error.');
};