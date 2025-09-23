const jwt = require('jsonwebtoken');
require('dotenv').config();

exports.isAuthenticated = async (req, res, next) => {
  try {
    const token = await req?.headers?.authorization?.split(' ')[1] || req?.cookies?.token

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized. Please log in.',
        data:token
      });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({
          success: false,
          message: 'Invalid or expired token'
        });
      }

      req.user = decoded;
      next();

    });
  }

  catch (error) {
    return res.status(500).json({
      success: false,
      message: `Authentication failed: ${error.message}`
    });
  }
};
