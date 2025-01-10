const express = require("express");
const {
  createChurch,
  getChurches,
  getChurch,
  updateChurch,
  deleteChurch,
} = require("./church.controller");
const router = express.Router();

router.route("/").post(createChurch).get(getChurches);
router.route("/:id").get(getChurch).put(updateChurch).delete(deleteChurch);

module.exports = router;
