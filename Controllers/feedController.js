const { Op } = require('sequelize');
const Friend = require('../Models/friends'); 
const Post = require('../Models/posts'); 
const User = require('../Models/users'); 
const Like = require('../Models/likes'); 
const Comment = require('../Models/comments')



exports.getUserFeed = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const friends = await Friend.findAll({
      where: {
        status: 'accepted',
        [Op.or]: [{ user_id }, { friend_id: user_id }]
      }
    });

    const friendIds = friends.map(f =>
      f.user_id === user_id ? f.friend_id : f.user_id
    );

    const friendPosts = await Post.findAll({
      where: { user_id: { [Op.in] : friendIds } },
      include: [
        { model: User, as: 'user', attributes: ['id', 'username', 'media_url', 'first_name', 'last_name', 'account_status'] },
        { model: Like, as: 'likes', attributes: ['id', 'user_id','post_id'] },
        { model: Comment, as: 'comments', attributes: ['id', 'user_id', 'post_id', 'text'] }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    const publicPosts = await Post.findAll({
      where: {
        user_id: { [Op.notIn]: [user_id, ...friendIds] }
      },
      include: [
        { model: User, as: 'user', where: { account_status: 'public' }, attributes: ['id', 'username', 'media_url', 'first_name', 'last_name', 'account_status'] },
        { model: Like, as: 'likes', attributes: ['id', 'user_id'] },
        { model: Comment, as: 'comments', attributes: ['id', 'user_id', 'text'] }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    const feed = [...friendPosts, ...publicPosts];

    
    const formattedFeed = feed
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .map(post => ({
        post_id: post.id,
        text: post.text,
        media_url: post.media_url,
        created_at: post.created_at,
        user: post.user,
        comments: post.comments,
        likeCount: post.likes.length,
        likedByCurrentUser: post.likes.some(like => like.user_id === user_id),
        likes: post.likes
      }));


    res.status(200).json({
      success: true,
      feed: formattedFeed,
      currentPage: parseInt(page),
      message: 'Feed fetched successfully'
    });

  }
   catch (error) {
    console.error('Error fetching feed:', error);
    res.status(500).json({
      success: false,
      message: `Error fetching feed: ${error.message}`
    });
  }
};
