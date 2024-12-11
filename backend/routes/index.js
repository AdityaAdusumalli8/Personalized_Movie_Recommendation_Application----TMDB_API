const express = require('express');
const router = express.Router();


const userRoutes = require('./users');
const authRoutes = require('./auth'); 
const movieRoutes = require('./movies');        
const tvShowRoutes = require('./tvshows');       
const watchlistRoutes = require('./watchlists'); 
const notificationRoutes = require('./notifications'); 


router.use('/users', userRoutes);
router.use('/auth', authRoutes); 
router.use('/movies', movieRoutes);
router.use('/tvshows', tvShowRoutes);
router.use('/watchlists', watchlistRoutes);
router.use('/notifications', notificationRoutes);

module.exports = router;
