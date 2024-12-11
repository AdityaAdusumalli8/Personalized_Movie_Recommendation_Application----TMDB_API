

const axios = require('axios');
const { Movie } = require('../models');
require('dotenv').config();

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_POPULAR_MOVIES_URL = `https://api.themoviedb.org/3/movie/popular?api_key=${TMDB_API_KEY}&language=en-US&page=1`;

async function syncMovies() {
  try {
    const response = await axios.get(TMDB_POPULAR_MOVIES_URL);
    const movies = response.data.results;

    for (const movieData of movies) {
      const [movie, created] = await Movie.findOrCreate({
        where: { tmdb_id: movieData.id },
        defaults: {
          title: movieData.title,
          genre_ids: JSON.stringify(movieData.genre_ids),
          release_date: movieData.release_date,
          summary: movieData.overview,
          poster_url: movieData.poster_path ? `https://image.tmdb.org/t/p/w500${movieData.poster_path}` : null,
        },
      });

      if (!created) {
        // Update existing movie with latest data
        await movie.update({
          title: movieData.title,
          genre_ids: JSON.stringify(movieData.genre_ids),
          release_date: movieData.release_date,
          summary: movieData.overview,
          poster_url: movieData.poster_path ? `https://image.tmdb.org/t/p/w500${movieData.poster_path}` : null,
        });
        console.log(`Updated existing movie: ${movie.title}`);
      } else {
        console.log(`Added new movie: ${movie.title}`);
      }
    }

    console.log('Movie synchronization complete.');
  } catch (error) {
    console.error('Error syncing movies:', error);
  }
}

syncMovies();
