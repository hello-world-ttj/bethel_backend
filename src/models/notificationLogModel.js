const mongoose = require("mongoose");

const notificationLogSchema = mongoose.Schema(
  {
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    subject: { type: String },
    content: { type: String },
    media: { type: String },
    type: { type: String, enum: ["email", "whatsapp"] },
  },
  { timestamps: true }
);

const NotificationLog = mongoose.model(
  "NotificationLog",
  notificationLogSchema
);

module.exports = NotificationLog;
