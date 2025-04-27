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
    const currentYear = new Date().getFullYear();

    const [
      activeUsers,
      users,
      churches,
      plans,
      subsList,
      subsListCount,
      monthlyTotals,
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
      Subscription.aggregate([
        {
          $lookup: {
            from: "plans",
            localField: "plan",
            foreignField: "_id",
            as: "planData",
          },
        },
        { $unwind: "$planData" },
        {
          $match: {
            createdAt: {
              $gte: new Date(`${currentYear}-01-01T00:00:00.000Z`),
              $lte: new Date(`${currentYear}-12-31T23:59:59.999Z`),
            },
            status: "active",
          },
        },
        {
          $group: {
            _id: { $month: "$createdAt" },
            totalPrice: { $sum: "$planData.price" },
          },
        },
        {
          $project: {
            month: "$_id",
            totalPrice: 1,
            _id: 0,
          },
        },
      ]),
    ]);

    const monthlyPlanPrices = Array(12).fill(0);
    monthlyTotals.forEach((item) => {
      monthlyPlanPrices[item.month - 1] = item.totalPrice;
    });

    return responseHandler(res, 200, "Success", {
      activeUsers,
      users,
      churches,
      plans,
      subsList,
      subsListCount,
      monthlyPlanPrices,
    });
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error: ${error.message}`);
  }
};
