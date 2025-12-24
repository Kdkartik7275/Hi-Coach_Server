const TrainingProgram = require("../models/trainingProgram");
const Enrollment = require("../models/booking");
// =======================
// CREATE PROGRAM
// =======================
exports.createProgram = async (req, res) => {
  try {
    const newProgram = new TrainingProgram(req.body);
    await newProgram.save();

    res.status(201).json({
      success: true,
      message: "Training program created successfully",
      data: newProgram,
    });
  } catch (error) {
    console.log("Create Program Error:", error);
    res.status(500).json({ success: false, message: "Server Error", error });
  }
};

// =======================
// GET ALL PROGRAMS BY COACH
// =======================
exports.getProgramsByCoach = async (req, res) => {
  try {
    const { coachId } = req.params;

    const programs = await TrainingProgram.find({
      coachId,
      deletedAt: null,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: programs,
    });
  } catch (error) {
    console.log("Get Programs Error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error,
    });
  }
};

// =======================
// UPDATE PROGRAM
// =======================
exports.updateProgram = async (req, res) => {
  try {
    const { programId } = req.params;

    const updated = await TrainingProgram.findByIdAndUpdate(
      programId,
      req.body,
      { new: true }
    );

    if (!updated) {
      return res
        .status(404)
        .json({ success: false, message: "Program not found" });
    }

    res.status(200).json({
      success: true,
      message: "Program updated successfully",
      data: updated,
    });
  } catch (error) {
    console.log("Update Program Error:", error);
    res.status(500).json({ success: false, message: "Server Error", error });
  }
};

// =======================
// DELETE PROGRAM
// =======================
exports.deleteProgram = async (req, res) => {
  try {
    const { programId } = req.params;

    const program = await TrainingProgram.findOneAndUpdate(
      { _id: programId, deletedAt: null },
      { deletedAt: new Date() },
      { new: true }
    );

    if (!program) {
      return res.status(404).json({
        success: false,
        message: "Program not found or already deleted",
      });
    }

    res.status(200).json({
      success: true,
      message: "Program deleted successfully",
    });
  } catch (error) {
    console.log("Delete Program Error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error,
    });
  }
};

exports.getRecommendedPrograms = async (req, res) => {
  try {
    const { studentId } = req.params;

    // Get student's past enrollments
    const enrollments = await Enrollment.find({ studentId })
      .populate("programId", "sport level");

    if (!enrollments.length) {
      // If no history, return latest programs
      const latestPrograms = await TrainingProgram.find({ deletedAt: null })
        .sort({ createdAt: -1 })
        .limit(10);

      return res.status(200).json({
        success: true,
        message: "No history found. Showing latest programs.",
        data: latestPrograms,
      });
    }

    const sports = enrollments.map(e => e.programId.sport);
    const enrolledProgramIds = enrollments.map(e => e.programId._id);

    const recommended = await TrainingProgram.find({
      sport: { $in: sports },
      _id: { $nin: enrolledProgramIds },
      deletedAt: null,
    }).limit(10);

    res.status(200).json({
      success: true,
      data: recommended,
    });

  } catch (error) {
    console.log("Get Recommended Programs Error:", error);
    res.status(500).json({ success: false, message: "Server Error", error });
  }
};

// =======================
// GET PROGRAM BY ID
// =======================
exports.getProgramById = async (req, res) => {
  try {
    const { programId } = req.params;

    const program = await TrainingProgram.findById(programId);

    if (!program) {
      return res
        .status(404)
        .json({ success: false, message: "Program not found" });
    }

    res.status(200).json({
      success: true,
      data: program,
    });
  } catch (error) {
    console.log("Get Program By ID Error:", error);
    res.status(500).json({ success: false, message: "Server Error", error });
  }
};
