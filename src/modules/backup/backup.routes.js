const express = require("express");
const {
  createBackup,
  createMagazineBackup,
  getMagazines,
} = require("./backup.controller");
const authVerify = require("../../middlewares/authVerify");
const router = express.Router();

router.use(authVerify);
router.get("/", createBackup);
router.route("/magazine").post(createMagazineBackup).get(getMagazines);

module.exports = router;
