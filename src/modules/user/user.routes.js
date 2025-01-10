const express = require("express");
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
} = require("./user.controller");
const router = express.Router();

router.route("/").post(createUser).get(getUsers);
router.route("/:id").get(getUser).put(updateUser).delete(deleteUser);

module.exports = router;
