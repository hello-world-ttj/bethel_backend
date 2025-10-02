const express = require("express");
const {
  createBackup,
  createMagazineBackup,
  getMagazines,
  deleteMagazine,
} = require("./backup.controller");
const authVerify = require("../../middlewares/authVerify");
const router = express.Router();

router.use(authVerify);
router.get("/", createBackup);
router.route("/magazine").post(createMagazineBackup).get(getMagazines);
router.route("/magazine/:id").delete(deleteMagazine);

module.exports = router;
