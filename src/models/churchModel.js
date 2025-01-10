const mongoose = require("mongoose");

const churchSchema = mongoose.Schema(
  {
    name: { type: String, trim: true },
    image: { type: String },
    address: { type: String, trim: true },
  },
  { timestamps: true }
);

const Church = mongoose.model("Church", churchSchema);

module.exports = Church;
