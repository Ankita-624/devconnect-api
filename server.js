// server.js
const cleanExpiredTokens = require('./utils/cleanup');

const helmet = require('helmet');

const apiLimiter = require('./middleware/rateLimiter');

const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const setupSwagger = require('./swagger');


// Route imports
const authRoutes = require('./routes/authRoutes');
const resourceRoutes = require('./routes/resourceRoutes');
const commentRoutes = require('./routes/commentRoutes');

// Initialize environment variables
dotenv.config();
const morgan = require('morgan');

// App setup
const app = express();
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(morgan('dev')); // or 'combined' for full logs

// Routes
app.use('/api', apiLimiter); // applies to all /api/* endpoints

app.use('/api/auth', authRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/comments', commentRoutes);

setupSwagger(app);


// DB connection
const connectDB = require('./config/db');
connectDB();

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  setInterval(cleanExpiredTokens, 1000 * 60 * 10); // Every 10 mins

});
