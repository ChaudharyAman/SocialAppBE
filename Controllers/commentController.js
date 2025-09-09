const Comment = require('../Models/comments');
const Post = require('../Models/posts');
const User = require('../Models/users');



exports.getCommentsForPost = async (req, res) => {
    try{

      const {post_id} = req.params;


      const commentCount = await Comment.count({
        where: {
          post_id
        }
      })


        const comment = await Comment.findAll({
          where: {
            post_id
          },
          include:[{association: 'user', attributes: ['id', 'username', 'media_url']}]
        })
        res.json({
            success: true,
            commentCount,
            Comments: comment,
            message: "Comments fetched successfully"
        })
    }
    catch(error){
        return res.status(500).json({
            message: false,
            message: `Error while fetching comments. ${error.message}`
        })
    }
}


exports.createComment = async (req, res) => {
  try {
    const { post_id, text } = req.body;
    const user_id = req.user.id;

    if (!post_id || !text) {
      return res.status(400).json({
        success: false,
        message: "post_id and text are required fields"
      });
    }

    if (!user_id) {
      return res.status(401).json({
        success: false,
        message: "User ID not found in token"
      });
    }

    const post = await Post.findByPk(post_id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found"
      });
    }

    const comment = await Comment.create({
      post_id,
      user_id,
      text
    });

    const commentWithUser = await Comment.findOne({
      where: { id: comment.id },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'first_name', 'last_name']
        }
      ]
    });

    res.status(201).json({
      success: true,
      comment: commentWithUser,
      message: "Comment created successfully"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to create comment: ${error.message}`
    });
  }
};



exports.deleteComment = async (req, res) => {
  try {
    const { id, post_id } = req.body;
    const  user_id  = req.user.id

    if(!user_id){
        return res.status(401).json({
            success: false,
            message: "User ID not found in token"
        })
    }

    if (!id || !post_id){
      return res.status(400).json({
        success: false,
        message: "id, user_id, and post_id are required fields"
      });
    }

    const comment = await Comment.findOne({
      where: { id, user_id, post_id },
      include: [
        { model: User, as: 'user', attributes: ['id', 'username'] },
        { model: Post, as: 'post', attributes: ['id', 'text'] }
      ]
    });

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found or you do not have permission to delete it"
      });
    }

    await Comment.destroy({ where: { id, user_id, post_id } });

    return res.status(200).json({
      success: true,
      deleted_comment: comment,
      message: "Comment deleted successfully"
    });

  } 
  catch (error) {
    res.status(500).json({
      success: false,
      message: `Error while deleting comment. ${error.message}`
    });
  }
};
