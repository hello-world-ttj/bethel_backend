const express = require("express");
const {
  sendSMS,
  checkBalance,
} = require("./twilio.controller");
const authVerify = require("../../middlewares/authVerify");
const router = express.Router();

router.use(authVerify);
router.post("/send-sms", sendSMS);
router.get("/balance", checkBalance);

module.exports = router;
