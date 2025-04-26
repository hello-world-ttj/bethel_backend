const express = require("express");
const { createNotification, getNoficationsLogs } = require("./notification.controller");
const authVerify = require("../../middlewares/authVerify");
const router = express.Router();

router.use(authVerify);
router.route("/").post(createNotification).get(getNoficationsLogs);

module.exports = router;
