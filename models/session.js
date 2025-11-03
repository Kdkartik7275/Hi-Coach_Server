const mongoose = require("mongoose");


const coachingAreaSchema = new mongoose.Schema({
  label: { type: String, required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
},{ _id: false });


const SessionSchema = new mongoose.Schema({
  id:{ type: String, required: true ,unique:true},
  coachID: { type: String, required: true },
  coachName: { type: String, required: true },
  coachProfileUrl: { type: String, required: true },
  location: {
   type: coachingAreaSchema,
    required: true,
  },
  sport: { type: String, required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  repeat: { type: String, required: true },
  pax: { type: Number, required: true },
  amount: { type: Number, required: true },
  isInvitation: { type: Boolean, required: true },
  isCanceled: { type: Boolean, required: false, default:false },
  students: { type: [{ name: String, id: String,studentProfileUrl: String,bookedAt:String, isConfirmed:Boolean,isDeclined:Boolean }], default: [] },
  studentIDs: { type: [String], default: [] },
});

const Session = mongoose.model("Session", SessionSchema);



module.exports = Session ;
