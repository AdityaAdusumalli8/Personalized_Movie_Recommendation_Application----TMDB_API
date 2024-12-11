import React, { useEffect, useState, useContext} from 'react';
import api from './Api';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import './App.css';
import LoginPage from './Loginpage';
import DetailsPage from './DetailPage'; 
import { AuthContext } from './AuthContext';

function MainPage() {
  const [movies, setMovies] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useContext(AuthContext);

  useEffect(() => {
    if (location.state) {
      const { searchQuery: savedQuery, searchResults: savedResults, isSearching: savedSearching } = location.state;
      if (savedQuery) setSearchQuery(savedQuery);
      if (savedResults) setSearchResults(savedResults);
      if (savedSearching) setIsSearching(savedSearching);
      // Clear the location state to prevent it from persisting
      window.history.replaceState({}, document.title);
    }

    const apiKey = process.env.REACT_APP_TMDB_API_KEY;
    const url = `https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&language=en-US&page=1`;

    api.get(url)
      .then(response => {
        const moviesWithType = response.data.results.map(movie => ({
          ...movie,
          media_type: 'movie'
        }));
        setMovies(moviesWithType);
      })
      .catch(error => {
        console.error("Error fetching movies from TMDB:", error);
      });

    api.get('/watchlists')
      .then(response => {
        setWatchlist(response.data);
      })
      .catch(error => {
        console.error("Error fetching watchlist:", error);
      });
  }, [location.state]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    const apiKey = process.env.REACT_APP_TMDB_API_KEY;
    
    try {
      // Search for movies
      const movieResponse = await fetch(
        `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${searchQuery}&language=en-US&page=1`
      );
      const movieData = await movieResponse.json();

      // Search for TV shows
      const tvResponse = await fetch(
        `https://api.themoviedb.org/3/search/tv?api_key=${apiKey}&query=${searchQuery}&language=en-US&page=1`
      );
      const tvData = await tvResponse.json();

      // Get detailed data for each movie
      const moviePromises = movieData.results.map(async (movie) => {
        const detailResponse = await fetch(
          `https://api.themoviedb.org/3/movie/${movie.id}?api_key=${apiKey}&language=en-US`
        );
        const detailData = await detailResponse.json();
        return {
          ...detailData,
          media_type: 'movie'
        };
      });

      // Get detailed data for each TV show
      const tvPromises = tvData.results.map(async (tv) => {
        const detailResponse = await fetch(
          `https://api.themoviedb.org/3/tv/${tv.id}?api_key=${apiKey}&language=en-US`
        );
        const detailData = await detailResponse.json();
        return {
          ...detailData,
          media_type: 'tv',
          title: detailData.name,
          release_date: detailData.first_air_date
        };
      });

      // Wait for all detailed data
      const [detailedMovies, detailedTVShows] = await Promise.all([
        Promise.all(moviePromises),
        Promise.all(tvPromises)
      ]);

      // Combine and format results
      const combinedResults = [
        ...detailedMovies,
        ...detailedTVShows
      ];

      setSearchResults(combinedResults);
    } catch (error) {
      console.error("Error searching:", error);
      setError('Failed to search. Please try again.');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleAddToWatchlist = async (item) => {
    try {
      // Check if movie/show is already in watchlist
      if (watchlist.some(watchItem => 
        watchItem.movie?.tmdb_id === item.id || 
        watchItem.tv_show?.tmdb_id === item.id
      )) {
        setError('This title is already in your watchlist!');
        setTimeout(() => setError(''), 3000);
        return;
      }

      // Extract genre IDs from the genres array if it exists
      const genre_ids = item.genres ? item.genres.map(g => g.id) : item.genre_ids;

      const requestData = {
        content_type: item.media_type === 'tv' ? 'tv_show' : 'movie',
        status: 'planned',
        movie_data: item.media_type !== 'tv' ? {
          tmdb_id: item.id,
          title: item.title,
          genre_ids: genre_ids,
          release_date: item.release_date,
          summary: item.overview,
          poster_url: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null,
        } : null,
        tv_data: item.media_type === 'tv' ? {
          tmdb_id: item.id,
          title: item.title,
          genre_ids: genre_ids,
          release_date: item.release_date,
          summary: item.overview,
          poster_url: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null,
        } : null
      };

      const addResponse = await api.post('/watchlists', requestData);
      
      // Update the local watchlist with the new data
      if (addResponse.data) {
        setWatchlist(prev => [...prev, addResponse.data]);
      } else {
        // If we don't get the data back, fetch the updated watchlist
        const response = await api.get('/watchlists');
        setWatchlist(response.data);
      }
    } catch (error) {
      console.error("Error adding to watchlist:", error);
      setError('Failed to add to watchlist. Please try again.');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleLogoutClick = () => {
    logout();
  };

  return (
    <div className="app-container">
      <header className="header">
        <h1 className="header-title">My WatchList</h1>
        <button className="header-button" onClick={handleLogoutClick}>
          Log Out
        </button>
        <button
          className="header-button"
          onClick={() => navigate('/current-watchlist')}
        >
          Current Watchlist
        </button>
        <button
          className="header-button"
          onClick={() => navigate('/upcoming-movies')}
        >
          Upcoming Movies
        </button>
      </header>

      {error && <div className="error-message">{error}</div>}

      <div className="search-container">
        <form onSubmit={handleSearch}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for movies or TV shows..."
            className="search-input"
          />
          <button type="submit" className="search-button">
            Search
          </button>
        </form>
      </div>

      <div className="content-grid">
        {isSearching ? (
          searchResults.length > 0 ? (
            searchResults.map(item => (
              <div key={`${item.media_type}-${item.id}`} className="item-card">
                <div 
                  className="poster-placeholder"
                  style={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/details/${item.media_type}/${item.id}`)}
                >
                  {item.poster_path ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w200${item.poster_path}`}
                      alt={item.title}
                      className="poster-image"
                    />
                  ) : (
                    <div className="no-poster">No Image</div>
                  )}
                </div>
                <div className="movie-title">{item.title}</div>
                <div className="media-type-badge">{item.media_type === 'movie' ? 'Movie' : 'TV Show'}</div>
                <button
                  className="add-button"
                  onClick={() => handleAddToWatchlist(item)}
                >
                  Add
                </button>
              </div>
            ))
          ) : (
            <p>No results found</p>
          )
        ) : (
          movies.length > 0 ? (
            movies.map(movie => (
              <div key={movie.id} className="item-card">
                <div
                  className="poster-placeholder"
                  style={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/details/movie/${movie.id}`)}
                >
                  {movie.poster_path ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`}
                      alt={movie.title}
                      className="poster-image"
                    />
                  ) : (
                    <div className="no-poster">No Image</div>
                  )}
                </div>
                <div className="movie-title">{movie.title}</div>
                <div className="media-type-badge">{movie.media_type === 'movie' ? 'Movie' : 'TV Show'}</div>
                <button
                  className="add-button"
                  onClick={() => handleAddToWatchlist({...movie, media_type: 'movie'})}
                >
                  Add
                </button>
              </div>
            ))
          ) : (
            <p>Loading movies...</p>
          )
        )}
      </div>
    </div>
  );
}

