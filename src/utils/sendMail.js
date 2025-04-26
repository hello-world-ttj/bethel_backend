require("dotenv").config();
const { NODE_EMAIL_ID, NODE_PASS } = process.env;
const nodemailer = require("nodemailer");
const senderName = "Bethel Patrika";

const sendMail = async (data) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: NODE_EMAIL_ID,
        pass: NODE_PASS,
      },
    });

    const mailOptions = {
      from: `"${senderName}" <${NODE_EMAIL_ID}>`,
      to: data.to,
      subject: data.subject,
      text: data.text,
      attachments: data.attachments,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log("🚀 ~ sendMail ~ error:", error);
      } else {
        console.log("🚀 ~ Email sent: ~ response: " + info.response);
      }
    });
  } catch (error) {
    console.log("🚀 ~ sendMail ~ error:", error);
  }
};

module.exports = sendMail;
