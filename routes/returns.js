const Joi = require('joi');
const validateReqBody = require('../middleware/validateReqBody');
const {Rental} = require('../models/rental');
const {Movie} = require('../models/movie');
const auth = require('../middleware/auth');
const express = require('express');
const router = express.Router();

router.post('/', [auth, validateReqBody(validateReturn)], async (req, res) => {
  const rental = await Rental.lookup(req.body.customerId, req.body.movieId);

  if (!rental) return res.status(404).send('Rental not found.');
  if (rental.dateReturned) return res.status(400).send('Return already processed.');

  rental.processReturn();
  await rental.save();
  await Movie.findOneAndUpdate({_id: rental.movie._id}, {
    $inc: {numberInStock: 1},
  });

  return res.send(rental);
});

function validateReturn(req) {
  const validationSchema = Joi.object({
    customerId: Joi.objectId().required(),
    movieId: Joi.objectId().required(),
  });

  return validationSchema.validate(req);
}

module.exports = router;