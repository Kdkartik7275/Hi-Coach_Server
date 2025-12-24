const express = require("express");
const router = express.Router();
const enrollmentController = require("../controllers/bookingController");
const authMiddleware = require("../middleware/authMiddleware");
const {
  authorizeStudent,
  authorizeCoach,
} = require("../middleware/authorizationMiddleware");
const {
  enrollmentValidation,
  mongoIdValidation,
} = require("../middleware/validationMiddleware");

// All routes require authentication
router.use(authMiddleware);

// 1️⃣ Student Enroll in Program
router.post(
  "/enroll",
  authorizeStudent,
  enrollmentValidation,
  enrollmentController.enrollStudent
);

// 2️⃣ Coach Mark Attendance
router.patch(
  "/:enrollmentId/sessions/:sessionId/attendance",
  authorizeCoach,
  mongoIdValidation("enrollmentId"),
  enrollmentController.markAttendance
);

// 3️⃣ Student Cancel Entire Program
router.patch(
  "/:enrollmentId/cancel",
  authorizeStudent,
  mongoIdValidation("enrollmentId"),
  enrollmentController.cancelEnrollment
);

// 4️⃣ Coach Cancel a Single Session
router.patch(
  "/:enrollmentId/sessions/:sessionId/cancel",
  authorizeCoach,
  mongoIdValidation("enrollmentId"),
  enrollmentController.cancelSession
);

// 5️⃣ Mark Program as Completed
router.patch(
  "/:enrollmentId/complete",
  authorizeCoach,
  mongoIdValidation("enrollmentId"),
  enrollmentController.markProgramComplete
);

// 6️⃣ Get all enrollments of a student
router.get("/student/:studentId", enrollmentController.getStudentEnrollments);

// 7️⃣ Get all enrollments of a coach
router.get("/coach/:coachId", enrollmentController.getCoachEnrollments);
// 8️⃣ Coach Accept / Reject Enrollment
router.patch(
  "/:enrollmentId/decision",
  authorizeCoach,
  mongoIdValidation("enrollmentId"),
  enrollmentController.coachDecisionOnEnrollment
);

module.exports = router;
