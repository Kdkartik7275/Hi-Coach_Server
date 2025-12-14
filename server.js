const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const http = require("http");
const socketIo = require("socket.io");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const coachRoutes = require("./routes/coachRoutes");
const studentRoutes = require("./routes/studentRoutes");
const searchRoutes = require("./routes/searchRoutes");
const sessionRoutes = require("./routes/sessionRoutes");
const chatRoomRoutes = require("./routes/chatRoutes");
const messagesRoutes = require("./routes/messageRoutes");
const reviewRoutes = require("./routes/reviewRoute");
const trainingProgramRoutes = require("./routes/trainingProgramRoutes");
const bookingRoutes = require("./routes/bookingRoutes");

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);

// Configure allowed origins
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',') 
  : ['http://localhost:3000'];

const io = socketIo(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

// Store active users
let onlineUsers = new Map();

// Socket authentication middleware
const socketAuthMiddleware = require("./middleware/socketAuthMiddleware");
io.use(socketAuthMiddleware);

// WebSocket logic
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id, "UserId:", socket.userId);

  // User joins - use authenticated userId from socket
  socket.on("join", () => {
    console.log(`${socket.userId} joined with socket ID: ${socket.id}`);
    onlineUsers.set(socket.userId, socket.id);
  });

  // Handle incoming messages
  socket.on("sendMessage", async (messageData) => {
    const { chatRoomId, content, messageType, mediaUrl, timestamp } = messageData;

    try {
      // Use authenticated userId from socket, not from client data
      const senderId = socket.userId;

      // Validate user is member of chat room
      const ChatRoom = require("./models/ChatRoom");
      const chatRoom = await ChatRoom.findById(chatRoomId);
      
      if (!chatRoom || !chatRoom.members.includes(senderId)) {
        return socket.emit("error", { message: "Unauthorized: Not a member of this chat room" });
      }

      // Validate content
      if (!content || content.trim().length === 0) {
        return socket.emit("error", { message: "Message content cannot be empty" });
      }

      if (content.length > 5000) {
        return socket.emit("error", { message: "Message too long" });
      }

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

      await ChatRoom.findByIdAndUpdate(chatRoomId, {
        message: content,
        createdAt: messageTime,
      });

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
  socket.on("markAsRead", async ({ chatRoomId }) => {
    try {
      const userId = socket.userId; // Use authenticated userId

      // Verify user is member of chat room
      const ChatRoom = require("./models/ChatRoom");
      const chatRoom = await ChatRoom.findById(chatRoomId);
      
      if (!chatRoom || !chatRoom.members.includes(userId)) {
        return socket.emit("error", { message: "Unauthorized" });
      }

      const Message = require("./models/Message");
      await Message.updateMany({ chatRoomId, senderId: { $ne: userId } }, { isRead: true });

      // Notify sender that messages were read
      chatRoom.members.forEach((member) => {
        if (member !== userId) {
          const senderSocketId = onlineUsers.get(member);
          if (senderSocketId) {
            io.to(senderSocketId).emit("messagesRead", { chatRoomId });
          }
        }
      });
    } catch (error) {
      console.error("Error in markAsRead:", error);
      socket.emit("error", { message: "Failed to mark messages as read" });
    }
  });

  socket.on("typing", ({ chatRoomId }) => {
    const userId = socket.userId; // Use authenticated userId
    const ChatRoom = require("./models/ChatRoom");
    console.log('User typing');
    ChatRoom.findById(chatRoomId).then((chatRoom) => {
      if (chatRoom && chatRoom.members.includes(userId)) {
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
  socket.on("stopTyping", ({ chatRoomId }) => {
    const userId = socket.userId; // Use authenticated userId
    const ChatRoom = require("./models/ChatRoom");
    console.log('Stop typing');
    ChatRoom.findById(chatRoomId).then((chatRoom) => {
      if (chatRoom && chatRoom.members.includes(userId)) {
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
    console.log("User disconnected:", socket.id, "UserId:", socket.userId);
    if (socket.userId) {
      onlineUsers.delete(socket.userId);
    }
  });
});




// Security Middleware
app.use(helmet()); // Set security headers
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // Limit auth attempts
  message: "Too many login attempts, please try again later.",
});

app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);
app.use("/api/auth/forgot-password", authLimiter);
app.use("/api/", limiter);

// Body parser with size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Data sanitization against NoSQL injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/coaches", coachRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/session", sessionRoutes);
app.use("/api/chats", chatRoomRoutes);
app.use("/api/messages", messagesRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/training-program",trainingProgramRoutes);
app.use("/api/booking",bookingRoutes)

const PORT = process.env.PORT || 3000;


server.listen(PORT,'0.0.0.0',() => {
  console.log(`Server running on port ${PORT}`);
});

