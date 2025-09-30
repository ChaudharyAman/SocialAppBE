const { Server } = require("socket.io");

require("dotenv").config();


function initSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: process.env.BASE_URL,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    socket.on("join", (userId) => {
      if (userId) socket.join(userId.toString());
    });

    socket.on("send_message", (msg) => {
      if (msg.receiverId) {
        io.to(msg.receiverId.toString()).emit("receive_message", msg);
        io.to(msg.receiverId.toString()).emit("receive_message_notification", msg);
      }
    });


    socket.on("disconnect", () => {});
  });
}

module.exports = { initSocket };
