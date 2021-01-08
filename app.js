const express = require('express');
const app = express();

require('./bootup/logging')(app);
require('./bootup/routes')(app);
require('./bootup/db')();
// require('./bootup/config')();

module.exports = app;