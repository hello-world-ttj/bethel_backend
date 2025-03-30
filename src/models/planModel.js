const mongoose = require("mongoose");

const planSchema = mongoose.Schema(
  {
    name: { type: String, trim: true },
    status: {
      type: String,
      default: "active",
      enum: ["active", "inactive"],
    },
    price: { type: Number },
    days: { type: Number },
  },
  { timestamps: true }
);

planSchema.index({ name: 1 });

const Plan = mongoose.model("Plan", planSchema);

module.exports = Plan;
