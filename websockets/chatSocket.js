const { WebSocketServer } = require("ws");
const ChatRoom = require("../models/ChatRoom");
const Message = require("../models/Message");

const chatsWSS = new WebSocketServer({ port: 6000 });
let chatClients = {}; // Stores connected users for chat list updates

chatsWSS.on("connection", (ws, req) => {
  const userId = req.url.split("?userId=")[1]; // Extract userId from URL
  if (userId) {
    chatClients[userId] = ws;
    console.log(`User ${userId} connected to chats WebSocket`);
  }

  ws.on("close", () => {
    delete chatClients[userId];
  });
});

// Function to send chat list updates
async function sendChatListUpdate(chatRoomId, senderId, content) {
  try {
    const chatRoom = await ChatRoom.findById(chatRoomId);
    if (!chatRoom) return;

    // Find the receiver
    const receiverId = chatRoom.members.find(id => id !== senderId);

    // Count unread messages
    const unreadCount = await Message.countDocuments({ chatRoomId, senderId, isRead: false });

    const chatUpdate = { chatId: chatRoomId, lastMessage: content, unreadCount };

    // Send update if receiver is online
    if (chatClients[receiverId]) {
      chatClients[receiverId].send(JSON.stringify(chatUpdate));
    }
  } catch (error) {
    console.error("Error sending chat list update:", error);
  }
}

module.exports = { sendChatListUpdate };
