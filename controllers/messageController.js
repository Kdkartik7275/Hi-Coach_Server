const Message = require("../models/Message");
const ChatRoom = require("../models/ChatRoom");

const getMessagesByChatRoom = async (req, res) => {
  try {
    const { chatRoomId } = req.params;
    const userId = req.user.userId;

    // Verify user is a member of the chat room
    const chatRoom = await ChatRoom.findById(chatRoomId);
    if (!chatRoom) {
      return res.status(404).json({ message: "Chat room not found" });
    }

    if (!chatRoom.members.includes(userId)) {
      return res.status(403).json({ 
        message: "Forbidden: You are not a member of this chat room" 
      });
    }

    const messages = await Message.find({ chatRoomId }).sort({ timestamp: 1 });

    res.status(200).json(messages);
  } catch (error) {
    console.error("Get Messages Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getMessagesByChatRoom,
};
