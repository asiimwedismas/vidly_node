const express = require('express');
const Joi = require('joi');
const bcrypt = require('bcrypt');
const {User} = require('../models/user');
const validateReqBody = require('../middleware/validateReqBody');
const router = express.Router();

router.post('/', validateReqBody(validate), async (req, res) => {
  let user = await User.findOne({email: req.body.email});
  if (!user)
    return res.status(400).send('Invalid email or password.');

  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword)
    return res.status(400).send('Invalid email or password.');

  res.send(user.generateAuthToken());
});

function validate(req) {
  const validationSchema = Joi.object({
    email: Joi.string().min(5).max(255).required().email(),
    password: Joi.string().min(5).max(255).required(),
  });

  return validationSchema.validate(req);
}

module.exports = router;