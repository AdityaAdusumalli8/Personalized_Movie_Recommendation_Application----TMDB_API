const express = require('express');
const router = express.Router();
const watchlistController = require('../controllers/watchlistController');
const authenticateToken = require('../middleware/authenticateToken');

router.get('/', authenticateToken, watchlistController.getAllWatchlists);

router.get('/:id', authenticateToken, watchlistController.getWatchlistById);

router.post('/', authenticateToken, watchlistController.createWatchlist);

router.put('/:id', authenticateToken, watchlistController.updateWatchlist);

router.delete('/:id', authenticateToken, watchlistController.deleteWatchlist);

module.exports = router;

