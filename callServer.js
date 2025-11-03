module.exports = function setupCallServer(io) {
  io.on("connection", (socket) => {
    console.log("WebRTC user connected:", socket.id);

    socket.on("callOffer", (data) => {
      io.to(data.receiverId).emit("receiveCall", data);
    });

    socket.on("callAnswer", (data) => {
      io.to(data.callerId).emit("callAnswered", data);
    });

    socket.on("iceCandidate", (data) => {
      io.to(data.target).emit("iceCandidate", data.candidate);
    });

    socket.on("endCall", (data) => {
      io.to(data.target).emit("callEnded");
    });

    socket.on("disconnect", () => {
      console.log("WebRTC user disconnected:", socket.id);
    });
  });
};
