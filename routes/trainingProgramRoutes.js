const express = require("express");
const router = express.Router();

const {
  createProgram,
  getProgramsByCoach,
  updateProgram,
  deleteProgram,
  getProgramById,
  getRecommendedPrograms
} = require("../controllers/trainingProgramController");

// CREATE program
router.post("/create", createProgram);

// GET all programs by coach
router.get("/coach/:coachId", getProgramsByCoach);

// UPDATE program
router.put("/:programId", updateProgram);

// DELETE program
router.delete("/:programId", deleteProgram);
router.get("/:programId", getProgramById);

router.get("/:studentId/recommendations", getRecommendedPrograms);


module.exports = router;
