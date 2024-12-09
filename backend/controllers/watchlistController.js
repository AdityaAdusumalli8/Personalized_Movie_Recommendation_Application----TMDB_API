// controllers/watchlistController.js

const { Watchlist, Movie, TVShow, User } = require('../models');

// Get all watchlist items for the logged-in user
exports.getAllWatchlists = async (req, res) => {
  try {
    // Assuming `req.user` contains the user information from the JWT middleware
    const userId = req.user.id;

    // Fetch watchlist items only for the logged-in user
    const watchlists = await Watchlist.findAll({
      where: { user_id: userId },
      include: [
        { model: Movie, as: "movie" },
        { model: TVShow, as: "tv_show" },
      ],
    });

    res.json(watchlists); // Return the user's watchlist items
  } catch (error) {
    console.error("Error retrieving watchlists:", error);
    res.status(500).json({ error: "Failed to retrieve watchlists." });
  }
};


// Get a single watchlist item by ID
exports.getWatchlistById = async (req, res) => {
  try {
    const watchlist = await Watchlist.findByPk(req.params.id, {
      include: [
        { model: User, as: 'user' },
        { model: Movie, as: 'movie' },
        { model: TVShow, as: 'tv_show' }
      ]
    });
    if (watchlist) {
      res.json(watchlist);
    } else {
      res.status(404).json({ error: 'Watchlist item not found.' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve watchlist item.' });
  }
};

// Create a new watchlist item
exports.createWatchlist = async (req, res) => {
  try {
    const { user_id, content_id, content_type, status } = req.body;
    
    // Validate content_type
    if (!['movie', 'tv_show'].includes(content_type)) {
      return res.status(400).json({ error: 'Invalid content type.' });
    }

    // Optionally, verify that content_id exists in the respective table
    if (content_type === 'movie') {
      const movie = await Movie.findByPk(content_id);
      if (!movie) {
        return res.status(400).json({ error: 'Invalid movie ID.' });
      }
    } else if (content_type === 'tv_show') {
      const tvShow = await TVShow.findByPk(content_id);
      if (!tvShow) {
        return res.status(400).json({ error: 'Invalid TV show ID.' });
      }
    }

    const newWatchlist = await Watchlist.create({
      user_id,
      content_id,
      content_type,
      status
    });
    res.status(201).json(newWatchlist);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create watchlist item.', details: error.message });
  }
};

// Update an existing watchlist item
exports.updateWatchlist = async (req, res) => {
  try {
    const { content_id, content_type, status } = req.body;
    const watchlist = await Watchlist.findByPk(req.params.id);
    if (watchlist) {
      // Validate content_type if being updated
      if (content_type && !['movie', 'tv_show'].includes(content_type)) {
        return res.status(400).json({ error: 'Invalid content type.' });
      }

      // Optionally, verify that content_id exists in the respective table if being updated
      if (content_type === 'movie' || (content_type === undefined && watchlist.content_type === 'movie')) {
        const movie = await Movie.findByPk(content_id || watchlist.content_id);
        if (!movie) {
          return res.status(400).json({ error: 'Invalid movie ID.' });
        }
      } else if (content_type === 'tv_show' || (content_type === undefined && watchlist.content_type === 'tv_show')) {
        const tvShow = await TVShow.findByPk(content_id || watchlist.content_id);
        if (!tvShow) {
          return res.status(400).json({ error: 'Invalid TV show ID.' });
        }
      }

      await watchlist.update({
        content_id: content_id || watchlist.content_id,
        content_type: content_type || watchlist.content_type,
        status: status || watchlist.status
      });
      res.json(watchlist);
    } else {
      res.status(404).json({ error: 'Watchlist item not found.' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to update watchlist item.' });
  }
};

// Delete a watchlist item
exports.deleteWatchlist = async (req, res) => {
  try {
    const watchlist = await Watchlist.findByPk(req.params.id);
    if (watchlist) {
      await watchlist.destroy();
      res.json({ message: 'Watchlist item deleted successfully.' });
    } else {
      res.status(404).json({ error: 'Watchlist item not found.' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete watchlist item.' });
  }
};
