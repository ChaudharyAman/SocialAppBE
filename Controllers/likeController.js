const Like = require('../Models/likes');
const Post = require('../Models/posts');

exports.toggleLike = async (req, res) => {
  try {
    const userId = req.user.id; 
    const { post_id } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'You must be logged in to like a post'
      });
    }

    if (!post_id) {
      return res.status(400).json({
        success: false,
        message: `post_id is required`
      });
    }


    const post = await Post.findByPk(post_id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }


    const existingLike = await Like.findOne({
      where: { user_id: userId, post_id }
    });


    if (existingLike) {

      await existingLike.destroy();
      const likeCount = await Like.count({ where: { post_id } });
      return res.status(200).json({
        success: true,
        liked: false,
        likeCount,
        message: 'Post unliked successfully'
      });
    }


    await Like.create({
      user_id: userId,
      post_id
    });

    const likeCount = await Like.count({ where: { post_id } });

    return res.status(201).json({
      success: true,
      liked: true,
      likeCount,
      message: 'Post liked successfully'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Failed to toggle like: ${error.message}`
    });
  }
};


exports.getLikesForPost = async (req, res) => {
  try {
    const { post_id } = req.params;

    const likeCount = await Like.count({
      where: { post_id }
    });

    const likes = await Like.findAll({
      where: { post_id },
      include: [{ association: 'user', attributes: ['id', 'username', 'media_url'] }]
    }); 

    return res.status(200).json({
      success: true,
      likeCount,
      likes
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Failed to get likes: ${error.message}`
    });
  }
};
