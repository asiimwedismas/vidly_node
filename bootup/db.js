const config = require('config');
const mongoose = require('mongoose');

module.exports = function() {
  const db = config.get('db');
  mongoose.
      connect(db, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false}).
      catch(err => console.log(`Error connecting to ${db}... ${err}`));
}