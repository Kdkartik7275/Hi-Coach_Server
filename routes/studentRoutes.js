const express = require("express");
const router = express.Router();
const studentController = require("../controllers/studentController");
const authMiddleware = require("../middleware/authMiddleware");
const { authorizeOwner, authorizeStudent } = require("../middleware/authorizationMiddleware");
const { userIdValidation } = require("../middleware/validationMiddleware");

// All routes require authentication
router.use(authMiddleware);

router.post("/", authorizeStudent, studentController.createStudent);
router.get("/:userId", userIdValidation, studentController.getStudentByUserId);
router.put("/:userId", authorizeOwner, userIdValidation, studentController.updateStudent);
router.delete("/:userId", authorizeOwner, userIdValidation, studentController.deleteStudent);

module.exports = router;
