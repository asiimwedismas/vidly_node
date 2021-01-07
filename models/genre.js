const mongoose = require('mongoose');
const Joi = require('joi');

const genreSchema = new mongoose.Schema({
  name: {
    required: true,
    minlength: 6,
    maxlength: 16,
    type: String,
  },
});

const Genre = mongoose.model('Genre', genreSchema);

function validateGenre(genre) {
  const validationSchema = Joi.object(
      {name: Joi.string().min(6).max(16).required()});
  return validationSchema.validate(genre);
};

module.exports.genreSchema = genreSchema;
module.exports.Genre = Genre;
module.exports.validateGenre = validateGenre;
