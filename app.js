const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const config = require('config');
const mongoose = require('mongoose');

const db = config.get('db');
mongoose.
    connect(db, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false}).
    catch(err => console.log(`Error connecting to ${db}... ${err}`));

const customersRouter = require('./routes/customers');
const genresRouter = require('./routes/genres');
const moviesRouter = require('./routes/movies');
const rentalsRouter = require('./routes/rentals');
const usersRouter = require('./routes/users');

const app = express();

if (app.get('env') === 'development') app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/customers', customersRouter);
app.use('/api/genres', genresRouter);
app.use('/api/movies', moviesRouter);
app.use('/api/rentals', rentalsRouter);
app.use('/api/users', usersRouter);

module.exports = app;