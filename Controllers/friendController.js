const Friend = require('../Models/friends');
const User = require('../Models/users');
const { Op } = require('sequelize');

exports.sendFriendRequest = async (req, res) => {
  try {
    const { username } = req.params;
    const user_id = req.user.id;

    if (!user_id) {
      return res.status(401).json({ 
        success: false, 
        message: "You must be logged in to send friend request" });
    }
    if (!username) {
      return res.status(400).json({ 
        success: false, 
        message: "username is required" });
    }

    const friendUser = await User.findOne({ 
    where: { 
      username 
    } });
    const user = await User.findByPk(user_id);

    if (!user || !friendUser) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" });
    }

    if (user.id == friendUser.id) {
      return res.status(400).json({ 
        success: false, 
        message: "You cannot send a friend request to yourself" });
    }

    const existingRequest = await Friend.findOne({
      where: { 
        user_id: user.id, 
        friend_id: friendUser.id }
    });
    const reverseRequest = await Friend.findOne({
      where: { 
        user_id: friendUser.id, 
        friend_id: user.id }
    });

    if (existingRequest || reverseRequest) {
      return res.status(400).json({ 
        success: false, 
        message: "Friend request already sent or already friends" });
    }

    const request = await Friend.create({
      user_id: user.id,
      user_username: user.username,
      friend_id: friendUser.id,
      friend_username: friendUser.username,
      status: 'pending'
    });

    return res.status(201).json({ 
      success: true, 
      message: "Friend request sent", data: request });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: `Error sending friend request. ${error.message}` });
  }
};

exports.acceptFriendRequest = async (req, res) => {
  try {
    const { username } = req.params;
    const user_id = req.user.id;

    if (!user_id) {
      return res.status(401).json({ 
        success: false, 
        message: "You must be logged in to accept friend request" });
    }

    const friendUser = await User.findOne({ 
      where: { 
      username 

    } });
    if (!friendUser) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" });
    }

    const request = await Friend.findOne({
      where: {
        user_id: friendUser.id,
        friend_id: user_id,
        status: 'pending'
      }
    });

    if (!request) {
      return res.status(404).json({ 
        success: false, 
        message: "No pending friend request found from this user" });
    }


    request.status = 'accepted';
    await request.save();

    return res.status(200).json({ 
      success: true, 
      message: "Friend request accepted", data: request });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: `Error accepting friend request: ${error.message}` });
  }
};


exports.getSentRequests = async (req, res) => {
  try {
    const user_id = req.user.id;

    if (!user_id) {
      return res.status(401).json({ 
        success: false, 
        message: "You must be logged in to view sent requests" });
    }

    const sentRequests = await Friend.findAll({
      where: { 
        user_id, 
        status: "pending" }
    });

    const formattedRequests = sentRequests.map(req => ({
      friend_id: req.friend_id,
      friend_username: req.friend_username,
      status: req.status
    }));

    res.status(200).json({ 
      success: true, 
      requests: formattedRequests });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: `Error getting sent requests: ${error.message}` });
  }
};



exports.cancelFriendRequest = async (req, res) => {
  try {
    const { username } = req.params;
    const user_id = req.user.id;

    if (!user_id) {
      return res.status(401).json({ 
        success: false, 
        message: "You must be logged in to cancel a friend request" });
    }

    const friendUser = await User.findOne({ 
      where: { 
      username } });
    if (!friendUser) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" });
    }

    const request = await Friend.findOne({
      where: {
        status: "pending",
        [Op.or]: [
          { user_id, friend_id: friendUser.id },
          { user_id: friendUser.id, friend_id: user_id },
        ],
      },
    });


    if (!request) {
      return res.status(404).json({ 
        success: false, 
        message: "No pending friend request found to cancel" });
    }

    await request.destroy();
    return res.status(200).json({ 
      success: true, 
      message: "Friend request cancelled" });
  } 
  catch (error) {
    res.status(500).json({ 
      success: false, 
      message: `Error cancelling friend request: ${error.message}` });
  }
};


