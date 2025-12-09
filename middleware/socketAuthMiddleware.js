const jwt = require("jsonwebtoken");

const socketAuthMiddleware = (socket, next) => {
  try {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(" ")[1];

    if (!token) {
      return next(new Error("Authentication error: No token provided"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.userId;
    socket.userType = decoded.userType;
    
    next();
  } catch (error) {
    console.error("Socket Auth Error:", error.message);
    return next(new Error("Authentication error: Invalid token"));
  }
};

module.exports = socketAuthMiddleware;
