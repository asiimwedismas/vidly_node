const {genreSchema} = require('./genre');
const mongoose = require('mongoose');
const Joi = require('joi');

Joi.objectId = require('joi-objectid')(Joi);

const movieSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    minLength: 6,
    maxLength: 50,
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

const Movie = mongoose.model('Movie', movieSchema);

function validateMovie(movie) {
  const validationSchema = Joi.object({
    title: Joi.string().min(6).max(50).required(),
    genreId: Joi.objectId().required(),
    numberInStock: Joi.number().min(0).max(200).required(),
    dailyRentalRate: Joi.number().min(0).max(200).required(),
  });

  return validationSchema.validate(movie);
}

module.exports.Movie = Movie;
module.exports.movieSchema = movieSchema;
module.exports.validateMovie = validateMovie;