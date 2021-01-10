const express = require('express');
const app = express();

require('./bootup/logging')();
require('./bootup/config')();
require('./bootup/db')();
require('./bootup/routes')(app);

module.exports = app;