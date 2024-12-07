// routes/tvshows.js

const express = require('express');
const router = express.Router();
const tvShowController = require('../controllers/tvshowController');

// GET /api/tvshows - Get all TV shows
router.get('/', tvShowController.getAllTVShows);

// GET /api/tvshows/:id - Get a TV show by ID
router.get('/:id', tvShowController.getTVShowById);

// POST /api/tvshows - Create a new TV show
router.post('/', tvShowController.createTVShow);

// PUT /api/tvshows/:id - Update a TV show by ID
router.put('/:id', tvShowController.updateTVShow);

// DELETE /api/tvshows/:id - Delete a TV show by ID
router.delete('/:id', tvShowController.deleteTVShow);

module.exports = router;
