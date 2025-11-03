const Session = require("../models/session");

const bookClass = async (req, res) => {
  try {
    const { sessionId, student } = req.body;
    const session = await Session.findById(sessionId);

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    if (session.students.length >= session.pax) {
      return res.status(400).json({ message: "Class is full" });
    }

    session.students.push(student);
    session.studentIDs.push(student.id);
    await session.save();

    res.status(200).json({ message: "Class booked successfully", session });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

const getClassById = async (req, res) => {
  try {
    const { id } = req.params;
    const session = await Session.findById(id);
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }
    res.status(200).json(session);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

const updateClass = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;
    const session = await Session.findByIdAndUpdate(id, updatedData, {
      new: true,
    });
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }
    res.status(200).json({ message: "Class updated successfully", session });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

const createClass = async (req, res) => {
  try {
    if (req.body.startTime) req.body.startTime = new Date(req.body.startTime);
    if (req.body.endTime) req.body.endTime = new Date(req.body.endTime);

    const newSession = new Session(req.body);
    await newSession.save();

    res.status(201).json({
      message: "Class created successfully",
      session: newSession,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const confirmBooking = async (req, res) => {
  try {
    const { sessionId, studentId } = req.body;

    const session = await Session.findOne({ id: sessionId });
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    const studentIndex = session.students.findIndex(
      (student) => student.id === studentId
    );
    if (studentIndex === -1) {
      return res
        .status(404)
        .json({ message: "Student not found in this session" });
    }

    session.students[studentIndex].isConfirmed = true;
    await session.save();

    res
      .status(200)
      .json({ message: "Booking confirmed successfully", session });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const cancelClass = async (req, res) => {
  try {
    const { sessionId, userId, role } = req.body;
    // role can be "coach" or "student"

    const session = await Session.findOne({ id: sessionId });
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    // COACH CANCELS ENTIRE CLASS
    if (role === "coach") {
      if (session.coachID !== userId) {
        return res
          .status(403)
          .json({ message: "You are not authorized to cancel this class" });
      }

      session.isCanceled = true;
      await session.save();

      return res.status(200).json({
        message: "Class canceled successfully by coach",
        session,
      });
    }

    // STUDENT CANCELS THEIR BOOKING
    if (role === "student") {
      const studentIndex = session.students.findIndex((s) => s.id === userId);
      if (studentIndex === -1) {
        return res
          .status(404)
          .json({ message: "Student not found in this class" });
      }

      // Mark this student's booking as declined
      session.students[studentIndex].isDeclined = true;

      // Remove student ID from the active list
      session.studentIDs = session.studentIDs.filter((id) => id !== userId);

      // ✅ Check if all students have declined
      const allDeclined = session.students.length > 0 &&
        session.students.every((s) => s.isDeclined === true);

      if (allDeclined) {
        session.isCanceled = true;
      }

      await session.save();

      return res.status(200).json({
        message: allDeclined
          ? "All students declined — class automatically canceled"
          : "Booking canceled successfully by student",
        session,
      });
    }

    return res.status(400).json({ message: "Invalid role provided" });
  } catch (error) {
    console.error("Error canceling class:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


const getClassesByStudentId = async (req, res) => {
  try {
    const { studentId } = req.params;

    const sessions = await Session.find({ studentIDs: studentId });

    if (!sessions.length) {
      return res
        .status(404)
        .json({ message: "No sessions found for this student" });
    }

    res.status(200).json(sessions);
  } catch (error) {
    console.error("Error fetching sessions:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getClassesByCoachId = async (req, res) => {
  try {
    const { coachId } = req.params;

    const sessions = await Session.find({ coachID: coachId });

    if (!sessions.length) {
      return res
        .status(404)
        .json({ message: "No sessions found for this coach" });
    }

    res.status(200).json(sessions);
  } catch (error) {
    console.error("Error fetching sessions:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getClassesByCoachIdAndDate = async (req, res) => {
  try {
    const { coachId, startTime } = req.params;

    if (!coachId || !startTime) {
      return res
        .status(400)
        .json({ message: "coachId and startTime are required" });
    }

    const date = new Date(startTime);
    const startOfDay = new Date(date.setUTCHours(0, 0, 0, 0));
    const endOfDay = new Date(date.setUTCHours(23, 59, 59, 999));

    const sessions = await Session.find({
      coachID: coachId,
      startTime: { $gte: startOfDay, $lte: endOfDay },
    });

    if (!sessions.length) {
      return res
        .status(404)
        .json({
          message: "No sessions found for this coach on the given date",
        });
    }

    res.status(200).json(sessions);
  } catch (error) {
    console.error("Error fetching sessions:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  bookClass,
  getClassById,
  updateClass,
  createClass,
  confirmBooking,
  getClassesByStudentId,
  getClassesByCoachId,
  getClassesByCoachIdAndDate,
  cancelClass,
};
