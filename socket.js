const { Server } = require('socket.io');
const Message = require('./Models/messages');
const Friend = require('./Models/friends');
const { Op } = require('sequelize');


const initSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id);

    socket.on('join', (userId) => {
      socket.join(`user_${userId}`);
    });

    socket.on('send_message', async ({ senderId, receiverId, message }) => {
      if (!senderId || !receiverId || !message) return;

      const isFriend = await Friend.findOne({
        where: {
          status: 'accepted',
          [Op.or]: [
            { user_id: senderId, friend_id: receiverId },
            { user_id: receiverId, friend_id: senderId }
          ]
        }
      });

      if (!isFriend) {
        socket.emit('error_message', {
          message: "You can only message your friends only"
        });
        return;
      }

      const saved = await Message.create({
        senderId,
        receiverId,
        message
      });

      io.to(`user_${receiverId}`).emit('receive_message', saved);
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected:', socket.id);
    });
  });
};

module.exports = { initSocket };
