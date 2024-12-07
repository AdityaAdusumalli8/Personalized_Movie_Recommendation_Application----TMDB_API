// controllers/tvshowController.js

const { TVShow } = require('../models');

// Get all TV shows
exports.getAllTVShows = async (req, res) => {
  try {
    const tvShows = await TVShow.findAll();
    res.json(tvShows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve TV shows.' });
  }
};

// Get a single TV show by ID
exports.getTVShowById = async (req, res) => {
  try {
    const tvShow = await TVShow.findByPk(req.params.id);
    if (tvShow) {
      res.json(tvShow);
    } else {
      res.status(404).json({ error: 'TV show not found.' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve TV show.' });
  }
};

// Create a new TV show
exports.createTVShow = async (req, res) => {
  try {
    const { tmdb_id, title, genre_ids, start_date, end_date, summary, poster_url } = req.body;
    const newTVShow = await TVShow.create({
      tmdb_id,
      title,
      genre_ids,
      start_date,
      end_date,
      summary,
      poster_url
    });
    res.status(201).json(newTVShow);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create TV show.', details: error.message });
  }
};

// Update an existing TV show
exports.updateTVShow = async (req, res) => {
  try {
    const { tmdb_id, title, genre_ids, start_date, end_date, summary, poster_url } = req.body;
    const tvShow = await TVShow.findByPk(req.params.id);
    if (tvShow) {
      await tvShow.update({
        tmdb_id,
        title,
        genre_ids,
        start_date,
        end_date,
        summary,
        poster_url
      });
      res.json(tvShow);
    } else {
      res.status(404).json({ error: 'TV show not found.' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to update TV show.' });
  }
};

// Delete a TV show
exports.deleteTVShow = async (req, res) => {
  try {
    const tvShow = await TVShow.findByPk(req.params.id);
    if (tvShow) {
      await tvShow.destroy();
      res.json({ message: 'TV show deleted successfully.' });
    } else {
      res.status(404).json({ error: 'TV show not found.' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete TV show.' });
  }
};
