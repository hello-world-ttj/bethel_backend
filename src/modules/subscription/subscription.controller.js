const responseHandler = require("../../helpers/responseHandler");
const Plan = require("../../models/planModel");
const Subscription = require("../../models/subscriptionModel");
const validation = require("../../validations");

exports.createSub = async (req, res) => {
  try {
    const { error } = validation.createSubscription.validate(req.body, {
      abortEarly: true,
    });
    if (error) {
      return responseHandler(res, 400, `Invalid input: ${error.message}`);
    }

    const { user, plan: planId } = req.body;

    const plan = await Plan.findById(planId);
    if (!plan) {
      return responseHandler(res, 404, "Plan not found.");
    }

    let latestSub = await Subscription.findOne({ user }).sort({
      expiryDate: -1,
    });

    let expiryDate;
    if (latestSub) {
      expiryDate = new Date(latestSub.expiryDate);
    } else {
      expiryDate = new Date();
    }
    expiryDate.setDate(expiryDate.getDate() + plan.days);

    const newSub = await Subscription.create({
      user,
      plan: planId,
      expiryDate,
    });

    return responseHandler(res, 201, "Success", newSub);
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error: ${error.message}`);
  }
};
exports.getSub = async (req, res) => {
  try {
    const sub = await Subscription.findById(req.params.id);
    return responseHandler(res, 200, "Success", sub);
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.updateSub = async (req, res) => {
  try {
    const { error } = validation.updateSubscription.validate(req.body, {
      abortEarly: true,
    });
    if (error) {
      return responseHandler(res, 400, `Invalid input: ${error.message}`);
    }
    const sub = await Subscription.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    return responseHandler(res, 200, "Success", sub);
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.deleteSub = async (req, res) => {
  try {
    const sub = await Subscription.findByIdAndDelete(req.params.id);
    return responseHandler(res, 200, "Success", sub);
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.getSubs = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status } = req.query;

    const skipCount = 10 * (page - 1);

    const filter = {};

    if (search) {
      filter.status = { $regex: search, $options: "i" };
    }

    if (status) {
      filter.status = status;
    }

    const subs = await Subscription.find(filter)
      .skip(skipCount)
      .limit(limit)
      .sort({ createdAt: -1 });

    const totalCount = await Subscription.find(filter).countDocuments();

    return responseHandler(res, 200, "Success", subs, totalCount);
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  }
};
