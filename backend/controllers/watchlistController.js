const { Watchlist, Movie, TVShow, User } = require('../models');

exports.getAllWatchlists = async (req, res) => {
  try {
    const userId = req.user.id; 
    const watchlists = await Watchlist.findAll({
      where: { user_id: userId },
      include: [
        { model: Movie, as: "movie" },
        { model: TVShow, as: "tv_show" },
      ],
    });

    res.json(watchlists); 
  } catch (error) {
    console.error("Error retrieving watchlists:", error);
    res.status(500).json({ error: "Failed to retrieve watchlists." });
  }
};

exports.getWatchlistById = async (req, res) => {
  try {
    const watchlist = await Watchlist.findByPk(req.params.id, {
      include: [
        { model: User, as: 'user' },
        { model: Movie, as: 'movie' },
        { model: TVShow, as: 'tv_show' }
      ]
    });

    if (!watchlist) {
      return res.status(404).json({ error: 'Watchlist item not found.' });
    }

    if (watchlist.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to access this watchlist item.' });
    }

    res.json(watchlist);
  } catch (error) {
    console.error("Error retrieving watchlist item:", error);
    res.status(500).json({ error: 'Failed to retrieve watchlist item.' });
  }
};

exports.createWatchlist = async (req, res) => {
  try {
    console.log('Received request body:', req.body);
    const userId = req.user.id;
    const { status, movie_data, tv_data } = req.body;

    const isMovie = !!movie_data;
    const isTV = !!tv_data;

    if (!isMovie && !isTV) {
      return res.status(400).json({ error: 'No movie_data or tv_data provided.' });
    }

    let movie, tvShow;

    if (isMovie) {
      console.log('Processing movie data:', movie_data);
      const movieDefaults = {
        tmdb_id: movie_data.tmdb_id,
        title: movie_data.title,
        genre_ids: movie_data.genre_ids ? JSON.stringify(movie_data.genre_ids) : null,
        release_date: movie_data.release_date || null,
        summary: movie_data.summary || null,
        poster_url: movie_data.poster_url || null,
      };

      [movie] = await Movie.findOrCreate({
        where: { tmdb_id: movie_data.tmdb_id },
        defaults: movieDefaults
      });

      await movie.update(movieDefaults);

      const newWatchlist = await Watchlist.create({
        user_id: userId,
        movie_id: movie.id,
        tv_show_id: null,
        status: status || 'planned'
      });

      console.log('Created watchlist entry:', newWatchlist.toJSON());

      const watchlistWithContent = await Watchlist.findByPk(newWatchlist.id, {
        include: [
          { model: Movie, as: "movie" },
          { model: TVShow, as: "tv_show" },
        ],
      });

      console.log('Final watchlist item:', watchlistWithContent.toJSON());
      return res.status(201).json(watchlistWithContent);
    }

    if (isTV) {
      console.log('Processing TV show data:', tv_data);
      const tvDefaults = {
        tmdb_id: tv_data.tmdb_id,
        title: tv_data.title,
        genre_ids: tv_data.genre_ids ? JSON.stringify(tv_data.genre_ids) : null,
        start_date: tv_data.release_date || null,
        summary: tv_data.summary || null,
        poster_url: tv_data.poster_url || null,
      };

      [tvShow] = await TVShow.findOrCreate({
        where: { tmdb_id: tv_data.tmdb_id },
        defaults: tvDefaults
      });

      await tvShow.update(tvDefaults);

      const newWatchlist = await Watchlist.create({
        user_id: userId,
        tv_show_id: tvShow.id,
        movie_id: null,
        status: status || 'planned'
      });

      console.log('Created watchlist entry:', newWatchlist.toJSON());

      const watchlistWithContent = await Watchlist.findByPk(newWatchlist.id, {
        include: [
          { model: Movie, as: "movie" },
          { model: TVShow, as: "tv_show" },
        ],
      });

      console.log('Final watchlist item:', watchlistWithContent.toJSON());
      return res.status(201).json(watchlistWithContent);
    }

  } catch (error) {
    console.error("Error creating watchlist item:", error);
    res.status(500).json({ error: 'Failed to create watchlist item.', details: error.message });
  }
};


exports.updateWatchlist = async (req, res) => {
  try {
    const { status, movie_data, tv_data } = req.body;
    const watchlist = await Watchlist.findByPk(req.params.id);

    if (!watchlist) {
      return res.status(404).json({ error: 'Watchlist item not found.' });
    }

    if (watchlist.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to update this watchlist item.' });
    }

    let movieId = watchlist.movie_id;
    let tvShowId = watchlist.tv_show_id;

    if (movie_data) {
      const movieDefaults = {
        tmdb_id: movie_data.tmdb_id,
        title: movie_data.title,
        genre_ids: movie_data.genre_ids ? JSON.stringify(movie_data.genre_ids) : null,
        release_date: movie_data.release_date || null,
        summary: movie_data.summary || null,
        poster_url: movie_data.poster_url || null,
      };

      const [foundOrCreatedMovie] = await Movie.findOrCreate({
        where: { tmdb_id: movie_data.tmdb_id },
        defaults: movieDefaults
      });

      await foundOrCreatedMovie.update(movieDefaults);
      movieId = foundOrCreatedMovie.id;
      tvShowId = null; 
    }

    if (tv_data) {
      const tvDefaults = {
        tmdb_id: tv_data.tmdb_id,
        title: tv_data.title,
        genre_ids: tv_data.genre_ids ? JSON.stringify(tv_data.genre_ids) : null,
        start_date: tv_data.release_date || null,
        summary: tv_data.summary || null,
        poster_url: tv_data.poster_url || null,
      };

      const [foundOrCreatedTVShow] = await TVShow.findOrCreate({
        where: { tmdb_id: tv_data.tmdb_id },
        defaults: tvDefaults
      });

      await foundOrCreatedTVShow.update(tvDefaults);
      
      tvShowId = foundOrCreatedTVShow.id;
      movieId = null; 
    }

    await watchlist.update({
      movie_id: movieId,
      tv_show_id: tvShowId,
      status: status || watchlist.status
    });

    const updatedWatchlist = await Watchlist.findByPk(watchlist.id, {
      include: [
        { model: Movie, as: "movie" },
        { model: TVShow, as: "tv_show" },
      ],
    });

    res.json(updatedWatchlist);
  } catch (error) {
    console.error("Error updating watchlist:", error);
    res.status(500).json({ error: 'Failed to update watchlist item.' });
  }
};

exports.deleteWatchlist = async (req, res) => {
  try {
    const watchlist = await Watchlist.findByPk(req.params.id);
    if (!watchlist) {
      return res.status(404).json({ error: 'Watchlist item not found.' });
    }

    if (watchlist.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this watchlist item.' });
    }

    await watchlist.destroy();
    res.json({ message: 'Watchlist item deleted successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete watchlist item.' });
  }
};

