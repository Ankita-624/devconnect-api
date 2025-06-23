// server.js
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');

const apiLimiter = require('./middleware/rateLimiter');
const setupSwagger = require('./swagger');
const connectDB = require('./config/db');
const cleanExpiredTokens = require('./utils/cleanup');

// Route imports
const authRoutes = require('./routes/authRoutes');
const resourceRoutes = require('./routes/resourceRoutes');
const commentRoutes = require('./routes/commentRoutes');

// Load environment variables
dotenv.config();

// Initialize app
const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(morgan('dev'));
app.use('/api', apiLimiter); // Apply rate limiter to all /api routes

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/comments', commentRoutes);
setupSwagger(app);

// Export app for testing
module.exports = app;

// Start server only if not in test mode
if (process.env.NODE_ENV !== 'test') {
  connectDB();
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    setInterval(cleanExpiredTokens, 1000 * 60 * 10); // Clean expired tokens every 10 min
  });
}
