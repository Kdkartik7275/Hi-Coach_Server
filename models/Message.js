const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
  chatRoomId: { type: mongoose.Schema.Types.ObjectId, ref: "ChatRoom", required: true },
  senderId: { type: String, required: true },
  content: { type: String, required: true },
  mediaUrl: {type: String,required:false,default:""},
  messageType: { type: String, enum: ["text", "image", "video", "audio"], default: "text" },
  timestamp: { type: Date, default: Date.now },
  isRead: { type: Boolean, default: false }
});

module.exports = mongoose.model("Message", MessageSchema);
