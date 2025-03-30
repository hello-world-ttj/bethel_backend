require("dotenv").config();
const responseHandler = require("../../helpers/responseHandler");
const Church = require("../../models/churchModel");
const Plan = require("../../models/planModel");
const Subscription = require("../../models/subscriptionModel");
const User = require("../../models/userModel");

exports.dashboard = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const skipCount = 10 * (page - 1);

    const [
      activeUsers,
      users,
      churches,
      plans,
      subsList,
      subsListCount,
    ] = await Promise.all([
      User.countDocuments({ status: "active", role: "user" }),
      User.countDocuments({ role: "user" }),
      Church.countDocuments(),
      Plan.countDocuments({ status: "active" }),
      Subscription.find({ status: "active" })
        .populate({
          path: "user",
          select: "name",
          populate: {
            path: "church",
            select: "name",
          },
        })
        .populate("plan", "name")
        .skip(skipCount)
        .limit(limit)
        .sort({ createdAt: -1 }),
      Subscription.countDocuments({ status: "active" }),
    ]);

    return responseHandler(res, 200, "Success", {
      activeUsers,
      users,
      churches,
      plans,
      subsList,
      subsListCount,
    });
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error: ${error.message}`);
  }
};
