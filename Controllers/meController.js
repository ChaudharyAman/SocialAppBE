const { Op } = require("sequelize");
const User = require("../Models/users");
const Post = require("../Models/posts");
const Comment = require("../Models/comments");
const Like = require("../Models/likes");
const Friend = require("../Models/friends");

exports.meUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: [
        "id",
        "username",
        "first_name",
        "last_name",
        "email",
        "media_url",
        "bio",
        "date_of_birth",
        "gender",
        "account_status",
        "mobile",
        "createdAt",
      ],
      include: [
        { model: Post, as: "posts" },
        { model: Like, as: "likes" },
        { model: Comment, as: "comments" },
        {
          model: Friend,
          as: "friendRequestsSent",
          include: [
            {
              model: User,
              as: "receiver",
              attributes: [
                "id",
                "username",
                "first_name",
                "last_name",
                "media_url",
              ],
            },
          ],
        },
        {
          model: Friend,
          as: "friendRequestsReceived",
          include: [
            {
              model: User,
              as: "requester",
              attributes: [
                "id",
                "username",
                "first_name",
                "last_name",
                "media_url",
              ],
            },
          ],
        },
      ],
    });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const friends = [
      ...user.friendRequestsSent
        .filter((f) => f.status === "accepted")
        .map((f) => f.receiver),
      ...user.friendRequestsReceived
        .filter((f) => f.status === "accepted")
        .map((f) => f.requester),
    ];

    const userWithFriends = {
      ...user.toJSON(),
      friends,
    };

    res.status(200).json({
      success: true,
      user: userWithFriends,
      message: "Logged in user fetched successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Error fetching user details: ${error.message}`,
    });
  }
};
