const Admin = require("../Models/admin");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
require("dotenv").config();

exports.loginAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        Message: "Username and password are required field",
      });
    }

    const admin = await Admin.findOne({
      where: {
        username,
      },
    });

    if (!username) {
      return res.status(401).json({
        success: false,
        Message: "Admin not found",
      });
    }

    const payload = {
      username: admin.username,
      id: admin.id,
    };

    if (await bcrypt.compare(password, admin.password)) {
      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "2h",
      });

      const options = {
        expires: new Date(Date.now() + 3 * 60 * 60 * 1000),
        httpOnly: true,
      };
      return res.cookie("token", token, options).status(200).json({
        success: true,
        admin,
        token,
        message: "User logged in successfully",
      });
    } else {
      return res.status(401).json({
        success: false,
        message: "Invalid password, please try again",
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Login failed. ${error}`,
    });
  }
};

exports.logoutAdmin = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
    });

    return res.status(200).json({
      success: true,
      message: "Admin logged out successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Logout failed, ${error.message}`,
    });
  }
};
