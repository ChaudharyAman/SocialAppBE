const Post = require("../Models/posts");
const User = require("../Models/users");

exports.getAllPosts = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows: posts } = await Post.findAndCountAll({
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["created_at", "DESC"]],
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "username", "first_name", "last_name"],
        },
      ],
    });

    res.json({
      success: true,
      Posts: posts,
      totalPosts: count,
      currentPage: parseInt(page),
      totalPages: Math.ceil(count / limit),
      message: "Posts fetched successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to fetch posts ${error.message}`,
    });
  }
};

exports.getPostById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Post ID is required",
      });
    }

    const post = await Post.findOne({
      where: { id },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "username", "first_name", "last_name"],
        },
      ],
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    return res.status(200).json({
      success: true,
      post,
      message: "Post fetched successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Failed to fetch post: ${error.message}`,
    });
  }
};

exports.createPost = async (req, res) => {
  try {
    const { text, media_type, latitude, longitude } = req.body;

    let media_url = null;
    if (req.file) {
      media_url = req.file.path;
    }

    const userId = req.user.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "You must be logged in to create a post",
      });
    }

    const newPost = await Post.create({
      user_id: userId,
      text,
      media_url,
      media_type:
        media_type ||
        (media_url ? (media_url.endsWith(".mp4") ? "video" : "image") : "none"),
      latitude,
      longitude,
    });

    return res.status(201).json({
      success: true,
      post: newPost,
      message: "Post created successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Post creation failed: ${error.message}`,
    });
  }
};

exports.updatePost = async (req, res) => {
  try {
    const { id, text } = req.body;
    const user_id = req.user.id;

    if (!user_id) {
      return res.status(401).json({
        success: false,
        message: "You must be logged in to update post",
      });
    }

    if (!id || !text) {
      return res.status(400).json({
        success: false,
        message: "id, user_id and text are required fields",
      });
    }

    const post = await Post.findOne({ where: { id } });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    if (post.user_id !== user_id) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this post",
      });
    }

    await Post.update({ text }, { where: { id } });

    const updatedPost = await Post.findOne({
      where: { id },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "username", "first_name", "last_name"],
        },
      ],
    });

    return res.status(200).json({
      success: true,
      message: "Post updated successfully",
      post: updatedPost,
    });
  } catch (error) {
    console.error("Error updating post:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const { id } = req.body;

    const user_id = req.user.id;

    if (!user_id) {
      return res.status(401).json({
        success: false,
        message: "You must be logged in to delete a post",
      });
    }

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "id is required",
      });
    }

    const post = await Post.findOne({ where: { id } });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    if (post.user_id !== user_id) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this post",
      });
    }

    await Post.destroy({
      where: { id },
    });

    return res.status(200).json({
      success: true,
      message: "Post deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Error deleting post. ${error.message}`,
    });
  }
};
