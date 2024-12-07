// routes/watchlists.js

const express = require('express');
const router = express.Router();
const watchlistController = require('../controllers/watchlistController');

// GET /api/watchlists - Get all watchlist items
router.get('/', watchlistController.getAllWatchlists);

// GET /api/watchlists/:id - Get a watchlist item by ID
router.get('/:id', watchlistController.getWatchlistById);

// POST /api/watchlists - Create a new watchlist item
router.post('/', watchlistController.createWatchlist);

// PUT /api/watchlists/:id - Update a watchlist item by ID
router.put('/:id', watchlistController.updateWatchlist);

// DELETE /api/watchlists/:id - Delete a watchlist item by ID
router.delete('/:id', watchlistController.deleteWatchlist);

module.exports = router;
