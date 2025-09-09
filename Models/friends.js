const { DataTypes } = require('sequelize');
const sequelize = require('../Config/db');
const User = require('./users');

const Friend = sequelize.define('Friend', {
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
  friend_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  status: {
    type: DataTypes.ENUM('pending', 'accepted'),
    allowNull: false,
    defaultValue: 'pending'
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  timestamps: false,
  tableName: 'friends'
});

Friend.belongsTo(User, { foreignKey: 'user_id', as: 'requester' });
Friend.belongsTo(User, { foreignKey: 'friend_id', as: 'receiver' });

User.hasMany(Friend, { foreignKey: 'user_id', as: 'friendRequestsSent' });
User.hasMany(Friend, { foreignKey: 'friend_id', as: 'friendRequestsReceived' });

module.exports = Friend;
