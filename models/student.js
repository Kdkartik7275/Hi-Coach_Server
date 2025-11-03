const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, unique: true },
    email: { type: String, required: true },
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    bio: { type: String, default: "" },
    gender: { type: String, enum: ["Male", "Female", "Other"] },
    userType: { type: String },
    profileUrls: {
      type: [String],
      default: [],
    },
    favouriteCoaches: {
      type: [String],
      default: [],
    },
    dateOfBirth: { type: String },
    sports: { type: [String], required: true },
  },
  {
    timestamps: true,
  }
);

const Student = mongoose.model("Student", studentSchema);
module.exports = Student;
