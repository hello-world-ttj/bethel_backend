const Church = require("../../models/churchModel");
const responseHandler = require("../../helpers/responseHandler");
const validation = require("../../validations");
const { clearCacheByPattern } = require("../../helpers/cacheUtils");
const User = require("../../models/userModel");

exports.createChurch = async (req, res) => {
  try {
    const { error } = validation.createChurch.validate(req.body, {
      abortEarly: true,
    });
    if (error) {
      return responseHandler(res, 400, `Invalid input: ${error.message}`);
    }
    const church = await Church.create(req.body);
    await clearCacheByPattern("/api/v1/church*");
    return responseHandler(res, 200, "Success", church);
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.getChurches = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, church } = req.query;

    const skipCount = (parseInt(page) - 1) * parseInt(limit);
    const filter = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { address: { $regex: search, $options: "i" } },
      ];
    }

    let churches;

    if (church === "all") {
      churches = await Church.find(filter).sort({ name: 1 }).lean();
    } else {
      churches = await Church.find(filter)
        .skip(skipCount)
        .limit(parseInt(limit))
        .sort({ name: 1 })
        .lean();
    }

    const churchIds = churches.map((c) => c._id);

    const users = await User.find({ church: { $in: churchIds } }).lean();

    const userCountByChurch = {};

    users.forEach((user) => {
      const churchId = user.church?.toString();
      if (!userCountByChurch[churchId]) {
        userCountByChurch[churchId] = { activeUser: 0, inActiveUser: 0 };
      }
      if (user.isActive) {
        userCountByChurch[churchId].activeUser += 1;
      } else {
        userCountByChurch[churchId].inActiveUser += 1;
      }
    });

    churches = churches.map((church) => {
      const counts = userCountByChurch[church._id.toString()] || {
        activeUser: 0,
        inActiveUser: 0,
      };
      return { ...church, ...counts };
    });

    const totalCount = await Church.countDocuments(filter);

    return responseHandler(res, 200, "Success", churches, totalCount);
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error: ${error.message}`);
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
    await clearCacheByPattern("/api/v1/church*");
    return responseHandler(res, 200, "Success", church);
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.deleteChurch = async (req, res) => {
  try {
    const church = await Church.findByIdAndDelete(req.params.id);
    await clearCacheByPattern("/api/v1/church*");
    return responseHandler(res, 200, "Success", church);
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  }
};
