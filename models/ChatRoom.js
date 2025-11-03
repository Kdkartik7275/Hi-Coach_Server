const mongoose = require("mongoose");

const ChatRoomSchema = new mongoose.Schema({
  members: [{ type: String, required: true }], 
  message: { type: String, default:"" },
  unreadCount:{type:Number,default:0},

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("ChatRoom", ChatRoomSchema);
