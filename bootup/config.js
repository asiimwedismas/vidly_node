const config = require('config');

module.exports = function() {
  if (!config.get('jwtPrivateKey')) throw new Error('WTF ERROR: jwtPrivateKey is not defined.');
};