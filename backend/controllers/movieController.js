// controllers/movieController.js

const { Movie } = require('../models');

// Get all movies
exports.getAllMovies = async (req, res) => {
  try {
    const movies = await Movie.findAll();
    res.json(movies);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve movies.' });
  }
};

// Get a single movie by ID
exports.getMovieById = async (req, res) => {
  try {
    const movie = await Movie.findByPk(req.params.id);
    if (movie) {
      res.json(movie);
    } else {
      res.status(404).json({ error: 'Movie not found.' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve movie.' });
  }
};

// Create a new movie
exports.createMovie = async (req, res) => {
  try {
    const { tmdb_id, title, genre_ids, release_date, summary, poster_url } = req.body;
    const newMovie = await Movie.create({
      tmdb_id,
      title,
      genre_ids,
      release_date,
      summary,
      poster_url
    });
    res.status(201).json(newMovie);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create movie.', details: error.message });
  }
};

// Update an existing movie
exports.updateMovie = async (req, res) => {
  try {
    const { tmdb_id, title, genre_ids, release_date, summary, poster_url } = req.body;
    const movie = await Movie.findByPk(req.params.id);
    if (movie) {
      await movie.update({
        tmdb_id,
        title,
        genre_ids,
        release_date,
        summary,
        poster_url
      });
      res.json(movie);
    } else {
      res.status(404).json({ error: 'Movie not found.' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to update movie.' });
  }
};

// Delete a movie
exports.deleteMovie = async (req, res) => {
  try {
    const movie = await Movie.findByPk(req.params.id);
    if (movie) {
      await movie.destroy();
      res.json({ message: 'Movie deleted successfully.' });
    } else {
      res.status(404).json({ error: 'Movie not found.' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete movie.' });
  }
};
