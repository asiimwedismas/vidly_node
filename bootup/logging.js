const logger = require('morgan');

module.exports = function(app) {
  if (app.get('env') === 'development') app.use(logger('dev'));
}