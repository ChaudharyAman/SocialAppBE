const Message = require('../Models/messages');
const Friend = require('../Models/friends');
const { Op } = require('sequelize');


exports.sendMessage = async (req, res) => {

 const senderId = req.user.id;

  const friend_id = parseInt(req.params.friend_id)

 const { message } = req.body;

  if (!friend_id || !message) {
    return res.status(400).json({
      success: false,
      message: "friend_id and message are required"
    });
  }

  try {
    const isFriend = await Friend.findOne({
      where: {
        status: 'accepted',
        [Op.or]: [
          { user_id: senderId, friend_id },
          { user_id: friend_id, friend_id: senderId }
        ]
      }
    });

    if (!isFriend) {
      return res.status(403).json({
        success: false,
        message: "You can only message your friend"
      });
    }

    const newMessage = await Message.create({
      senderId,
      receiverId: friend_id,
      message
    });

    return res.status(201).json({
      success: true,
      message: newMessage
    });
  }

  catch (error) {
    return res.status(500).json({
      success: false,
      message: `Error sending message. ${error.message}`
    });
  }
};



exports.getChatHistory = async (req, res) => {

  const userId = req.user.id;

  const friendId = parseInt(req.params.friend_id);

  const limit = parseInt(req.query.limit) || 20;

  const beforeTimestamp = req.query.beforeTimestamp;

  let whereCondition = {
    [Op.or]: [
      { senderId: userId, receiverId: friendId },
      { senderId: friendId, receiverId: userId }
    ]
  };

  if (beforeTimestamp) {
    whereCondition.timestamp = { [Op.lt]: new Date(beforeTimestamp) };
  }

  try {
    const messages = await Message.findAll({
      where: whereCondition,
      order: [['timestamp', 'DESC']],
      limit
    });

    return res.status(200).json({
      success: true,
      messages
    });

  }
  catch (error) {
    return res.status(500).json({
      success: false,
      message: `Error getting chat history. ${error.message}`
    });
  }
};