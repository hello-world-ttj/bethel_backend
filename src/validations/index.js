const Joi = require("joi");

exports.createUser = Joi.object({
  salutation: Joi.string().allow(""),
  name: Joi.string().required(),
  regNo: Joi.string().allow(""),
  church: Joi.string().required(),
  image: Joi.string(),
  email: Joi.string().email().allow(""),
  phone: Joi.string().allow(""),
  address: Joi.string().required(),
  pincode: Joi.string(),
  nativePlace: Joi.string(),
});

exports.updateUser = Joi.object({
  salutation: Joi.string().allow(""),
  name: Joi.string(),
  regNo: Joi.string().allow(""),
  church: Joi.string(),
  image: Joi.string(),
  email: Joi.string().email().allow(""),
  phone: Joi.string().allow(""),
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
  receipt: Joi.string().allow(""),
});

exports.updateSubscription = Joi.object({
  plan: Joi.string(),
  user: Joi.string(),
  expiryDate: Joi.date(),
  status: Joi.string(),
  receipt: Joi.string().allow(""),
});

exports.createNotification = Joi.object({
  subject: Joi.string().required(),
  content: Joi.string().required(),
  users: Joi.array(),
  media: Joi.string(),
  type: Joi.string().required(),
});