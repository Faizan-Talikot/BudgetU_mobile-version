const jwt = require('jsonwebtoken');
const User = require('../models/User');

// JWT secret key
const JWT_SECRET = process.env.JWT_SECRET || 'budgetu-secret-key';

// Middleware to authenticate user using JWT
const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
      console.log('Authentication failed: No Authorization header');
      return res.status(401).json({ message: 'No authentication token, access denied' });
    }

    const token = authHeader.replace('Bearer ', '');
    
    if (!token) {
      console.log('Authentication failed: Empty token after Bearer prefix');
      return res.status(401).json({ message: 'Invalid authentication token format' });
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    if (!decoded || !decoded.userId) {
      console.log('Authentication failed: Invalid token payload');
      return res.status(401).json({ message: 'Invalid token format' });
    }

    // Find user by id
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      console.log(`Authentication failed: User not found for ID ${decoded.userId}`);
      return res.status(401).json({ message: 'Token is valid, but user not found' });
    }
    
    // Add user to request object
    req.user = user;
    req.userId = user._id;
    
    next();
  } catch (error) {
    console.error('Authentication error:', error.message);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token has expired' });
    }
    res.status(401).json({ message: 'Authentication failed' });
  }
};

module.exports = {
  authenticate,
  JWT_SECRET
}; 