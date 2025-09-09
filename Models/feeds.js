const { DataTypes } = require('sequelize');
const sequelize = require('../Config/db');
const User = require('./users');
const Post = require('./posts');

const Feed = sequelize.define('Feed', {
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
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  post_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Post,
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  timestamps: false,
  tableName: 'feeds'
});


Feed.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Feed.belongsTo(Post, { foreignKey: 'post_id', as: 'post' });

User.hasMany(Feed, { foreignKey: 'user_id', as: 'feedItems' });
Post.hasMany(Feed, { foreignKey: 'post_id', as: 'feedItems' });

module.exports = Feed;
