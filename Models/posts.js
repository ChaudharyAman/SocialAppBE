const { DataTypes } = require("sequelize");
const sequelize = require("../Config/db");
const User = require("./users");

const Post = sequelize.define(
  "Post",
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
    text: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    media_url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    media_type: {
      type: DataTypes.ENUM("image", "video", "none"),
      allowNull: false,
      defaultValue: "none",
    },
    latitude: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    longitude: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    timestamps: false,
    tableName: "posts",
  }
);

Post.belongsTo(User, { foreignKey: "user_id", as: "user" });
User.hasMany(Post, { foreignKey: "user_id", as: "posts" });

module.exports = Post;
