const mongoose = require("mongoose");

const magazineSchema = mongoose.Schema(
  {
    name: { type: String, trim: true },
    pdfUrl: { type: String, trim: true },
  },
  {
    timestamps: true,
  }
);

const Magazine = mongoose.model("Magazine", magazineSchema);

module.exports = Magazine;
