
const Friend = require('../Models/friends');
const User = require('../Models/users');
const { Op } = require('sequelize');



 exports.sendFriendRequest = async (req, res) => {
  try {
    const { friend_id } = req.params;

    const user_id = req.user.id;

    if(!user_id){
      return res.status(401).json({
        success: false,
        message: "You must be logged in to send friend request"
      })
    }

    if (!friend_id) {
      return res.status(400).json({
        success: false,
        message: "friend_id is required"
      });
    }

    if (user_id == friend_id) {
      return res.status(400).json({
        success: false,
        message: "You cannot send a friend request to yourself"
      });
    }

    const existingRequest = await Friend.findOne({
      where: {
        user_id,
        friend_id
      }
    });

    const reverseRequest = await Friend.findOne({
      where: {
        user_id: friend_id,
        friend_id: user_id
      }
    });


    if (existingRequest || reverseRequest) {
      return res.status(400).json({
        success: false,
        message: "Friend request already sent or already friends"
      });
    }

    const request = await Friend.create({
      user_id,
      friend_id,
      status: 'pending'
    });

    return res.status(201).json({
      success: true,
      message: "Friend request sent",
      data: request
    });

  }

  catch (error) {
    res.status(500).json({ 
      success: false, 
      message: `Error sending friend request. ${error.message}`
    });
  }
};



 exports.acceptFriendRequest = async (req, res) => {
   try {
     const {  friend_id } = req.body; 

    const user_id = req.user.id;

    if(!user_id){
      return res.status(401).json({
        success: false,
        message: "You must be logged in to accept friend request"
      })
    }

     const request = await Friend.findOne({
      where: {
        user_id: friend_id,
        friend_id: user_id,
        status: 'pending'
       }
     });

     if (!request) {
       return res.status(404).json({
         success: false,
         message: "No pending friend request found from this user"
       });
     }


     request.status = 'accepted';
     await request.save();


     return res.status(200).json({
       success: true,
       message: "Friend request accepted",
       data: request
     });

   } 
   
   catch (error) {
     res.status(500).json({ 
       success: false, 
       message: `Error accepting friend request: ${error.message}`
     });
   }
 };

exports.getSentRequests = async (req, res) => {
  try {
    const user_id = req.user.id;

    if (!user_id) {
      return res.status(401).json({
        success: false,
        message: "You must be logged in to view sent requests"
      });
    }

    const sentRequests = await Friend.findAll({
      where: {
        user_id,
        status: "pending"
      },
      include: [
        { model: User, as: "receiver", attributes: ["id", "username", "first_name", "last_name", "media_url"] }
      ]
    });

    const formattedRequests = sentRequests.map(req => req.receiver);

    res.status(200).json({
      success: true,
      requests: formattedRequests
    });

  } catch (error) {
    console.error("Error fetching sent requests:", error);
    res.status(500).json({
      success: false,
      message: `Error getting sent requests: ${error.message}`
    });
  }
};

exports.cancelFriendRequest = async (req, res) => {
  try {
    const { friend_id } = req.params;  
    const user_id = req.user.id;

    if (!user_id) {
      return res.status(401).json({
        success: false,
        message: "You must be logged in to cancel a friend request",
      });
    }

    const request = await Friend.findOne({
      where: {
        status: "pending",
        [Op.or]: [
          { user_id, friend_id },      
          { user_id: friend_id, friend_id: user_id },
        ],
      },
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "No pending friend request found to cancel",
      });
    }

    await request.destroy();

    return res.status(200).json({
      success: true,
      message: "Friend request cancelled",
    });
  } 
  catch (error) {
    res.status(500).json({
      success: false,
      message: `Error cancelling friend request: ${error.message}`,
    });
  }
};



 exports.getFriends = async (req, res) => {
    try {
      const { user_id } = req.params;

      const friends = await Friend.findAll({
        where: {
          status: 'accepted',
          [Op.or]: [
            { user_id: user_id },
            { friend_id: user_id }
          ]
        },
        include: [
          { model: User, as: 'requester', attributes: ['id', 'username'] },
          { model: User, as: 'receiver', attributes: ['id', 'username'] }
        ] 
      });

      res.status(200).json({ 
        success: true, 
        friends: friends 
      });
    }

    catch (error) {
      console.error(":", error);
      res.status(500).json({ 
        success: false, 
        message: `Error getting friends ${error.message}` 
      });
    }
  };  



 exports.removeFriend = async(req, res) => {
  try{
    const { friend_id } = req.body

    const user_id = req.user.id;

    if(!user_id){
      return res.status(401).json({
        success: false,
        message: "You must be logged in to remove friend"
      })
    }
    


    if(!friend_id){
      return res.status(400).json({
        success: false,
        message: "friend_id is required"
      })
    }

    const friend = await Friend.findOne({
      where:{
        user_id,
        friend_id,
        status: "accepted"
      }
    })

    if(!friend){
      return res.status(401).json({
        success: false,
        message: "Friend does not exist"
      })
    }

    await friend.destroy()

    return res.status(200).json({
      success: true,
      message: "Friend successfully removed"
    })

  }
  catch(error){
    res.status(500).json({
      success: false,
      message: `Failed to remove friend. ${error.message}`
    })
  }
 }



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