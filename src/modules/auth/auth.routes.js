const express = require("express");
const { signup, login } = require("./auth.controller");
const authVerify = require("../../middlewares/authVerify");
const router = express.Router();

router.post("/login", login);
router.use(authVerify);
router.post("/signup", signup);

module.exports = router;
