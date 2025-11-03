const express = require("express");
const router = express.Router();
const sessionController = require("../controllers/sessionController");

router.post("/create", sessionController.createClass);
router.post("/confirm", sessionController.confirmBooking);
router.post("/cancel", sessionController.cancelClass);

router.post("/book", sessionController.bookClass);

router.get("/:id", sessionController.getClassById);
router.get("/list/:studentId", sessionController.getClassesByStudentId);
router.get("/listByCoach/:coachId", sessionController.getClassesByCoachId);

router.put("/:id", sessionController.updateClass);

router.get("/listByCoach/:coachId/:startTime", sessionController.getClassesByCoachIdAndDate);


module.exports = router;
