const Church = require("../../models/churchModel");
const responseHandler = require("../../helpers/responseHandler");
const validation = require("../../validations");

exports.createChurch = async (req, res) => {
  try {
    const { error } = validation.createChurch.validate(req.body, {
      abortEarly: true,
    });
    if (error) {
      return responseHandler(res, 400, `Invalid input: ${error.message}`);
    }
    const church = await Church.create(req.body);
    return responseHandler(res, 200, "Success", church);
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.getChurches = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, church } = req.query;

    const skipCount = limit * (page - 1);
    const filter = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { address: { $regex: search, $options: "i" } },
      ];
    }
    let churches;

    if (church === "all") {
      churches = await Church.find(filter).sort({ createdAt: -1 });
    } else {
      churches = await Church.find(filter)
        .skip(skipCount)
        .limit(limit)
        .sort({ createdAt: -1 });
    }

    const totalCount = await Church.find(filter).countDocuments();
    return responseHandler(res, 200, "Success", churches, totalCount);
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.getChurch = async (req, res) => {
  try {
    const church = await Church.findById(req.params.id);
    return responseHandler(res, 200, "Success", church);
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.updateChurch = async (req, res) => {
  try {
    const { error } = validation.updateChurch.validate(req.body, {
      abortEarly: true,
    });
    if (error) {
      return responseHandler(res, 400, `Invalid input: ${error.message}`);
    }
    const church = await Church.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    return responseHandler(res, 200, "Success", church);
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.deleteChurch = async (req, res) => {
  try {
    const church = await Church.findByIdAndDelete(req.params.id);
    return responseHandler(res, 200, "Success", church);
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  }
};
