const jwt = require('jsonwebtoken');
const config = require('../config/env');

const generateToken = (userId) => {
  if (!config.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }
  return jwt.sign({ userId }, config.JWT_SECRET, { expiresIn: config.JWT_EXPIRES_IN });
};

const verifyToken = (token) => {
  try {
    if (!config.JWT_SECRET) {
      throw new Error('JWT_SECRET is not configured');
    }
    return jwt.verify(token, config.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

module.exports = {
  generateToken,
  verifyToken
};
