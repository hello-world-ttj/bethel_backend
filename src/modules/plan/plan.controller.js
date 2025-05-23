const Plan = require("../../models/planModel");
const responseHandler = require("../../helpers/responseHandler");
const validation = require("../../validations");
const { clearCacheByPattern } = require("../../helpers/cacheUtils");

exports.createPlan = async (req, res) => {
  try {
    const { error } = validation.createPlan.validate(req.body, {
      abortEarly: true,
    });
    if (error) {
      return responseHandler(res, 400, `Invalid input: ${error.message}`);
    }
    const plan = await Plan.create(req.body);
    await clearCacheByPattern("/api/v1/plans*");
    return responseHandler(res, 200, "Success", plan);
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.getPlans = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const skipCount = limit * (page - 1);

    const filter = {};

    if (search) {
      filter.$or = [{ name: { $regex: search, $options: "i" } }];
    }

    const plans = await Plan.find(filter)
      .skip(skipCount)
      .limit(limit)
      .sort({ createdAt: -1 });

    const totalCount = await Plan.find(filter).countDocuments();
    return responseHandler(res, 200, "Success", plans, totalCount);
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.getPlan = async (req, res) => {
  try {
    const plan = await Plan.findById(req.params.id);
    return responseHandler(res, 200, "Success", plan);
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.updatePlan = async (req, res) => {
  try {
    const { error } = validation.updatePlan.validate(req.body, {
      abortEarly: true,
    });
    if (error) {
      return responseHandler(res, 400, `Invalid input: ${error.message}`);
    }
    const plan = await Plan.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    await clearCacheByPattern("/api/v1/plans*");
    return responseHandler(res, 200, "Success", plan);
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.deletePlan = async (req, res) => {
  try {
    const plan = await Plan.findByIdAndDelete(req.params.id);
    await clearCacheByPattern("/api/v1/plans*");
    return responseHandler(res, 200, "Success", plan);
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  }
};
