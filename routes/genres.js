const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const {Genre, validateGenre} = require('../models/genre');
const validateObjectID = require('../middleware/validateMongoObjectID');
const validateReqBody = require('../middleware/validateReqBody');

router.get('/', async (req, res) => {
  res.send(await Genre.find().sort('name'));
});

router.get('/:id', validateObjectID, async (req, res) => {
  const genre = await Genre.findById(req.params.id);
  if (!genre) return res.status(404).
      send('The genre with the given ID was not found.');

  res.send(genre);
});

router.post('/', [auth, validateReqBody(validateGenre)], async (req, res) => {
  const genre =await  new Genre({name: req.body.name}).save();
  res.send(genre);
});

router.put('/:id', [auth, validateObjectID, validateReqBody(validateGenre)], async (req, res) => {
  const genre = await Genre.findByIdAndUpdate(req.params.id,{name: req.body.name}, {new: true});

  if (!genre) return res.status(404).
      send('The genre with the given ID was not found.');

  res.send(genre);
});

router.delete('/:id', [auth, admin, validateObjectID], async (req, res) => {
  const genre = await Genre.findByIdAndRemove(req.params.id);

  if (!genre) return res.status(404).
      send('The genre with the given ID was not found.');

  res.send(genre);
});

module.exports = router;