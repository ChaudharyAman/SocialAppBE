const { Op } = require("sequelize");
const Message = require("../Models/messages");
const Friend = require("../Models/friends");
const User = require("../Models/users");



exports.sendMessage = async (req, res) => {
  const senderId = req.user.id;
  const friendId = parseInt(req.params.friend_id);
  const { message } = req.body;

  if (!friendId || !message) {
    return res.status(400).json({ success: false, message: "friend_id and message are required" });
  }

  try {
    const isFriend = await Friend.findOne({
      where: {
        status: "accepted",
        [Op.or]: [
          { user_id: senderId, friend_id: friendId },
          { user_id: friendId, friend_id: senderId },
        ],
      },
    });

    if (!isFriend) {
      return res.status(403).json({ success: false, message: "You can only message your friend" });
    }

    const newMessage = await Message.create({ senderId, receiverId: friendId, message });

    return res.status(201).json({ success: true, message: newMessage });
  } catch (error) {
    return res.status(500).json({ success: false, message: `Error sending message: ${error.message}` });
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
      { senderId: friendId, receiverId: userId },
    ],
  };

  if (beforeTimestamp) {
    whereCondition.timestamp = { [Op.lt]: new Date(beforeTimestamp) };
  }

  try {
    const messages = await Message.findAll({
      where: whereCondition,
      order: [["timestamp", "DESC"]],
      limit,
      include: [
        { model: User, as: "sender", attributes: ["id", "username", "media_url"] },
        { model: User, as: "receiver", attributes: ["id", "username", "media_url"] },
      ],
    });

    return res.status(200).json({ success: true, messages });
  } catch (error) {
    return res.status(500).json({ success: false, message: `Error getting chat history: ${error.message}` });
  }
};



exports.getRecentChats = async (req, res) => {
  const userId = req.user.id;

  try {
    const messages = await Message.findAll({
      where: {
        [Op.or]: [
          { senderId: userId },
          { receiverId: userId },
        ],
      },
      order: [["timestamp", "DESC"]],
      include: [
        { model: User, as: "sender", attributes: ["id", "username", "media_url"] },
        { model: User, as: "receiver", attributes: ["id", "username", "media_url"] },
      ],
    });

    const recentChatsMap = {};
    messages.forEach(msg => {
      const friendId = msg.senderId === userId ? msg.receiverId : msg.senderId;
      if (!recentChatsMap[friendId]) recentChatsMap[friendId] = msg;
    });

    const recentChats = Object.values(recentChatsMap);

    return res.status(200).json({ 
      success: true, 
      recentChats 
      
    });
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      message: `Error fetching recent chats: ${error.message}` 
    });
  }
};
