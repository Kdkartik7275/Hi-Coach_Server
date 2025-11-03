const ChatRoom = require("../models/ChatRoom");
const Message = require("../models/Message");

const createChatRoom = async (req, res) => {
  try {
    const { studentId, coachId } = req.body;

    let chatRoom = await ChatRoom.findOne({ members: { $all: [studentId, coachId] } });

    if (!chatRoom) {
      chatRoom = new ChatRoom({ members: [studentId, coachId] });
      await chatRoom.save();
    }

    res.status(200).json(chatRoom);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getUserChatRooms = async (req, res) => {
  try {
    const { userId } = req.params;

    const chatRooms = await ChatRoom.find({ members: userId }).sort({ createdAt: -1 });

    const chatRoomsWithUnreadCount = await Promise.all(
      chatRooms.map(async (chatRoom) => {
        const unreadCount = await Message.countDocuments({
          chatRoomId: chatRoom._id,
          isRead: false,
          senderId: { $ne: userId }, 
        });

        return { ...chatRoom.toObject(), unreadCount };
      })
    );

    res.status(200).json(chatRoomsWithUnreadCount);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



module.exports = {
  createChatRoom,
  getUserChatRooms,
};
