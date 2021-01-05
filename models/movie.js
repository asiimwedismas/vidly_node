const Joi = require('joi');
const mongoose = require('mongoose');
const {genreSchema} = require('./genre');

const movieSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    min: 6,
    max: 200,
  },
  genre: {
    type: genreSchema,
    required: true,
  },
  numberInStock: {
    type: Number,
    required: true,
    min: 0,
    max: 200,
  },
  dailyRentalRate: {
    type: Number,
    required: true,
    min: 0,
    max: 200,
  },
});

const Movie = mongoose.model("Movie", movieSchema);

function validateMovie(movie) {
  const validationSchema = {
    title: Joi.string().min(6).max(200).required(),
    genreId: Joi.objectId().required(),
    numberInStock: Joi.number().min(0).max(200).required(),
    dailyRentalRate: Joi.number().min(0).max(200).required(),
  }

  return Joi.validate(movie, validationSchema);
}

module.exports.Movie = Movie;
module.exports.movieSchema = movieSchema;
module.exports.validateMovie = validateMovie;