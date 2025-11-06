const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const http = require("http"); // Import HTTP module
const socketIo = require("socket.io"); // Import socket.io
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const coachRoutes = require("./routes/coachRoutes");
const studentRoutes = require("./routes/studentRoutes");
const searchRoutes = require("./routes/searchRoutes");
const sessionRoutes = require("./routes/sessionRoutes");
const chatRoomRoutes = require("./routes/chatRoutes");
const messagesRoutes = require("./routes/messageRoutes");

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app); // Create an HTTP server
const io = socketIo(server, {
  cors: {
    origin: "*",
  },
});

// Store active users
let onlineUsers = new Map();

// WebSocket logic
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // User joins with userId
  socket.on("join", (userId) => {
    console.log(`${userId} joined with socket ID: ${socket.id}`);
    onlineUsers.set(userId, socket.id);
  });

  // Handle incoming messages
  socket.on("sendMessage", async (messageData) => {
    const { chatRoomId, senderId, content, messageType, mediaUrl, timestamp } = messageData;

    try {
        // Save message in the database
        const Message = require("./models/Message");
        let messageTime = new Date(timestamp);
        messageTime = new Date(messageTime.getTime() - messageTime.getTimezoneOffset() * 60000);

        
        const newMessage = new Message({
            chatRoomId,
            senderId,
            content,
            messageType,
            mediaUrl,
            isRead: false,
            timestamp: messageTime,

        });

        await newMessage.save();

        const ChatRoom = require("./models/ChatRoom");
        await ChatRoom.findByIdAndUpdate(chatRoomId, {
            message: content, 
            createdAt:messageTime, 
        });

        const chatRoom = await ChatRoom.findById(chatRoomId);
        if (chatRoom) {
            chatRoom.members.forEach((member) => {
                const recipientSocketId = onlineUsers.get(member);
                if (recipientSocketId && recipientSocketId !== socket.id) {
                    io.to(recipientSocketId).emit("receiveMessage", newMessage);
                }
            });
        }
    } catch (error) {
        console.error("Error in sendMessage:", error);
    }
});



  // Handle read receipt
  socket.on("markAsRead", async ({ chatRoomId, userId }) => {
    const Message = require("./models/Message");
    await Message.updateMany({ chatRoomId, senderId: { $ne: userId } }, { isRead: true });

    // Notify sender that messages were read
    const ChatRoom = require("./models/ChatRoom");
    const chatRoom = await ChatRoom.findById(chatRoomId);
    chatRoom.members.forEach((member) => {
      if (member !== userId) {
        const senderSocketId = onlineUsers.get(member);
        if (senderSocketId) {
          io.to(senderSocketId).emit("messagesRead", { chatRoomId });
        }
      }
    });
  });

  socket.on("typing", ({ chatRoomId, userId }) => {
    const ChatRoom = require("./models/ChatRoom");
    console.log('User typing');
    ChatRoom.findById(chatRoomId).then((chatRoom) => {
      if (chatRoom) {
        chatRoom.members.forEach((member) => {
          if (member !== userId) {
            const recipientSocketId = onlineUsers.get(member);
            if (recipientSocketId) {
              io.to(recipientSocketId).emit("userTyping", { chatRoomId, userId });
            }
          }
        });
      }
    });
  });

  // Handle stop typing event
  socket.on("stopTyping", ({ chatRoomId, userId }) => {
    const ChatRoom = require("./models/ChatRoom");
    console.log('Stop typing');
    ChatRoom.findById(chatRoomId).then((chatRoom) => {
      if (chatRoom) {
        chatRoom.members.forEach((member) => {
          if (member !== userId) {
            const recipientSocketId = onlineUsers.get(member);
            if (recipientSocketId) {
              io.to(recipientSocketId).emit("userStoppedTyping", { chatRoomId, userId });
            }
          }
        });
      }
    });
  });


  

  // Handle user disconnect
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    onlineUsers.forEach((value, key) => {
      if (value === socket.id) {
        onlineUsers.delete(key);
      }
    });
  });
});




// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/coaches", coachRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/session", sessionRoutes);
app.use("/api/chats", chatRoomRoutes);
app.use("/api/messages", messagesRoutes);

const PORT = process.env.PORT || 5000;


server.listen(PORT,() => {
  console.log(`Server running on port ${PORT}`);
});

