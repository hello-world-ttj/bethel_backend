const express = require("express");
const {
  createPlan,
  getPlans,
  getPlan,
  updatePlan,
  deletePlan,
} = require("./plan.controller");
const router = express.Router();

router.route("/").post(createPlan).get(getPlans);
router.route("/:id").get(getPlan).put(updatePlan).delete(deletePlan);

module.exports = router;
