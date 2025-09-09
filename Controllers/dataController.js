const Post = require('../Models/posts');
const User = require('../Models/users');
const Like = require('../Models/likes');
const Comment = require('../Models/comments');



exports.getAllData = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'username', 'first_name', 'last_name', 'account_status', 'media_url'],
      include: [
        {
          model: Post,
          as: 'posts',
          attributes: ['id', 'text', 'media_url', 'media_type', 'latitude', 'longitude', 'created_at'],
          include: [
            {
              model: Like,
              as: 'likes',
              attributes: ['id', 'user_id'],
              include: [
                {
                  model: User,
                  as: 'user',
                  attributes: ['username']
                }
              ]
            },
            {
              model: Comment,
              as: 'comments',
              attributes: ['id', 'user_id', 'text'],
              include: [
                {
                  model: User,
                  as: 'user',
                  attributes: ['username']
                }
              ]
            }
          ]
        }
      ],
      order: [
        ['id', 'ASC'],
        [{ model: Post, as: 'posts' }, 'created_at', 'DESC']
      ]
    });


    const formattedUsers = users.map(user => ({
      user_id: user.id,
      username: user.username,
      first_name: user.first_name,
      last_name: user.last_name,
      account_status: user.account_status,
      profile_pic: user.media_url,
      user_posts: user.posts.map(post => ({
        post_id: post.id,
        post_text: post.text,
        post_media_url: post.media_url,
        post_media_type: post.media_type,
        post_latitude: post.latitude,
        post_longitude: post.longitude,
        post_created_at: post.created_at,
        post_likes: post.likes.map(like => ({
          like_id: like.id,
          likedBy_user_id: like.user_id,
          likedBy_username: like.user ? like.user.username : null

        })),
        post_comments: post.comments.map(comment => ({
          comment_id: comment.id,
          comment_text: comment.text,
          commentedBy_user_id: comment.user_id,
          commentedBy_username: comment.user ? comment.user.username : null
        }))
      }))
    }));

    res.json({
      success: true,
      users: formattedUsers,
      message: "Users with their posts, likes, and comments fetched successfully"
    });

  } 
  catch (error) {
    console.log(error)
    res.status(500).json({
      success: false,
      message: `Failed to fetch data: ${error.message}`
    });
  }
};
