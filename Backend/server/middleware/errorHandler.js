const config = require('../config/env');

const errorHandler = (err, req, res, next) => {
  console.error('Error:', {
    message: err.message,
    stack: config.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method
  });

  const statusCode = err.statusCode || err.status || 500;
  
  res.status(statusCode).json({
    error: {
      message: config.NODE_ENV === 'production' && statusCode === 500
        ? 'Internal server error'
        : err.message,
      ...(config.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
};

module.exports = errorHandler;
