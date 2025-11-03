const express = require("express");
const router = express.Router();
const studentController = require("../controllers/studentController");

router.post("/", studentController.createStudent);
router.get("/:userId", studentController.getStudentByUserId);
router.put("/:userId", studentController.updateStudent);
router.delete("/:userId", studentController.deleteStudent);

module.exports = router;
