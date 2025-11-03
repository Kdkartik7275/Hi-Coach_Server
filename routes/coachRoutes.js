const express = require("express");
const router = express.Router();
const coachController = require("../controllers/coachController");

router.post("/", coachController.createCoach);
router.get("/:userId", coachController.getCoachByUserId);
router.put("/:userId", coachController.updateCoachByUserId);
router.put("/timings/:userId", coachController.updateCoachTimings);
router.delete("/:userId", coachController.deleteCoachByUserId);
router.get("/search", coachController.searchCoaches);

module.exports = router;
