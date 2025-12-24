const mongoose = require("mongoose");

const traningProgramSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    sport: { type: String, required: true },
    level: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      required: true,
    },
    durationDays: {
      type: Number,
      required: true,
    },

    totalSessions: {
      type: Number,
      required: true,
    },
    frequency: {
      type: Number,
      required: true,
    },

    price: {
      type: Number,
      required: true,
    },

    slots: [{ type: String, required: true }],
    learningOutcomes: [{ type: String, required: true }],
    requirements: [{ type: String }],

    description: { type: String, required: true },
    thumbnailUrl: {
      type: String,
    },

    coachId: { type: String, required: true },
    coachName: { type: String, required: true },

    deletedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

const TrainingProgram = mongoose.model("TrainingProgram", traningProgramSchema);
module.exports = TrainingProgram;
