const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema({
  coachId: { type: String, required: true },
  reviews: { type: [{ userName: String, userId: String,userProfileUrl:String, review:Number,content:String,createdAt:Date }], default: [] },

});

module.exports = mongoose.model("Review", ReviewSchema);
