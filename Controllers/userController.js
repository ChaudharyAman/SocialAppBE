const { Association } = require('sequelize');
const User = require('../Models/users');
const Post = require('../Models/posts');
const Like = require('../Models/likes');
const Comment = require('../Models/comments')
const bcrypt = require('bcrypt');


exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    res.json({
      success: true,
      users,
      message: "User fetched successfully"
    });
  }

  catch (error) {
    res.status(500).json({ 
      success: false,
      message:`Error fetching users ${error.message}`
    });
  }
};



  exports.getUserById = async (req, res) => {
    
    try{
    
      const {id} = req.params
      const user = await User.findAll({
        where :{
          id
        },
        include: [
        {
          model: Post,
          as: 'posts',
          attributes: ['id', 'text', 'media_url', 'media_type', 'latitude', 'longitude', 'created_at'],
          include: [
            {
              model: Like,
              as: 'likes',
              // attributes: ['id', 'user_id'],
              // include: [
              //   {
              //     model: User,
              //     as: 'user',
              //     attributes: ['username']
              //   }
              // ]
            },
            {
              model: Comment,
              as: 'comments',
              // attributes: ['id', 'text'],
              // include: [
              //   {
              //     model: User,
              //     as: 'user',
              //     attributes: ['username']
              //   }
              // ]
            }
          ]
        }
      ],
      order: [
        ['id', 'ASC'],
        [{ model: Post, as: 'posts' }, 'created_at', 'DESC']
      ]
    });

      return res.status(200).json({
        success: true,
        user,
        message: 'User with id fetched successfully'
      })
    }
    catch(error){
      res.status(500).json({ 
        success: false,
        message:`Error fetching users ${error.message}`
    })
  }
  }



exports.createUser = async (req, res) => {
  try {
    const { username, first_name, last_name, email, password, bio, date_of_birth, mobile, gender, account_status } = req.body;


    if(!username || !first_name || !last_name || !email || !password || !bio || !date_of_birth || !gender || !mobile || !account_status){
      return res.status(400).json({
        success:false,
        message:"username, first_name, last_name, email, password_hash, bio, date_of_birth, gender, mobile, account_status is required" 
      })
    }

    const existing  = await User.findOne({
      where:{
        username
      }
    })

    if(existing) {
      return res.status(409).json({
        success : false,
        message: "username already taken, try another username"
      })
    }

    if (first_name.length < 2 || first_name.length > 50) {
      return res.status(400).json({
        status: false,
        message: "First name must be between 2-50 characters"
      });
    }

    if (last_name.length < 2 || last_name.length > 50) {
      return res.status(400).json({
        status: false,
        message: "Last name must be between 2-50 characters"
      });
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        status: false,
        message: "Password must contain: minimum 8 characters, at least 1 uppercase, 1 lowercase, 1 number, and 1 special character"
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if(!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Email not valid, Please enter valid email"
      })
    }

    const mobileRegex = /^[9876]\d{9}$/;
      if (!mobileRegex.test(mobile)) {
      return res.status(400).json({
        status: false,
        message: "Mobile number must be 10 digits starting with 9, 8, 7, or 6"
      });
    }

    const usernameRegex = /^[a-zA-Z0-9._]{3,16}$/;
      if (!usernameRegex.test(username)) {
        return res.status(400).json({
          status: false,
          message: "Username should be 3-16 characters long and can only contain letters, numbers, underscores (_) and dots (.)"
        });
      }

      if(!req.file){
        return res.status(200).json({
          success: false,
          message: "Profile picture is required to registering an user"
        })
      }

      if (!req.file.mimetype.startsWith("image/")) {
        return res.status(400).json({
        success: false,
        message: "Only image files are allowed for profile picture",
      });
    }

      if(req.file){
        media_url = req.file.path
      }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);


    const newUser = await User.create({
    username: username.trim(), 
    first_name: first_name.trim().toUpperCase(),
    last_name: last_name.trim().toUpperCase(),
    email: email.toLowerCase(), 
    password: hashedPassword, 
    date_of_birth,
    media_url,
    bio: bio.trim(), 
    gender,
    mobile,
    account_status
  });
    res.status(201).json({
      success:true,
      user:{
        id: newUser.id,
        username: newUser.username,
        first_name: newUser.first_name,
        last_name: newUser.last_name,
        email: newUser.email,
        password: newUser.password,
        date_of_birth: newUser.date_of_birth,
        bio: newUser.bio,
        profile_picture: newUser.media_url,
        gender: newUser.gender,
        mobile: newUser.mobile,
        account_status: newUser.account_status
      },
      message:"User created successfully"
    });
  }

  catch (error) {
   if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        status: false,
        message: "Email or mobile number already exists in our system"
      });
    }
}}


