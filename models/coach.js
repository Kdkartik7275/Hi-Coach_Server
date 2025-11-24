const mongoose = require("mongoose");

const coachingAreaSchema = new mongoose.Schema({
  label: { type: String, required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
});

const timingSchema = new mongoose.Schema({
  address: { type: String, required: true },
  date: { type: Date, required: true },
  isHoliday: { type: Boolean, required: true },
  timings: [
    {
      start: { type: Date, required: true },
      end: { type: Date, required: true },
    },
  ],
},{ _id: false });

const pricingSchema = new mongoose.Schema({
  title: { type: String, required: true },
  price: { type: Number, required: true },
  pax: { type: Number,default:1 }, 
});

const packageSchema = new mongoose.Schema({
  packageFor: { type: String, required: true },
  hours: { type: Number, required: true },
  actualPrice: { type: Number,default:1 }, 
  discount: { type: Number,default:0 }, 
});

const coachSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  fullName: { type: String, required: true },
  userId: { type: String, required: true, unique: true },
  phone: { type: String },
  bio: { type: String, required: true },
  gender: { type: String, enum: ["Male", "Female", "Other"] },
  userType: { type: String, enum: ["Coach", "Admin", "User"] },
  profileURL: {
    type: [String],
    default: []
  },
  dob: { type: String },
  sports: { type: [String], required: true },
  createdAt: { type: Date, default: Date.now, index: true },
  coachingAreas: { type: [coachingAreaSchema], default: [] },
  playingExperience: { type: String },
  coachingExperience: { type: String },
  certifications: { type: [String], default: [] },
  timings: { type: [timingSchema], default: [] },
  pricing: { type: [pricingSchema], default: [] },
  package: { type: [packageSchema], default: [] },
  favouriteStudents: {
    type: [String],
    default: []
  },
});

const Coach = mongoose.model("Coach", coachSchema);
module.exports = Coach;
