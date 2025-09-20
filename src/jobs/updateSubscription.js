const moment = require("moment-timezone");
require("dotenv").config();
const Subscription = require("../models/subscriptionModel");
const User = require("../models/userModel");
//* Import database connection module
require("../helpers/connection");
const updateSubscription = async () => {
  const now = moment().tz("Asia/Kolkata");
  const oneMonthFromNow = moment().tz("Asia/Kolkata").add(1, "month");

  try {
    console.log("Executing updateSubscription job");
    const expiredSubscriptions = await Subscription.find({
      expiryDate: { $lte: now.toDate() },
      status: "active",
    }).populate("user", "phone");

    const expiringSubscriptions = await Subscription.find({
      expiryDate: {
        $gte: oneMonthFromNow.startOf("day").toDate(),
        $lte: oneMonthFromNow.endOf("day").toDate(),
      },
      status: "active",
    }).populate("user", "phone");

    for (const subscription of expiredSubscriptions) {
      subscription.status = "expired";
      await User.findByIdAndUpdate(subscription.user._id, {
        status: "expired",
      });
      await subscription.save();
      console.log(
        `Expired subscription updated for user: ${subscription.user._id}`
      );
    }

    for (const subscription of expiringSubscriptions) {
      subscription.status = "expiring";
      await User.findByIdAndUpdate(subscription.user._id, {
        status: "expiring",
      });
      await subscription.save();
      console.log(
        `Expiring subscription updated for user: ${subscription.user._id}`
      );
    }
    console.log("updateSubscription job completed");
  } catch (err) {
    console.error("Error updating subscriptions:", err);
  }
};

module.exports = updateSubscription;
