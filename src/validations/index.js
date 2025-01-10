const Joi = require("joi");

exports.createUser = Joi.object({
  name: Joi.string().required(),
  church: Joi.string().required(),
  image: Joi.string(),
  email: Joi.string().email().required(),
  phone: Joi.string().required(),
  address: Joi.string().required(),
});

exports.updateUser = Joi.object({
  name: Joi.string(),
  church: Joi.string(),
  image: Joi.string(),
  email: Joi.string().email(),
  phone: Joi.string(),
  address: Joi.string(),
});

exports.signup = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  phone: Joi.string().required(),
  password: Joi.string().required(),
  image: Joi.string(),
});

exports.login = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});
