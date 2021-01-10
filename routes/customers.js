const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const {Customer, validateCustomer} = require('../models/customer');
const validateReqBody = require('../middleware/validateReqBody');
const validateObjectID = require('../middleware/validateMongoObjectID');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

router.get('/', async (req, res) => {
  res.send(await Customer.find().sort('name'));
});

router.get('/:id', validateObjectID, async (req, res) => {
  const id = req.params.id;
  const customer = await Customer.findById(id);
  if (!customer)
    return res.status(404).send(`customer with id ${id} doesn't exist`);

  res.send(customer);
});

router.post('/', validateReqBody(validateCustomer), async (req, res) => {
  const customer = await new Customer(req.body).save();
  res.send(customer);
});

router.put('/:id', [auth, validateObjectID, validateReqBody(validateCustomer)], async (req, res) => {
  let customerID = req.params.id;
  const customer = await Customer.findByIdAndUpdate(
      customerID,
      {
        name: req.body.name,
        phone: req.body.phone,
        isGold: req.body.isGold || false,
      },
      {new: true});

  if (!customer)
    return res.status(404).send(`Customer with id does not exist`);

  res.send(customer);
});

router.delete('/:id', [auth, validateObjectID], async (req, res) => {
  const id = req.params.id;
  const customer = await Customer.findByIdAndRemove(id);

  if (!customer)
    return res.status(404).send(`No customer with id ${id}`);

  res.send(customer);
});

module.exports = router;