const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // max requests per IP
  message: {
    message: 'Too many requests from this IP, please try again later.',
  },
});

module.exports = apiLimiter;