function CurrentWatchlist() {
  const [watchlist, setWatchlist] = useState([]);
  const [completedList, setCompletedList] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [error, setError] = useState('');
  const [watchlistSearchQuery, setWatchlistSearchQuery] = useState('');
  const [completedSearchQuery, setCompletedSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const watchlistRes = await api.get('/watchlists');
        const allItems = watchlistRes.data;
        const planned = allItems.filter(item => item.status === 'planned');
        const completed = allItems.filter(item => item.status === 'completed');

        setWatchlist(planned);
        setCompletedList(completed);

        // Fetch recommendations logic here
        const apiKey = process.env.REACT_APP_TMDB_API_KEY;
        const itemsForRecommendations = [...planned, ...completed].slice(0, 3);

        let similarResults = [];

        for (const item of itemsForRecommendations) {
          const id = item.movie ? item.movie.tmdb_id : item.tv_show.tmdb_id;
          const type = item.movie ? 'movie' : 'tv';
          const similarUrl = `https://api.themoviedb.org/3/${type}/${id}/similar?api_key=${apiKey}&language=en-US&page=1`;

          const similarRes = await fetch(similarUrl);
          const similarData = await similarRes.json();

          if (similarData.results) {
            for (let simItem of similarData.results) {
              simItem.media_type = type;
            }
            similarResults = similarResults.concat(similarData.results);
          }
        }

        const allTmdbIds = new Set([
          ...planned.map(i => i.movie?.tmdb_id || i.tv_show?.tmdb_id),
          ...completed.map(i => i.movie?.tmdb_id || i.tv_show?.tmdb_id)
        ]);

        const uniqueRecommendations = [];
        const seen = new Set();

        for (const rec of similarResults) {
          const uniqueKey = `${rec.media_type}-${rec.id}`;
          if (!seen.has(uniqueKey) && !allTmdbIds.has(rec.id)) {
            seen.add(uniqueKey);
            uniqueRecommendations.push(rec);
          }
        }

        setRecommendations(uniqueRecommendations.slice(0, 10));
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };

    fetchData();
  }, []);

  const handleAddToWatchlist = async (item) => {
    try {
      if ([...watchlist, ...completedList].some(w =>
        (w.movie && w.movie.tmdb_id === item.id) ||
        (w.tv_show && w.tv_show.tmdb_id === item.id)
      )) {
        setError('This title is already in your lists!');
        setTimeout(() => setError(''), 3000);
        return;
      }

      const genre_ids = item.genre_ids || (item.genres ? item.genres.map(g => g.id) : []);
      const requestData = {
        content_id: item.id,
        content_type: item.media_type === 'tv' ? 'tv_show' : 'movie',
        status: 'planned',
        movie_data: item.media_type === 'movie' ? {
          tmdb_id: item.id,
          title: item.title,
          genre_ids: genre_ids,
          release_date: item.release_date,
          summary: item.overview,
          poster_url: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null,
        } : null,
        tv_data: item.media_type === 'tv' ? {
          tmdb_id: item.id,
          title: item.title,
          genre_ids: genre_ids,
          release_date: item.release_date,
          summary: item.overview,
          poster_url: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null,
        } : null
      };

      const response = await api.post('/watchlists', requestData);
      setWatchlist(prev => [...prev, response.data]);
    } catch (error) {
      console.error("Error adding to watchlist:", error);
      setError('Failed to add to watchlist. Please try again.');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleDelete = async (watchlistId) => {
    try {
      await api.delete(`/watchlists/${watchlistId}`);
      setWatchlist(prev => prev.filter(item => item.id !== watchlistId));
      setCompletedList(prev => prev.filter(item => item.id !== watchlistId));
    } catch (error) {
      console.error("Error deleting from watchlist:", error);
      setError('Failed to delete item from watchlist. Please try again.');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleMarkAsWatched = async (item) => {
    try {
      const response = await api.put(`/watchlists/${item.id}`, {
        content_type: item.movie ? 'movie' : 'tv_show',
        status: 'completed',
        movie_data: item.movie ? {
          tmdb_id: item.movie.tmdb_id,
          title: item.movie.title,
          genre_ids: item.movie.genre_ids,
          release_date: item.movie.release_date,
          summary: item.movie.summary,
          poster_url: item.movie.poster_url
        } : null,
        tv_data: item.tv_show ? {
          tmdb_id: item.tv_show.tmdb_id,
          title: item.tv_show.title,
          genre_ids: item.tv_show.genre_ids,
          release_date: item.tv_show.release_date,
          summary: item.tv_show.summary,
          poster_url: item.tv_show.poster_url
        } : null
      });

      const updatedItem = response.data;
      setWatchlist(prev => prev.filter(i => i.id !== item.id));
      setCompletedList(prev => [...prev, updatedItem]);
    } catch (error) {
      console.error("Error marking as watched:", error);
      setError('Failed to mark item as watched. Please try again.');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handlePosterClick = (item) => {
    const mediaType = item.movie ? 'movie' : 'tv';
    const tmdbId = item.movie?.tmdb_id || item.tv_show?.tmdb_id;
    navigate(`/details/${mediaType}/${tmdbId}`, { state: { fromWatchlist: true } });
  };

  const handlePosterClickForRecommendations = (rec) => {
    // Use the recommendation's media_type and id to navigate
    navigate(`/details/${rec.media_type}/${rec.id}`, { state: { fromWatchlist: false } });
  };

  const filteredWatchlist = watchlist.filter(item =>
    (item.movie?.title || item.tv_show?.title || '').toLowerCase().includes(watchlistSearchQuery.toLowerCase())
  );

  const filteredCompleted = completedList.filter(item =>
    (item.movie?.title || item.tv_show?.title || '').toLowerCase().includes(completedSearchQuery.toLowerCase())
  );

  const handleWatchlistSearch = (e) => {
    e.preventDefault();
  };

  const handleCompletedSearch = (e) => {
    e.preventDefault();
  };

  return (
    <div className="app-container">
      <header className="header">
        <h1 className="header-title">Track Progress</h1>
        <button className="header-button" onClick={() => navigate('/')}>
          Back to Home
        </button>
      </header>

      {error && <div className="error-message">{error}</div>}

      <h2 className="section-title">My Current Watchlist</h2>
      <div className="search-container">
        <form onSubmit={handleWatchlistSearch}>
          <input
            type="text"
            value={watchlistSearchQuery}
            onChange={(e) => setWatchlistSearchQuery(e.target.value)}
            placeholder="Search watchlist..."
            className="search-input"
          />
          <button type="submit" className="search-button">
            Search
          </button>
        </form>
      </div>
      <div className="content-grid">
        {filteredWatchlist.length > 0 ? (
          filteredWatchlist.map(item => (
            <div key={item.id} className={`item-card ${item.status === 'completed' ? 'completed' : ''}`}>
              <div 
                className="poster-placeholder"
                style={{ cursor: 'pointer' }}
                onClick={() => handlePosterClick(item)}
              >
                {(item.movie?.poster_url || item.tv_show?.poster_url) ? (
                  <img
                    src={item.movie?.poster_url || item.tv_show?.poster_url}
                    alt={item.movie?.title || item.tv_show?.title}
                    className="poster-image"
                  />
                ) : (
                  <div className="no-poster">No Image</div>
                )}
              </div>
              <div className="movie-title">{item.movie?.title || item.tv_show?.title}</div>
              <div className="media-type-badge">
                {item.movie ? 'Movie' : 'TV Show'}
              </div>
              <div className="button-group">
                <button
                  className="watched-button"
                  onClick={() => handleMarkAsWatched(item)}
                >
                  Watched
                </button>
                <button
                  className="delete-button"
                  onClick={() => handleDelete(item.id)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))
        ) : (
          <p>No movies/shows in your watchlist.</p>
        )}
      </div>

      <h2 className="section-title">Completed</h2>
      <div className="search-container">
        <form onSubmit={handleCompletedSearch}>
          <input
            type="text"
            value={completedSearchQuery}
            onChange={(e) => setCompletedSearchQuery(e.target.value)}
            placeholder="Search completed..."
            className="search-input"
          />
          <button type="submit" className="search-button">
            Search
          </button>
        </form>
      </div>
      <div className="content-grid">
        {filteredCompleted.length > 0 ? (
          filteredCompleted.map(item => (
            <div key={item.id} className="item-card completed">
              <div 
                className="poster-placeholder"
                style={{ cursor: 'pointer' }}
                onClick={() => handlePosterClick(item)}
              >
                {(item.movie?.poster_url || item.tv_show?.poster_url) ? (
                  <img
                    src={item.movie?.poster_url || item.tv_show?.poster_url}
                    alt={item.movie?.title || item.tv_show?.title}
                    className="poster-image"
                  />
                ) : (
                  <div className="no-poster">No Image</div>
                )}
              </div>
              <div className="movie-title">{item.movie?.title || item.tv_show?.title}</div>
              <div className="media-type-badge">
                {item.movie ? 'Movie' : 'TV Show'}
              </div>
              <div className="completed-badge">Completed</div>
              <button
                className="delete-button"
                onClick={() => handleDelete(item.id)}
              >
                Remove
              </button>
            </div>
          ))
        ) : (
          <p>No completed items yet.</p>
        )}
      </div>

      <h2 className="section-title">Personalized Recommendations</h2>
      <div className="content-grid">
        {recommendations.map(rec => (
          <div key={`${rec.media_type}-${rec.id}`} className="item-card">
            <div 
              className="poster-placeholder"
              style={{ cursor: 'pointer' }}
              onClick={() => handlePosterClickForRecommendations(rec)}
            >
              {rec.poster_path ? (
                <img
                  src={`https://image.tmdb.org/t/p/w200${rec.poster_path}`}
                  alt={rec.title}
                  className="poster-image"
                />
              ) : (
                <div className="no-poster">No Image</div>
              )}
            </div>
            <div className="movie-title">{rec.title}</div>
            <div className="media-type-badge">{rec.media_type === 'movie' ? 'Movie' : 'TV Show'}</div>
            <button
              className="add-button"
              onClick={() => handleAddToWatchlist(rec)}
            >
              Add
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}


function UpcomingMovies() {
  const [upcomingContent, setUpcomingContent] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [watchlist, setWatchlist] = useState([]);

  useEffect(() => {
    // Fetch watchlist to prevent adding duplicates
    api.get('/watchlists')
      .then(response => {
        setWatchlist(response.data);
      })
      .catch(error => {
        console.error("Error fetching watchlist:", error);
      });

    const fetchUpcomingContent = async () => {
      try {
        const apiKey = process.env.REACT_APP_TMDB_API_KEY;
        const today = new Date().toISOString().split('T')[0];

        // Upcoming movies
        const moviesResponse = await fetch(
          `https://api.themoviedb.org/3/movie/upcoming?api_key=${apiKey}&language=en-US&page=1`
        );
        const moviesData = await moviesResponse.json();

        // Upcoming TV shows (using discover with a date filter)
        const tvResponse = await fetch(
          `https://api.themoviedb.org/3/discover/tv?api_key=${apiKey}&language=en-US&sort_by=first_air_date.asc&first_air_date.gte=${today}&page=1`
        );
        const tvData = await tvResponse.json();

        // Filter only future releases for movies
        const upcomingMovies = moviesData.results
          .filter(movie => movie.release_date >= today)
          .map(movie => ({ ...movie, media_type: 'movie', title: movie.title }));

        // Filter only future releases for TV
        const upcomingShows = tvData.results
          .filter(show => show.first_air_date >= today)
          .map(show => ({
            ...show,
            media_type: 'tv',
            title: show.name,
            release_date: show.first_air_date
          }));

        // Combine and sort by release date ascending
        const combined = [...upcomingMovies, ...upcomingShows].sort((a, b) => {
          return (a.release_date > b.release_date) ? 1 : -1;
        });

        setUpcomingContent(combined);
      } catch (error) {
        console.error("Error fetching upcoming content:", error);
      }
    };

    fetchUpcomingContent();
  }, []);

  const handleAddToWatchlist = async (item) => {
    try {
      // Check if item is already in watchlist
      if (watchlist.some(watchItem => 
        (item.media_type === 'movie' && watchItem.movie?.tmdb_id === item.id) ||
        (item.media_type === 'tv' && watchItem.tv_show?.tmdb_id === item.id)
      )) {
        setError('This title is already in your watchlist!');
        setTimeout(() => setError(''), 3000);
        return;
      }

      const genre_ids = item.genre_ids ? item.genre_ids : (item.genres ? item.genres.map(g => g.id) : []);
      const requestData = {
        content_type: item.media_type === 'tv' ? 'tv_show' : 'movie',
        status: 'planned',
        movie_data: item.media_type === 'movie' ? {
          tmdb_id: item.id,
          title: item.title,
          genre_ids: genre_ids,
          release_date: item.release_date,
          summary: item.overview,
          poster_url: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null,
        } : null,
        tv_data: item.media_type === 'tv' ? {
          tmdb_id: item.id,
          title: item.title,
          genre_ids: genre_ids,
          release_date: item.release_date,
          summary: item.overview,
          poster_url: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null,
        } : null
      };

      const addResponse = await api.post('/watchlists', requestData);

      if (addResponse.data) {
        setWatchlist(prev => [...prev, addResponse.data]);
      } else {
        const response = await api.get('/watchlists');
        setWatchlist(response.data);
      }
    } catch (error) {
      console.error("Error adding to watchlist:", error);
      setError('Failed to add to watchlist. Please try again.');
      setTimeout(() => setError(''), 3000);
    }
  };

  return (
    <div className="app-container">
      <header className="header">
        <h1 className="header-title">Upcoming Releases</h1>
        <button className="header-button" onClick={() => navigate('/')}>
          Back to Home
        </button>
      </header>

      {error && <div className="error-message">{error}</div>}

      <div className="content-grid">
        {upcomingContent.length > 0 ? (
          upcomingContent.map(item => (
            <div key={`${item.media_type}-${item.id}`} className="item-card">
              <div
                className="poster-placeholder"
                style={{ cursor: 'pointer' }}
                onClick={() => navigate(`/details/${item.media_type}/${item.id}`)}
              >
                {item.poster_path ? (
                  <img
                    src={`https://image.tmdb.org/t/p/w200${item.poster_path}`}
                    alt={item.title}
                    className="poster-image"
                  />
                ) : (
                  <div className="no-poster">No Image</div>
                )}
              </div>
              <div className="movie-title">{item.title}</div>
              <div className="media-type-badge">{item.media_type === 'movie' ? 'Movie' : 'TV Show'}</div>
              <button
                className="add-button"
                onClick={() => handleAddToWatchlist(item)}
              >
                Add
              </button>
            </div>
          ))
        ) : (
          <p>Loading upcoming releases...</p>
        )}
      </div>
    </div>
  );
}


function App() {
  const { isLoggedIn } = useContext(AuthContext);

  return (
    <Routes>
      <Route
        path="/login"
        element={
          !isLoggedIn ? (
            <LoginPage />
          ) : (
            <Navigate to="/" />
          )
        }
      />
      <Route
        path="/"
        element={isLoggedIn ? <MainPage /> : <Navigate to="/login" />}
      />
      <Route
        path="/current-watchlist"
        element={isLoggedIn ? <CurrentWatchlist /> : <Navigate to="/login" />}
      />
      <Route
        path="/upcoming-movies"
        element={isLoggedIn ? <UpcomingMovies /> : <Navigate to="/login" />}
      />
      {/* Add the details page route */}
      <Route
        path="/details/:media_type/:id"
        element={isLoggedIn ? <DetailsPage /> : <Navigate to="/login" />}
      />
      {/* Redirect any unknown routes to home or login */}
      <Route
        path="*"
        element={<Navigate to={isLoggedIn ? "/" : "/login"} />}
      />
    </Routes>
  );
}

export default App;
