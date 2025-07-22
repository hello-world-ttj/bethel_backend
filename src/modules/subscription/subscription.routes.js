const express = require("express");
const authVerify = require("../../middlewares/authVerify");
const {
  createSub,
  getSubs,
  getSub,
  updateSub,
  deleteSub,
  getSubsUsers,
} = require("./subscription.controller");
const router = express.Router();
router.use(authVerify);
router.route("/").post(createSub).get(getSubs);
router.get("/generate-labels", getSubsUsers);
router.get("/user/:id", getSubByUserId);
router.route("/:id").get(getSub).put(updateSub).delete(deleteSub);

module.exports = router;
