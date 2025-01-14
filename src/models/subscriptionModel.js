const mongoose = require("mongoose");

const subscriptionSchema = mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    status: {
      type: String,
      default: "active",
      enum: ["active", "expired", "expiring"],
    },
    expiryDate: { type: Date },
    plan: { type: mongoose.Schema.Types.ObjectId, ref: "Plan" },
    receipt: { type: String },
  },
  { timestamps: true }
);

const Subscription = mongoose.model("Subscription", subscriptionSchema);

module.exports = Subscription;
