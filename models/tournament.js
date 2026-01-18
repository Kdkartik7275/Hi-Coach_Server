const mongoose = require("mongoose");

/* ---------------- Match Schema ---------------- */
const MatchSchema = new mongoose.Schema({
  round: { type: Number, required: true },
  matchNumber: { type: Number, required: true },

  playerA: { type: String, required: true },
  playerB: { type: String, required: true },

  scoreA: { type: Number, default: 0 },
  scoreB: { type: Number, default: 0 },

  winner: { type: String, default: null },

  court: { type: String, default: "TBD" },
  scheduledAt: { type: Date, default: null },

  status: {
    type: String,
    enum: ["upcoming", "live", "completed"],
    default: "upcoming",
  },
});


/* ---------------- Registration Schema ---------------- */
const RegistrationSchema = new mongoose.Schema({
  student: { type: String, required: true }, // userId of the registering player

  fullName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  dob: { type: String, required: true },

  emergencyContactName: { type: String, required: true },
  emergencyContactPhone: { type: String, required: true },

  teamName: {
    type: String,
    required: function () {
      const format = this.$parent()?.format;
      return format === "duo" || format === "team";
    },
  },

  format: {
    type: String,
    enum: ["solo", "duo", "team"],
    required: true,
    default: "solo",
  },

  registeredAt: { type: Date, required: true, default: Date.now },

  status: {
    type: String,
    enum: ["registered", "checked_in", "eliminated", "qualified", "winner"],
    required: true,
    default: "registered",
  },
});


/* ---------------- Tournament Schema ---------------- */
const TournamentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },

    sport: { type: String, required: true, default: "tennis" },
    category: { type: String, required: true },

    posterUrl: { type: String, required: true },
    bannerUrl: { type: String, required: true },

    organizerName: { type: String, required: true },

    venue: {
      name: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      country: { type: String, required: true },
    },

    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },

    registrationOpenAt: { type: Date, required: true },
    registrationCloseAt: { type: Date, required: true },

    maxParticipants: { type: Number, required: true },
    entryFee: { type: Number, required: true, default: 0 },
    currency: { type: String, required: true, default: "INR" },

    prize: {
      first: { type: String, required: true },
      second: { type: String, required: true },
      third: { type: String, required: true },
    },

    rules: { type: [String], required: true },

    status: {
      type: String,
      enum: ["upcoming", "ongoing", "completed", "cancelled"],
      required: true,
      default: "upcoming",
      index: true,
    },

    visibility: {
      type: String,
      enum: ["public", "private"],
      required: true,
      default: "public",
    },

    format: {
      type: String,
      enum: ["solo", "duo", "team"],
      required: true,
      default: "solo",
      index: true,
    },

    registrations: { type: [RegistrationSchema], default: [] },
    matches: { type: [MatchSchema], default: [] },

    currentRound: { type: Number, required: true, default: 1 },

    createdBy: { type: String, required: true }, // coach/admin userId
  },
  { timestamps: true }
);

module.exports = mongoose.model("Tournament", TournamentSchema);
