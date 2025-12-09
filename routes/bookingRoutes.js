const express = require("express");
const router = express.Router();
const enrollmentController = require("../controllers/bookingController");

// 1️⃣ Student Enroll in Program
router.post("/enroll", enrollmentController.enrollStudent);

// 2️⃣ Coach Mark Attendance
router.patch("/:enrollmentId/sessions/:sessionId/attendance", enrollmentController.markAttendance);

// 3️⃣ Student Cancel Entire Program
router.patch("/:enrollmentId/cancel", enrollmentController.cancelEnrollment);

// 4️⃣ Coach Cancel a Single Session
router.patch("/:enrollmentId/sessions/:sessionId/cancel", enrollmentController.cancelSession);

// 5️⃣ Mark Program as Completed
router.patch("/:enrollmentId/complete", enrollmentController.markProgramComplete);

// 6️⃣ Get all enrollments of a student
router.get("/student/:studentId", enrollmentController.getStudentEnrollments);

// 7️⃣ Get all enrollments of a coach
router.get("/coach/:coachId", enrollmentController.getCoachEnrollments);

module.exports = router;
