const Enrollment = require("../models/booking");
const TrainingProgram = require("../models/trainingProgram");

// ------------------------------------------------------------
// Helper: Refund Calculation
// ------------------------------------------------------------
const calculateRefund = (enrollment) => {
  const completedSessions = enrollment.sessions.filter(
    (s) => s.status === "completed"
  ).length;

  const totalSessions = enrollment.sessions.length;
  const perSessionPrice = enrollment.payment.totalAmount / totalSessions;

  const refundableSessions = totalSessions - completedSessions;

  return refundableSessions * perSessionPrice;
};

exports.enrollStudent = async (req, res) => {
  try {
    const { studentId, programId, startDate, slot, paymentType } = req.body;
    console.log("Start Date:", startDate);

    const program = await TrainingProgram.findById(programId);
    if (!program) return res.status(404).json({ message: "Program not found" });

    const sessions = Array.from({ length: program.totalSessions }, (_, i) => ({
      index: i + 1,
      slot,
      sessionDate: null,
      status: "pending",
    }));

    const start = new Date(startDate);
    start.setMinutes(start.getMinutes() - start.getTimezoneOffset()); 

    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + program.durationDays);



    const totalAmount = program.price;

    const enrollment = new Enrollment({
      studentId,
      coachId: program.coachId,
      programId,
      startDate: start,
      endDate,
      sessions,
      payment: {
        paymentType,
        paymentStatus: paymentType === "full_advance" ? "paid" : "pending",
        totalAmount,
        paidAmount: paymentType === "full_advance" ? totalAmount : 0,
        refundAmount: 0,
        transactions:
          paymentType === "full_advance"
            ? [{ amount: totalAmount, date: new Date(), type: "payment" }]
            : [],
      },
    });

    await enrollment.save();

    const enrollmentWithProgram = await Enrollment.findById(
      enrollment._id
    ).populate("programId");

    res.status(201).json({
      success: true,
      message: "Enrollment successful",
      data: enrollmentWithProgram,
    });
  } catch (error) {
    console.log("Enroll Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ============================================================
// 2️⃣ COACH MARK ATTENDANCE
// ============================================================
exports.markAttendance = async (req, res) => {
  try {
    const { enrollmentId, sessionId } = req.params;
    const { attendance } = req.body;

    const today = new Date();
    const enrollment = await Enrollment.findById(enrollmentId);

    const session = enrollment.sessions.id(sessionId);

    // Check coach availability only if sessionDate is new
    if (!session.sessionDate) {
      const available = await Enrollment.findOne({
        coachId: enrollment.coachId,
        "sessions.sessionDate": today,
        "sessions.slot": session.slot,
        enrollmentStatus: "active",
      });

      if (available) {
        return res.status(400).json({
          message: "Coach is already booked for this time slot today",
        });
      }

      session.sessionDate = today;
    }

    session.attendance = attendance;
    session.status = "completed";
    await enrollment.save();

    res.json({ success: true, message: "Attendance marked", session });
  } catch (e) {
    res.status(500).json({ message: "Server error" });
  }
};

// ============================================================
// 3️⃣ STUDENT CANCEL PROGRAM (refund included)
// ============================================================
exports.cancelEnrollment = async (req, res) => {
  try {
    const { enrollmentId } = req.params;
    const { reason } = req.body;

    const enrollment = await Enrollment.findById(enrollmentId);
    if (!enrollment)
      return res.status(404).json({ message: "Enrollment not found" });

    if (enrollment.enrollmentStatus === "cancelled") {
      return res.status(400).json({ message: "Already cancelled" });
    }

    const refundAmount = calculateRefund(enrollment);

    enrollment.enrollmentStatus = "cancelled";
    enrollment.cancellationReason = reason;

    // Update payment
    enrollment.payment.paymentStatus = "refunded";
    enrollment.payment.refundAmount = refundAmount;
    enrollment.payment.transactions.push({
      amount: refundAmount,
      date: new Date(),
      type: "refund",
    });

    await enrollment.save();

    res.json({
      success: true,
      message: "Program cancelled & refund processed",
      refundAmount,
    });
  } catch (error) {
    console.log("Cancel Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ============================================================
// 4️⃣ COACH CANCEL A SINGLE SESSION
// ============================================================
exports.cancelSession = async (req, res) => {
  try {
    const { enrollmentId, sessionId } = req.params;

    const enrollment = await Enrollment.findById(enrollmentId);
    if (!enrollment)
      return res.status(404).json({ message: "Enrollment not found" });

    const session = enrollment.sessions.id(sessionId);
    if (!session) return res.status(404).json({ message: "Session not found" });

    session.status = "cancelled";

    await enrollment.save();

    res.json({
      success: true,
      message: "Session cancelled",
      session,
    });
  } catch (error) {
    console.log("Session Cancel Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ============================================================
// 5️⃣ MARK PROGRAM COMPLETED
// ============================================================
exports.markProgramComplete = async (req, res) => {
  try {
    const { enrollmentId } = req.params;

    const enrollment = await Enrollment.findById(enrollmentId);
    if (!enrollment)
      return res.status(404).json({ message: "Enrollment not found" });

    const allCompleted = enrollment.sessions.every(
      (s) => s.status === "completed"
    );

    if (!allCompleted) {
      return res.status(400).json({
        message: "Some sessions are still pending",
      });
    }

    enrollment.enrollmentStatus = "completed";
    await enrollment.save();

    res.json({
      success: true,
      message: "Program marked as completed",
    });
  } catch (error) {
    console.log("Complete Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ============================================================
// 6️⃣ GET STUDENT ALL ENROLLMENTS
// ============================================================
exports.getStudentEnrollments = async (req, res) => {
  try {
    const { studentId } = req.params;

    const enrollments = await Enrollment.find({ studentId }).populate(
      "programId"
    );

    res.json({
      success: true,
      count: enrollments.length,
      data: enrollments,
    });
  } catch (error) {
    console.log("Get Student Enrollments Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ============================================================
// 7️⃣ GET COACH ALL ENROLLMENTS
// ============================================================
exports.getCoachEnrollments = async (req, res) => {
  try {
    const { coachId } = req.params;

    const enrollments = await Enrollment.find({ coachId }).populate(
      "programId"
    );

    res.json({
      success: true,
      count: enrollments.length,
      data: enrollments,
    });
  } catch (error) {
    console.log("Get Coach Enrollments Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
