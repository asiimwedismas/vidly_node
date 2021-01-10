const config = require('config');
const mongoose = require('mongoose');
const logger = require('winston');

module.exports = function() {
  const db = config.get('db');
  let options = {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false};
  mongoose.connect(db, options).catch(err => logger.error(`Error connecting to ${db}... ${err}`));
};