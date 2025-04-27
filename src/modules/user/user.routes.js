const express = require("express");
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  getUsersByChurch,
} = require("./user.controller");
const authVerify = require("../../middlewares/authVerify");
const router = express.Router();

router.use(authVerify);
router.route("/").post(createUser).get(getUsers);
router.get("/church/:id", getUsersByChurch);
router.post("/clear-cache", clearCache);
router.route("/:id").get(getUser).put(updateUser).delete(deleteUser);

module.exports = router;
