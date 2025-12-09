const ChatRoom = require("../models/ChatRoom");
const Message = require("../models/Message");

const createChatRoom = async (req, res) => {
  try {
    const { studentId, coachId } = req.body;
    const authenticatedUserId = req.user.userId;

    // Ensure authenticated user is one of the members
    if (authenticatedUserId !== studentId && authenticatedUserId !== coachId) {
      return res.status(403).json({ 
        message: "Forbidden: You can only create chat rooms you are part of" 
      });
    }

    // Validate user IDs format
    if (!studentId?.startsWith("Student-") || !coachId?.startsWith("Coach-")) {
      return res.status(400).json({ 
        message: "Invalid user IDs format" 
      });
    }

    let chatRoom = await ChatRoom.findOne({ members: { $all: [studentId, coachId] } });

    if (!chatRoom) {
      chatRoom = new ChatRoom({ members: [studentId, coachId] });
      await chatRoom.save();
    }

    res.status(200).json(chatRoom);
  } catch (error) {
    console.error("Create Chat Room Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getUserChatRooms = async (req, res) => {
  try {
    const { userId } = req.params;
    const authenticatedUserId = req.user.userId;

    // Ensure user can only access their own chat rooms
    if (userId !== authenticatedUserId) {
      return res.status(403).json({ 
        message: "Forbidden: You can only access your own chat rooms" 
      });
    }

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
    console.error("Get User Chat Rooms Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createChatRoom,
  getUserChatRooms,
};
