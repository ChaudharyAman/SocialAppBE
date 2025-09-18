const { DataTypes } = require("sequelize");
const sequelize = require("../Config/db");
const User = require("./users");
const Post = require("./posts");

const Comment = sequelize.define(
  "Comment",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
      onDelete: "CASCADE",
    },
    post_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Post,
        key: "id",
      },
      onDelete: "CASCADE",
    },
    text: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    timestamps: false,
    tableName: "comments",
  }
);

Comment.belongsTo(User, { foreignKey: "user_id", as: "user" });
Comment.belongsTo(Post, { foreignKey: "post_id", as: "post" });

User.hasMany(Comment, { foreignKey: "user_id", as: "comments" });
Post.hasMany(Comment, { foreignKey: "post_id", as: "comments" });

module.exports = Comment;
