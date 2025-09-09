const { DataTypes } = require('sequelize');
const sequelize = require('../Config/db');

const Admin = sequelize.define('Admin', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  full_name: {
    type: DataTypes.STRING,
    allowNull:false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  mobile: {
    type: DataTypes.BIGINT,
    allowNull: false,
    unique: true
  },
  role: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'admin'
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  timestamps: false,
  tableName: 'admins'
});

module.exports = Admin;
