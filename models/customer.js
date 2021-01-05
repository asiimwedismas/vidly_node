const mongoose = require('mongoose');
const Joi = require('joi');

const customerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 6,
    maxlength: 16,
  },
  isGold: {
    type: Boolean,
    default: false,
  },
  phone: {
    type: String,
    required: true,
    minlength: 6,
    maxlength: 16,
  },
});

const Customer = mongoose.model('Customer', customerSchema);

function validateCustomer(customer) {
  const validationSchema = {
    name: Joi.string().required().min(6).max(16),
    phone: Joi.string().required().min(6).max(16),
    isGold: Joi.boolean(),
  };

  return Joi.validate(customer, validationSchema);
}

module.exports.customerSchema = customerSchema;
module.exports.Customer = Customer;
module.exports.validateCustomer = validateCustomer;