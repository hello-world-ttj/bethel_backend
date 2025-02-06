require("dotenv").config();
const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_SERVICE_SID } =
  process.env;
const client = require("twilio")(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
const cron = require("node-cron");
const moment = require("moment-timezone");
const Subscription = require("../models/subscriptionModel");
const User = require("../models/userModel");

cron.schedule("0 0 * * *", async () => {
  const now = moment().tz("Asia/Kolkata");
  const oneMonthFromNow = moment().tz("Asia/Kolkata").add(1, "month");

  try {
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
      await User.findByIdAndUpdate(
        subscription.user._id,
        { status: "expired" },
        { new: true }
      );
      await subscription.save();
      // await client.messages.create({
      //   body: "Your Bethel Patrika subscription has expired. Please renew your subscription.",
      //   messagingServiceSid: TWILIO_SERVICE_SID,
      //   to: subscription.user.phone,
      // });
    }

    for (const subscription of expiringSubscriptions) {
      subscription.status = "expiring";
      await User.findByIdAndUpdate(
        subscription.user._id,
        { status: "expiring" },
        { new: true }
      );
      await subscription.save();
      // await client.messages.create({
      //   body: "Your Bethel Patrika subscription is expiring in 1 month, please renew your subscription.",
      //   messagingServiceSid: TWILIO_SERVICE_SID,
      //   to: subscription.user.phone,
      // });
    }
  } catch (err) {
    console.error("Error updating subscriptions:", err);
  }
});
