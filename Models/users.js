const { DataTypes } = require('sequelize');
const sequelize = require('../Config/db');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  username:{
    type: DataTypes.STRING,
    allowNull:false,
    unique:true
  },
  first_name:{
    type: DataTypes.STRING,
    allowNull:false,
  },
  last_name:{
    type: DataTypes.STRING,
    allowNull:false
  },
  email:{
    type: DataTypes.STRING,
    allowNull:false,
    unique: true
  },
  password:{
    type: DataTypes.STRING(255),
    allowNull: false
  },
  date_of_birth:{
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  bio:{
    type: DataTypes.STRING,
    allowNull:false
  },
  gender:{
    type:DataTypes.ENUM('male', 'female', 'Strictly Male', 'Strictly Female', 'non-binary', 'Agender', 'Bigender', 'Cisgender', 'Genderflux', 'Pangender', 'Polygender', 'Two-spirit', 'Born and taken care by an helicopter', 'Androgyne', 'Asexual', 'Aromantic', 'Intersex', 'Raised by a bee', 'Xenogender', 'Autigender', 'Caelgender', 'Aerogender', 'Amaregender', 'Blurgender',  'other'),
    allowNull:false,
    defaultValue: 'other'
  },
  mobile: {
    type: DataTypes.BIGINT,
    allowNull: false,
    unique:true
},
  media_url:{
    type: DataTypes.STRING,
    allowNull: false
  },
  account_status:{
    type: DataTypes.ENUM('public', 'private'),
    allowNull:false,
    defaultValue: 'public'
  }
 }, {
  timestamps: true,
  tableName: 'users'
});

module.exports = User;