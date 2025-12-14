const mongoose = require("mongoose");

const enrollmentSchema = new mongoose.Schema(
  {
    studentId: { type: String, required: true },
    coachId: { type: String, required: true },

    programId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TrainingProgram",
      required: true,
    },

    // "The program duration"
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },

    sessions: [
      {
        index: Number,
        sessionDate: Date,
        slot: String,
        status: {
          type: String,
          enum: ["pending", "completed", "cancelled"],
          default: "pending",
        },
        attendance: {
          type: String,
          enum: ["present", "absent", null],
          default: null,
        },
      },
    ],

    payment: {
      type: {
        paymentType: {
          type: String,
          enum: ["per_session", "full_advance"],
          required: true,
        },
        paymentStatus: {
          type: String,
          enum: ["pending", "paid", "refunded", "partially_paid"],
          default: "pending",
        },
        totalAmount: { type: Number, required: true },
        paidAmount: { type: Number, default: 0 },
        refundAmount: { type: Number, default: 0 },
        transactions: [
          {
            amount: Number,
            date: Date,
            type: { type: String, enum: ["payment", "refund"] },
          },
        ],
      },
      required: true,
    },

    enrollmentStatus: {
      type: String,
      enum: ["pending","active", "completed", "cancelled"],
      default: "pending",
    },

    cancellationReason: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Enrollment", enrollmentSchema);
