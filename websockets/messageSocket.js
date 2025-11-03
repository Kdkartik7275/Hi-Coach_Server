const { WebSocketServer } = require("ws");
const Message = require("../models/Message");
const ChatRoom = require("../models/ChatRoom");
const { sendChatListUpdate } = require("./chatSocket");

const messagesWSS = new WebSocketServer({ port: 5000 });
let messageClients = {}; // Stores active message connections

messagesWSS.on("connection", (ws, req) => {
  const userId = req.url.split("?userId=")[1]; // Extract userId from URL
  if (userId) {
    messageClients[userId] = ws;
    console.log(`User ${userId} connected to messages WebSocket`);
  }

  ws.on("message", async (data) => {
    const { chatRoomId, senderId, content, messageType, mediaUrl } = JSON.parse(data);

    try {
      // Save message to DB
      const newMessage = new Message({ chatRoomId, senderId, content, messageType, mediaUrl, isRead: false });
      await newMessage.save();

      // Update chatroom with last message and increase unread count
      const chatRoom = await ChatRoom.findById(chatRoomId);
      if (chatRoom) {
        chatRoom.message = content;
        chatRoom.unreadCount += 1;
        await chatRoom.save();
      }

      // Notify chat list socket
      sendChatListUpdate(chatRoomId, senderId, content);

      // Find receiver
      const receiverId = chatRoom.members.find(id => id !== senderId);

      // Send message to receiver if online
      if (messageClients[receiverId]) {
        messageClients[receiverId].send(JSON.stringify(newMessage));
      }
    } catch (error) {
      console.error("Error processing message:", error);
    }
  });

  ws.on("close", () => {
    delete messageClients[userId];
  });
});
