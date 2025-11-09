const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema({
  coachId: {
    type: String,

    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
  userName: { type: String, required: true },
  userProfileUrl: { type: String },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  content: { type: String },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Review", ReviewSchema);
