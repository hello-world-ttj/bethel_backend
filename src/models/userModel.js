const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    salutation: { type: String, trim: true },
    name: { type: String, trim: true },
    church: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Church",
    },
    regNo: { type: String, trim: true },
    image: { type: String },
    email: { type: String, trim: true },
    phone: { type: String, trim: true },
    status: {
      type: String,
      enum: ["active", "inactive", "expiring", "expired"],
      default: "inactive",
    },
    address: { type: String, trim: true },
    pincode: { type: String, trim: true },
    nativePlace: { type: String, trim: true },
    street: { type: String, trim: true },
    postOffCode: { type: String, trim: true },
    password: { type: String, trim: true },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
  },
  { timestamps: true }
);

userSchema.index({ email: 1, status: 1 });

const User = mongoose.model("User", userSchema);

module.exports = User;