exports.updateUser = async (req, res) => {
  try{
    const {
      oldUsername,
      username,
      first_name,
      last_name,
      email,
      password,
      bio,
      date_of_birth,
      mobile,
      gender,
      account_status
    } = req.body



    const currentUser = await User.findOne({ where: { username: oldUsername } });

    if(!oldUsername || !username || !first_name || !last_name || !email || !password || !bio || !date_of_birth || !gender || !mobile || !account_status){
    return res.status(400).json({
      success:false,
      message:"oldUsername, username, first_name, last_name, email, password, bio, date_of_birth, gender, mobile, account_status is required" 
    })
    }

    if (first_name.length < 2 || first_name.length > 50) {
      return res.status(400).json({
        status: false,
        message: "First name must be between 2-50 characters"
      });
    }

    if (last_name.length < 2 || last_name.length > 50) {
      return res.status(400).json({
        status: false,
        message: "Last name must be between 2-50 characters"
      });
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        status: false,
        message: "Password must contain: minimum 8 characters, at least 1 uppercase, 1 lowercase, 1 number, and 1 special character"
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if(!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Email not valid, Please enter valid email"
      })
    }

    const mobileRegex = /^[9876]\d{9}$/;
      if (!mobileRegex.test(mobile)) {
      return res.status(400).json({
        status: false,
        message: "Mobile number must be 10 digits starting with 9, 8, 7, or 6"
      });
    }

    const usernameRegex = /^[a-zA-Z0-9._]{3,16}$/;
      if (!usernameRegex.test(username)) {
      return res.status(400).json({
        status: false,
        message: "No special character is allowed in username"
      });
    }

      if(!req.file){
        return res.status(200).json({
          success: false,
          message: "Profile picture is required while registering an user"
        })
      }

      if (!req.file.mimetype.startsWith("image/")) {
        return res.status(400).json({
        success: false,
        message: "Only image files are allowed for profile picture",
      });
    }

      if(req.file){
        media_url = req.file.path
      }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);


    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    if (username && username !== oldUsername) {
      const usernameTaken = await User.findOne({
        where: {
          username
        }
      });

      if (usernameTaken) {
        return res.status(400).json({
          success: false,
          message: "Username already taken, Try another username"
        });
      }
    }
      await User.update({
        username: username.trim(),
        first_name: first_name.trim().toUpperCase(),
        last_name: last_name.trim().toUpperCase(),
        email: email.toLowerCase(),
        password: hashedPassword,
        media_url,
        bio: bio.trim(),
        date_of_birth,
        mobile,
        gender,
        account_status
      },{
        where: {
          username: oldUsername
        }
      })
      const updatedUser = await User.findOne({ where: { username } });

      res.status(200).json({
        success: true,
        updatedUser: {
          user_id: updatedUser.id,
          username: updatedUser.username,
          first_name: updatedUser.first_name,
          last_name: updatedUser.last_name,
          email: updatedUser.email,
          profile_picture: updatedUser.media_url,
          bio: updatedUser.bio,
          date_of_birth: updatedUser.date_of_birth,
          mobile: updatedUser.mobile,
          gender: updatedUser.gender,
          account_status: updatedUser.account_status
        },
        message: "User updated successfully"
      })
}
  catch(error){
    res.status(500).json({
      success: false,
      message: `Failed to update user, ${error.message}` 
    })
    console.log(error)
  }
}


