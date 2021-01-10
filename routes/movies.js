const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const {Movie, validateMovie} = require('../models/movie');
const {Genre} = require('../models/genre');
const validateObjectID = require('../middleware/validateMongoObjectID');
const validateReqBody = require('../middleware/validateReqBody');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

router.get('/', async function(req, res) {
  res.send(await Movie.find().sort('title'));
});

router.get('/:id', validateObjectID, async (req, res) => {
  const movie = await Movie.findById(req.params.id);
  if (!movie)
    return res.status(404).send('The movie with the given ID was not found.');

  res.send(movie);
});

router.post('/', [auth, admin, validateReqBody(validateMovie)], async (req, res) => {
  const genre = await Genre.findById(req.body.genreId);
  if (!genre)
    return res.status(400).send('Invalid genre.');

  const movie = new Movie({
    title: req.body.title,
    genre: {
      _id: genre._id,
      name: genre.name,
    },
    numberInStock: req.body.numberInStock,
    dailyRentalRate: req.body.dailyRentalRate,
  });
  await movie.save();

  res.send(movie);
});

router.put('/:id', [auth, admin, validateObjectID, validateReqBody(validateMovie)], async (req, res) => {
  let body = req.body;
  const genre = await Genre.findById(body.genreId);
  if (!genre)
    return res.status(400).send('Invalid genre.');

  const movie = await Movie.findByIdAndUpdate(req.params.id,
      {
        title: body.title,
        genre: {
          _id: genre._id,
          name: genre.name,
        },
        numberInStock: body.numberInStock,
        dailyRentalRate: body.dailyRentalRate,
      }, {new: true});

  if (!movie)
    return res.status(404).send('The movie with the given ID was not found.');

  res.send(movie);
});

router.delete('/:id', [auth, admin, validateObjectID], async (req, res) => {
  const movie = await Movie.findByIdAndRemove(req.params.id);

  if (!movie)
    return res.status(404).send('The movie with the given ID was not found.');

  res.send(movie);
});

module.exports = router;