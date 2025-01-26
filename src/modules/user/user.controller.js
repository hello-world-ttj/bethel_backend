const responseHandler = require("../../helpers/responseHandler");
const User = require("../../models/userModel");
const validation = require("../../validations");

exports.getUsers = async (req, res) => {
  try {
    const { page = 1, status, limit = 10, search } = req.query;

    const skipCount = 10 * (page - 1);
    const filter = {
      role: "user",
    };

    if (status) {
      filter.status = status;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { "church.name": { $regex: search, $options: "i" } },
      ];
    }

    const users = await User.find(filter)
      .populate("church", "name")
      .skip(skipCount)
      .limit(limit)
      .sort({ createdAt: -1 });

    const totalCount = await User.find(filter).countDocuments();
    return responseHandler(res, 200, "Success", users, totalCount);
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.getUsersByChurch = async (req, res) => {
  try {
    const { id } = req.params;
    let { page = 1, limit = 10, search, status } = req.query;

    const skipCount = 10 * (page - 1);
    const filter = {
      role: "user",
      church: id,
    };

    if (status) {
      filter.status = status;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { "church.name": { $regex: search, $options: "i" } },
      ];
    }

    let users;

    if (limit === "all") {
      users = await User.find(filter).sort({ createdAt: -1 });
    } else {
      limit = parseInt(limit);
      users = await User.find(filter)
        .populate("church", "name")
        .skip(skipCount)
        .limit(limit)
        .sort({ createdAt: -1 });
    }

    const totalCount = await User.find(filter).countDocuments();
    return responseHandler(res, 200, "Success", users, totalCount);
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.createUser = async (req, res) => {
  try {
    const { error } = validation.createUser.validate(req.body, {
      abortEarly: true,
    });
    if (error) {
      return responseHandler(res, 400, `Invalid input: ${error.message}`);
    }
    req.body.role = "user";
    const user = await User.create(req.body);
    return responseHandler(res, 200, "Success", user);
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { error } = validation.updateUser.validate(req.body, {
      abortEarly: true,
    });
    if (error) {
      return responseHandler(res, 400, `Invalid input: ${error.message}`);
    }
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    return responseHandler(res, 200, "Success", user);
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate("church", "name");
    return responseHandler(res, 200, "Success", user);
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    return responseHandler(res, 200, "Success", user);
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  }
};
