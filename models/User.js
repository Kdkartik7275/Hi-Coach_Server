const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  fullname: { type: String, required: true },
  email: { 
    type: String, 
    required: true, 
    trim: true,
    lowercase: true,  
    validate: {
      validator: (value) => {
        const re = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
        return re.test(value);
      },
      message: "Please enter a valid email address",
    },
  },
  password: { type: String, required: true },
  userId: { type: String, unique: true, required: true },
  userType: { type: String, enum: ["Student", "Coach"], required: true },
  createdAt: { type: Date, default: Date.now },
});


module.exports = mongoose.model("User", UserSchema);