exports.getFriends = async (req, res) => {
  try {
    const { username } = req.params;

    const user = await User.findOne({ 
      where: { 
      username 

    } });
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    const friends = await Friend.findAll({
      where: {
        status: 'accepted',
        [Op.or]: [{ user_id: user.id }, { friend_id: user.id }]
      }
    });

    const formattedFriends = friends.map(f => ({
      user_id: f.user_id,
      user_username: f.user_username,
      friend_id: f.friend_id,
      friend_username: f.friend_username,
      status: f.status
    }));

    res.status(200).json({ 
      success: true, 
      friends: formattedFriends 

    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: `Error getting friends ${error.message}` 
    });
  }
};



exports.removeFriend = async (req, res) => {
  try {
    const { username } = req.params;
    const user_id = req.user.id;

    if (!user_id) {
      return res.status(401).json({ 
        success: false, 
        message: "You must be logged in to remove friend" 

      });
    }

    const friendUser = await User.findOne({ 
      where: { 
      username 

    } });
    if (!friendUser) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 

      });
    }

    const friend = await Friend.findOne({
      where: {
        [Op.or]: [
          { user_id, friend_id: friendUser.id, status: "accepted" },
          { user_id: friendUser.id, friend_id: user_id, status: "accepted" }
        ]
      }
    });

    if (!friend) {
      return res.status(404).json({ 
        success: false, 
        message: "Friend does not exist" 

      });
    }

    await friend.destroy();
    return res.status(200).json({ 
      success: true, 
      message: "Friend successfully removed" });
  } 
  catch (error) {
    res.status(500).json({ 
      success: false, 
      message: `Failed to remove friend. ${error.message}` 
    });
  }
};



exports.getMyFriends = async (req, res) => {
  try {
    const loggedInUserId = req.user.id;

    const friends = await Friend.findAll({
      where: {
        status: "accepted",
        [Op.or]: [
          { user_id: loggedInUserId },
          { friend_id: loggedInUserId }
        ]
      },
      include: [
        { model: User, as: "requester", attributes: ["id", "username", "first_name", "last_name", "media_url"] },
        { model: User, as: "receiver", attributes: ["id", "username", "first_name", "last_name", "media_url"] }
      ]
    });

    const formattedFriends = friends.map(f => {
      if (f.user_id === loggedInUserId) {
        return f.receiver;
      } else {
        return f.requester;
      }
    });

    res.status(200).json({
      success: true,
      friends: formattedFriends
    });

  } catch (error) {
    console.error("Error fetching friends:", error);
    res.status(500).json({
      success: false,
      message: `Error getting friends: ${error.message}`
    });
  }
};




exports.getUserFriendsByUsername = async (req, res) => {
  try {
    const { username } = req.params;

    if (!username) {
      return res.status(400).json({
        success: false,
        message: "Username is required",
      });
    }

    const user = await User.findOne({
      where: { username },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const friends = await Friend.findAll({
      where: {
        status: "accepted",
        [Op.or]: [{ user_id: user.id }, { friend_id: user.id }],
      },
      include: [
        {
          model: User,
          as: "requester",
          attributes: ["id", "username", "first_name", "last_name", "media_url"],
        },
        {
          model: User,
          as: "receiver",
          attributes: ["id", "username", "first_name", "last_name", "media_url"],
        },
      ],
    });

    const formattedFriends = friends.map((f) => {
      if (f.user_id === user.id) {
        return {
          id: f.receiver.id,
          username: f.receiver.username,
          first_name: f.receiver.first_name,
          last_name: f.receiver.last_name,
          media_url: f.receiver.media_url,
          status: f.status,
        };
      } else {
        // If current user is the receiver → show requester
        return {
          id: f.requester.id,
          username: f.requester.username,
          first_name: f.requester.first_name,
          last_name: f.requester.last_name,
          media_url: f.requester.media_url,
          status: f.status,
        };
      }
    });

    return res.status(200).json({
      success: true,
      friends: formattedFriends,
    });
  } catch (error) {
    console.error("Error fetching user friends:", error);
    return res.status(500).json({
      success: false,
      message: `Error fetching user friends: ${error.message}`,
    });
  }
};
