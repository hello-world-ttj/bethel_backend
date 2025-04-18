const Joi = require("joi");

exports.createUser = Joi.object({
  name: Joi.string().required(),
  regNo: Joi.string().required(),
  church: Joi.string().required(),
  image: Joi.string(),
  email: Joi.string().email(),
  phone: Joi.string(),
  address: Joi.string().required(),
  pincode: Joi.string(),
  nativePlace: Joi.string()
});

exports.updateUser = Joi.object({
  name: Joi.string(),
  church: Joi.string(),
  image: Joi.string(),
  email: Joi.string().email(),
  phone: Joi.string(),
  address: Joi.string(),
  pincode: Joi.string(),
  nativePlace: Joi.string(),
});

exports.signup = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().required(),
  password: Joi.string().required(),
  image: Joi.string(),
});

exports.login = Joi.object({
  email: Joi.string().required(),
  password: Joi.string().required(),
});

exports.createChurch = Joi.object({
  name: Joi.string().required(),
  image: Joi.string(),
  address: Joi.string().required(),
});

exports.updateChurch = Joi.object({
  name: Joi.string(),
  image: Joi.string(),
  address: Joi.string(),
});

exports.createPlan = Joi.object({
  name: Joi.string().required(),
  price: Joi.number().required(),
  days: Joi.number().required(),
});

exports.updatePlan = Joi.object({
  name: Joi.string(),
  price: Joi.number(),
  days: Joi.number(),
  status: Joi.string(),
});

exports.createSubscription = Joi.object({
  plan: Joi.string().required(),
  user: Joi.string().required(),
  expiryDate: Joi.date(),
  receipt: Joi.string().required(),
});

exports.updateSubscription = Joi.object({
  plan: Joi.string(),
  user: Joi.string(),
  expiryDate: Joi.date(),
  status: Joi.string(),
  receipt: Joi.string(),
});