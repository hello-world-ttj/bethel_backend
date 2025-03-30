const responseHandler = require("../../helpers/responseHandler");
const User = require("../../models/userModel");
const { hashPassword, comparePasswords } = require("../../utils/bcrypt");
const { generateToken } = require("../../utils/generateToken");
const validation = require("../../validations");

exports.signup = async (req, res) => {
  try {
    const { error } = validation.signup.validate(req.body, {
      abortEarly: true,
    });
    if (error) {
      return responseHandler(res, 400, `Invalid input: ${error.message}`);
    }

    const findUser = await User.findOne({ email: req.body.email });
    if (findUser) return responseHandler(res, 400, "Failure");

    req.body.role = "admin";
    req.body.password = await hashPassword(req.body.password, 10);
    const user = await User.create(req.body);
    return responseHandler(res, 200, "Success", user);
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.login = async (req, res) => {
  try {
    const { error } = validation.login.validate(req.body, {
      abortEarly: true,
    });
    if (error) {
      return responseHandler(res, 400, `Invalid input: ${error.message}`);
    }
    const { email, password } = req.body;
    const user = await User.findOne({ email, role: "admin" });
    const comparePassword = await comparePasswords(password, user.password);
    if (!comparePassword) {
      return responseHandler(res, 401, "Invalid password");
    }
    const token = generateToken(user._id);
    return responseHandler(res, 200, "Success", token);
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.profile = async (req, res) => {
  try {
    if (!req.user) {
      return responseHandler(res, 401, "Unauthorized");
    }
    return responseHandler(res, 200, "Success", req.user);
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  }
};
