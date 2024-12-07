// routes/index.js

const express = require('express');
const router = express.Router();

// Import individual route files
const userRoutes = require('./users');
// const authRoutes = require('./auth'); // Uncomment if you set up auth routes
const movieRoutes = require('./movies');         // Ensure these files exist
const tvShowRoutes = require('./tvshows');       // Ensure these files exist
const watchlistRoutes = require('./watchlists'); // Ensure these files exist
const notificationRoutes = require('./notifications'); // Ensure these files exist

// Use the routes with appropriate base paths
router.use('/users', userRoutes);
// router.use('/auth', authRoutes); // Uncomment if you set up auth routes
router.use('/movies', movieRoutes);
router.use('/tvshows', tvShowRoutes);
router.use('/watchlists', watchlistRoutes);
router.use('/notifications', notificationRoutes);

module.exports = router;