exports.deleteUser = async(req, res) => {
  try{

    const {username, password } = req.body
    
    const usernameRecord = await User.findOne({
      where:{
        username
      }
    })

    if(!usernameRecord){
      return res.status(404).json({
        success: false,
        message: "User do not exist, try another username"
      })
    }

    const isPasswordValid = await bcrypt.compare(password, usernameRecord.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid password, Please try again"
      });
    }

    const deletedUser = await User.destroy({
      where: {
        username
      }
    })

    if(deletedUser){
      res.status(201).json({
        success: true,
        message: "User deleted succesfully"
      })
    }

    else{
      res.status(404).json({
        success: false,
        message: "user not found"
      })
    }
  }

  catch(error){
    res.status(500).json({
      success: false,
      message: `Failed to delete user, Please try again later. ${error.message}`
    })
  }
}


exports.updateLoggedInUser = async (req, res) => {
  try {
    const userId = req.user.id; 

    const {
      username,
      first_name,
      last_name,
      email,
      bio,
      date_of_birth,
      mobile,
      gender,
      account_status,
    } = req.body;

    if (
      !username ||
      !first_name ||
      !last_name ||
      !email ||
      !bio ||
      !date_of_birth ||
      !gender ||
      !mobile ||
      !account_status
    ) {
      return res.status(400).json({
        success: false,
        message:
          "username, first_name, last_name, email, bio, date_of_birth, gender, mobile, account_status are required",
      });
    }

    if (first_name.length < 2 || first_name.length > 50) {
      return res.status(400).json({
        success: false,
        message: "First name must be between 2-50 characters",
      });
    }

    if (last_name.length < 2 || last_name.length > 50) {
      return res.status(400).json({
        success: false,
        message: "Last name must be between 2-50 characters",
      });
    }

    // const passwordRegex =
    //   /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    // if (!passwordRegex.test(password)) {
    //   return res.status(400).json({
    //     success: false,
    //     message:
    //       "Password must be at least 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char",
    //   });
    // }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Email not valid, Please enter valid email",
      });
    }

    const mobileRegex = /^[9876]\d{9}$/;
    if (!mobileRegex.test(mobile)) {
      return res.status(400).json({
        success: false,
        message:
          "Mobile number must be 10 digits starting with 9, 8, 7, or 6",
      });
    }

    const usernameRegex = /^[a-zA-Z0-9._]{3,16}$/;
    if (!usernameRegex.test(username)) {
      return res.status(400).json({
        success: false,
        message: "Username must be 3-16 chars, letters/numbers/._ only",
      });
    }

    let media_url;
    if (req.file) {
      if (!req.file.mimetype.startsWith("image/")) {
        return res.status(400).json({
          success: false,
          message: "Only image files are allowed for profile picture",
        });
      }
      media_url = req.file.path;
    }

    const currentUser = await User.findByPk(userId);
    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (username && username !== currentUser.username) {
      const usernameTaken = await User.findOne({ where: { username } });
      if (usernameTaken) {
        return res.status(400).json({
          success: false,
          message: "Username already taken, Try another username",
        });
      }
    }

    // const salt = await bcrypt.genSalt(10);
    // const hashedPassword = await bcrypt.hash(password, salt);

    await User.update(
      {
        username: username.trim(),
        first_name: first_name.trim().toUpperCase(),
        last_name: last_name.trim().toUpperCase(),
        email: email.toLowerCase(),
        // password: hashedPassword,
        media_url: media_url || currentUser.media_url,
        bio: bio.trim(),
        date_of_birth,
        mobile,
        gender,
        account_status,
      },
      { where: { id: userId } }
    );

    const updatedUser = await User.findByPk(userId);

    res.status(200).json({
      success: true,
      updatedUser: {
        user_id: updatedUser.id,
        username: updatedUser.username,
        first_name: updatedUser.first_name,
        last_name: updatedUser.last_name,
        email: updatedUser.email,
        profile_picture: updatedUser.media_url,
        bio: updatedUser.bio,
        date_of_birth: updatedUser.date_of_birth,
        mobile: updatedUser.mobile,
        gender: updatedUser.gender,
        account_status: updatedUser.account_status,
      },
      message: "Profile updated successfully",
    });
  } 
  catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to update profile, ${error.message}`,
    });
    console.error(error);
  }
};




exports.createUser2 = async (req, res) => {
  try {
    const { username, first_name, last_name, email, password, bio, date_of_birth, mobile, gender, account_status } = req.body;

    if (!username || !first_name || !last_name || !email || !password || !bio || !date_of_birth || !gender || !mobile || !account_status) {
      return res.status(400).json({
        success: false,
        message: "username, first_name, last_name, email, password, bio, date_of_birth, gender, mobile, account_status are required"
      });
    }

    const existing = await User.findOne({ where: { username } });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "username already taken, try another username"
      });
    }

    if (first_name.length < 2 || first_name.length > 50) {
      return res.status(400).json({
        success: false,
        message: "First name must be between 2-50 characters"
      });
    }
    if (last_name.length < 2 || last_name.length > 50) {
      return res.status(400).json({
        success: false,
        message: "Last name must be between 2-50 characters"
      });
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        success: false,
        message: "Password must contain: minimum 8 characters, at least 1 uppercase, 1 lowercase, 1 number, and 1 special character"
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Email not valid, Please enter valid email"
      });
    }

    const mobileRegex = /^[9876]\d{9}$/;
    if (!mobileRegex.test(mobile)) {
      return res.status(400).json({
        success: false,
        message: "Mobile number must be 10 digits starting with 9, 8, 7, or 6"
      });
    }

    const usernameRegex = /^[a-zA-Z0-9._]{3,16}$/;
    if (!usernameRegex.test(username)) {
      return res.status(400).json({
        success: false,
        message: "Username should be 3-16 characters long and can only contain letters, numbers, underscores (_) and dots (.)"
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Profile picture is required to register a user"
      });
    }
    if (!req.file.mimetype.startsWith("image/")) {
      return res.status(400).json({
        success: false,
        message: "Only image files are allowed for profile picture"
      });
    }

    let media_url = req.file.path;

    const formattedDOB = moment(date_of_birth, ["YYYY/MM/DD", "DD-MM-YYYY", "YYYY-MM-DD"], true).format("YYYY-MM-DD");
    if (!moment(formattedDOB, "YYYY-MM-DD", true).isValid()) {
      return res.status(400).json({
        success: false,
        message: "Invalid date_of_birth format. Use YYYY-MM-DD, YYYY/MM/DD, or DD-MM-YYYY"
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      username: username.trim(),
      first_name: first_name.trim().toUpperCase(),
      last_name: last_name.trim().toUpperCase(),
      email: email.toLowerCase(),
      password: hashedPassword,
      date_of_birth: formattedDOB,
      media_url,
      bio: bio.trim(),
      gender,
      mobile,
      account_status
    });

    res.status(201).json({
      success: true,
      user: {
        id: newUser.id,
        username: newUser.username,
        first_name: newUser.first_name,
        last_name: newUser.last_name,
        email: newUser.email,
        date_of_birth: newUser.date_of_birth,
        bio: newUser.bio,
        profile_picture: newUser.media_url,
        gender: newUser.gender,
        mobile: newUser.mobile,
        account_status: newUser.account_status
      },
      message: "User created successfully"
    });
  } 
  catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({
        success: false,
        message: "Email or mobile number already exists in our system"
      });
    }
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};




  exports.getUserByName = async (req, res) => {
    
    try{
    
      const {first_name} = req.params
      const user = await User.findAll({
        where :{
          first_name
        }});

      return res.status(200).json({
        success: true,
        user,
        message: 'User fetched successfully'
      })
    }
    catch(error){
      res.status(500).json({ 
        success: false,
        message:`Error fetching users ${error.message}`
    })
  }
  }
