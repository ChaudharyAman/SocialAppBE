const Admin = require("../Models/admin");
const bcrypt = require("bcrypt"); 

exports.getAllAdmins = async (req, res) => {
   try {
     const admin = await Admin.findAll();
     return res.status(200).json({
       success: true,
       Admins: admin,
       Message: "Admins fetched successfully",
     }); 

   } 
   catch (error) {
     res.status(500).json({
       success: false,
       message: `Error while fetching admins, ${error.message}`,
     });
   }
}; 



exports.createAdmin = async (req, res) => {
   try {
     const { username, email, full_name, password, mobile, role } = req.body; 

     const existing = await Admin.findOne({
       where: {
         username,
       },
     }); 

     if (existing) {
       return res.status(409).json({
         success: false,
         message: "Username already taken, Try another username",
       });
     }

     if (!username || !email || !full_name || !password || !mobile || !role) {
       return res.status(400).json({
         status: false,
         message:
           "Username, email, full_name, password, mobile and role are required fields",
       });
     } 

     if (full_name < 4 || full_name > 90) {
       return res.status(400).json({
         success: false,
         message: "Full name should be between 4-90 characters",
       });
     } 

     const usernameRegex = /^[a-zA-Z0-9._]{3,16}$/;
     if (!usernameRegex.test(username)) {
       return res.status(400).json({
         status: "Failed",
         message:
           "Username should be 3-16 characters long and can only contain letters, numbers, underscores (_) and dots (.)",
       });
     } 

     const passwordRegex =
       /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
     if (!passwordRegex.test(password)) {
       return res.status(400).json({
         status: "Failed",
         message:"Password must contain: minimum 8 characters, at least 1 uppercase, 1 lowercase, 1 number, and 1 special character",
       });
     } 

     const mobileRegex = /^[9876]\d{9}$/;
     if (!mobileRegex.test(mobile)) {
       return res.status(400).json({
         status: "Failed",
         message: "Mobile number must be 10 digits starting with 9, 8, 7, or 6",
       });
     } 

     const salt = await bcrypt.genSalt(10);
     const hashedPassword = await bcrypt.hash(password, salt); 

     const newAdmin = await Admin.create({
       username: username.trim(),
       email: email.toLowerCase(),
       full_name: full_name.trim(),
       password: hashedPassword,
       mobile,
       role,
     }); 

     res.json({
       success: true,
       newAdmin,
       message: "Admin created successfully",
     }); 

   } 
   catch (error) {
     if (error.name === "SequelizeUniqueConstraintError") {
       return res.status(400).json({
         status: "Failed",
         message: "Email or mobile number already exists in our system",
       });
     }
   }
 }; 
 
 

exports.updateAdmin = async (req, res) => {
   try {
     const { oldUsername, username, email, full_name, password, mobile } =
       req.body; 

     if ( !oldUsername ||!username ||!email ||!full_name ||!password ||!mobile ) {
       return res.status(409).json({
         success: false,
         message:
           "oldUsername, username, email, full_name, password, and mobile are required fields",
       });
     } 

     const currentAdmin = await Admin.findOne({
       where: { username: oldUsername },
     }); 

     if (!currentAdmin) {
       return res.status(404).json({
         success: false,
         message: "Admin not found",
       });
     } 

     if (full_name.length < 4 || full_name.length > 90) {
       return res.status(400).json({
         success: false,
         message: "Full name should be between 4-90 characters",
       });
     } 

     const usernameRegex = /^[a-zA-Z0-9._]{3,16}$/;
     if (!usernameRegex.test(username)) {
       return res.status(400).json({
         success: false,
         message:
           "Username should be 3-16 characters long and can only contain letters, numbers, underscores (_) and dots (.)",
       });
     } 

     const passwordRegex =
       /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
     if (!passwordRegex.test(password)) {
       return res.status(400).json({
         success: false,
         message:
           "Password must contain: minimum 8 characters, at least 1 uppercase, 1 lowercase, 1 number, and 1 special character",
       });
     } 

     const mobileRegex = /^[9876]\d{9}$/;
       if (!mobileRegex.test(mobile)) {
           return res.status(400).json({
             success: false,
             message: "Mobile number must be 10 digits starting with 9, 8, 7, or 6",
       });
     } 
 

     if (username !== oldUsername) {
       const usernameTaken = await Admin.findOne({ where: { username } });
         if (usernameTaken) {
            return res.status(400).json({
               success: false,
               message: "Username already taken, try another",
         });
       }
     } 

     const salt = await bcrypt.genSalt(10);
     const hashedPassword = await bcrypt.hash(password, salt); 

     await Admin.update(
       {
         username: username.trim(),
         email: email.toLowerCase(),
         full_name: full_name.trim(),
         password: hashedPassword,
         mobile: mobile,
       },
       {
         where: { username: oldUsername },
       }
     ); 

     const updatedAdmin = await Admin.findOne({
       where: { username: username },
     }); 

     res.status(200).json({
       success: true,
       updatedAdmin,
       message: "Admin updated successfully",
     }); 

   } 
   catch (error) {
     res.status(500).json({
       success: false,
       message: `Failed to update Admin, ${error.message}`,
     });
   }
 }; 
 
 

exports.deleteAdmin = async (req, res) => {
   try {
     const { username, password } = req.body; 

     if (!username || !password) {
       return res.status(409).json({
         success: false,
         message: "Username and password are required field",
       });
     } 

     const usernameRecord = await Admin.findOne({
       where: {
         username,
       },
     }); 

     if (!usernameRecord) {
       return res.status(404).json({
         success: false,
         message: "Username does not exists, Try another username",
       });
     } 

     const isPasswordValid = await bcrypt.compare(password, usernameRecord.password);
     if (!isPasswordValid) {
       return res.status({
         success: false,
         message: "Invalid password, Please try again later",
       });
     } 

     const deleteAdmin = await Admin.destroy({
       where: {
         username,
       },
     }); 

     if (deleteAdmin) {
       return res.status(201).json({
         success: true,
         message: "Admin deleted successfully",
       });
     }
      else {
       res.status(404).json({
         success: false,
         message: "Admin not found",
       });
     } 

   } catch (error) {
     res.status(500).json({
       success: false,
       message: `Failed to delete admin, Please try again later. ${error.message}`,
     });
   }
}; 
