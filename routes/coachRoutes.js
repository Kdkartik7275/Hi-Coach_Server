const express = require("express");
const router = express.Router();
const coachController = require("../controllers/coachController");
const authMiddleware = require("../middleware/authMiddleware");
const { authorizeOwner, authorizeCoach } = require("../middleware/authorizationMiddleware");
const { userIdValidation, searchValidation } = require("../middleware/validationMiddleware");

// Public routes
router.get("/search", searchValidation, coachController.searchCoaches);

// Protected routes - require authentication
router.post("/", authMiddleware, authorizeCoach, coachController.createCoach);
router.get("/:userId", authMiddleware, userIdValidation, coachController.getCoachByUserId);
router.put("/:userId", authMiddleware, authorizeOwner, userIdValidation, coachController.updateCoachByUserId);
router.put("/timings/:userId", authMiddleware, authorizeOwner, userIdValidation, coachController.updateCoachTimings);
router.delete("/:userId", authMiddleware, authorizeOwner, userIdValidation, coachController.deleteCoachByUserId);

module.exports = router;
