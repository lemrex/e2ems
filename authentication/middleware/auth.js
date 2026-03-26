// ===================================
// AUTH MIDDLEWARE (middleware/auth.js)
// ===================================
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      logger.warn('Authentication attempt without token', { 
        ip: req.ip,
        path: req.path 
      });
      return res.status(401).json({ 
        success: false, 
        message: 'No authentication token, access denied' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    
    logger.debug('User authenticated', { 
      userId: decoded.userId,
      path: req.path 
    });
    
    next();
  } catch (error) {
    logger.warn('Invalid authentication token', { 
      error: error.message,
      ip: req.ip 
    });
    res.status(401).json({ 
      success: false, 
      message: 'Token is not valid' 
    });
  }
};

module.exports = authMiddleware;