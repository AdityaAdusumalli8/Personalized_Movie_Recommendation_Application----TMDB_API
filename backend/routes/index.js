// routes/index.js

const express = require('express');
const router = express.Router();

// Import individual route files
const userRoutes = require('./users');
const authRoutes = require('./auth'); 
const movieRoutes = require('./movies');        
const tvShowRoutes = require('./tvshows');       
const watchlistRoutes = require('./watchlists'); 
const notificationRoutes = require('./notifications'); 

// Use the routes with appropriate base paths
router.use('/users', userRoutes);
router.use('/auth', authRoutes); 
router.use('/movies', movieRoutes);
router.use('/tvshows', tvShowRoutes);
router.use('/watchlists', watchlistRoutes);
router.use('/notifications', notificationRoutes);

module.exports = router;
