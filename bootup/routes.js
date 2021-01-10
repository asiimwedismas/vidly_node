const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');
const error = require('../middleware/error');

const customersRouter = require('../routes/customers');
const genresRouter = require('../routes/genres');
const moviesRouter = require('../routes/movies');
const rentalsRouter = require('../routes/rentals');
const usersRouter = require('../routes/users');
const returnsRouter = require('../routes/returns');
const authRouter = require('../routes/auth');

module.exports = function(app) {
  app.use(express.json());
  app.use(express.urlencoded({extended: false}));
  app.use(cookieParser());
  app.use(express.static(path.join(__dirname, 'public')));

  app.use('/api/customers', customersRouter);
  app.use('/api/genres', genresRouter);
  app.use('/api/movies', moviesRouter);
  app.use('/api/rentals', rentalsRouter);
  app.use('/api/users', usersRouter);
  app.use('/api/returns', returnsRouter);
  app.use('/api/auth', authRouter);
  app.use(error);
}