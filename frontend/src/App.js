import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import './App.css';
import LoginPage from './Loginpage';

function MainPage({ onLogout }) {
  const [movies, setMovies] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const apiKey = process.env.REACT_APP_TMDB_API_KEY;
    const url = `https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&language=en-US&page=1`;

    axios.get(url)
      .then(response => {
        setMovies(response.data.results);
      })
      .catch(error => {
        console.error("Error fetching movies from TMDB:", error);
      });

    axios.get('/api/watchlists', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(response => {
        setWatchlist(response.data);
      })
      .catch(error => {
        console.error("Error fetching watchlist:", error);
      });
  }, [navigate]);

  const handleAddToWatchlist = async (movie) => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const response = await axios.post(
        '/api/watchlists',
        {
          content_id: movie.id,
          content_type: 'movie',
          status: 'planned',
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setWatchlist(prev => [...prev, response.data]);
    } catch (error) {
      console.error("Error adding movie to watchlist:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    onLogout();
    navigate('/login');
  };

  return (
    <div className="app-container">
      <header className="header">
        <h1 className="header-title">My WatchList</h1>
        <button className="header-button" onClick={handleLogout}>
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

      <div className="content-grid">
        {movies.length > 0 ? (
          movies.map(movie => (
            <div key={movie.id} className="item-card">
              <div className="poster-placeholder">
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
              <button
                className="add-button"
                onClick={() => handleAddToWatchlist(movie)}
                disabled={watchlist.some(item => item.content_id === movie.id)}
              >
                {watchlist.some(item => item.content_id === movie.id)
                  ? "Added"
                  : "Add"}
              </button>
            </div>
          ))
        ) : (
          <p>Loading movies...</p>
        )}
      </div>
    </div>
  );
}

function CurrentWatchlist() {
  const [watchlist, setWatchlist] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    axios.get('/api/watchlists', { headers: { Authorization: `Bearer ${token}` } })
      .then(response => {
        setWatchlist(response.data);
      })
      .catch(error => {
        console.error("Error fetching watchlist:", error);
      });

    const apiKey = process.env.REACT_APP_TMDB_API_KEY;
    const url = `https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&language=en-US&page=1`;
    axios.get(url)
      .then(response => {
        setRecommendations(response.data.results.slice(0, 5));
      })
      .catch(error => {
        console.error("Error fetching recommendations:", error);
      });
  }, [navigate]);

  const handleAddToWatchlist = async (movie) => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const response = await axios.post(
        '/api/watchlists',
        {
          content_id: movie.id,
          content_type: 'movie',
          status: 'planned',
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setWatchlist(prev => [...prev, response.data]);
    } catch (error) {
      console.error("Error adding movie to watchlist:", error);
    }
  };

  return (
    <div className="app-container">
      <header className="header">
        <h1 className="header-title">Track Progress</h1>
        <button className="header-button" onClick={() => navigate('/')}>
          Back to Home
        </button>
      </header>

      <h2 className="section-title">My Current Watchlist</h2>
      <div className="content-grid">
        {watchlist.length > 0 ? (
          watchlist.map(item => (
            <div key={item.id} className="item-card">
              <div className="poster-placeholder">
                {item.movie?.poster_url ? (
                  <img
                    src={item.movie.poster_url}
                    alt={item.movie.title}
                    className="poster-image"
                  />
                ) : (
                  <div className="no-poster">No Image</div>
                )}
              </div>
              <div className="movie-title">{item.movie?.title}</div>
            </div>
          ))
        ) : (
          <p>No movies in your watchlist.</p>
        )}
      </div>

      <h2 className="section-title">Personalized Recommendations</h2>
      <div className="content-grid">
        {recommendations.map(movie => (
          <div key={movie.id} className="item-card">
            <div className="poster-placeholder">
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
            <button
              className="add-button"
              onClick={() => handleAddToWatchlist(movie)}
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
  const [upcomingMovies, setUpcomingMovies] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const apiKey = process.env.REACT_APP_TMDB_API_KEY;
    const url = `https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&language=en-US&page=1`;

    axios
      .get(url)
      .then(response => {
        setUpcomingMovies(response.data.results.slice(0, 5));
      })
      .catch(error => {
        console.error("Error fetching upcoming movies:", error);
      });
  }, []);

  const handleNotify = async (movie) => {
    try {
      const response = await axios.post('/api/notifications', {
        content_id: movie.id,
        notification_type: 'upcoming',
      });
      setNotifications(prev => [...prev, response.data]);
    } catch (error) {
      console.error("Error creating notification:", error);
    }
  };

  return (
    <div className="app-container">
      <header className="header">
        <h1 className="header-title">Upcoming Movies</h1>
        <button className="header-button" onClick={() => navigate('/')}>
          Back to Home
        </button>
      </header>

      <div className="content-grid">
        {upcomingMovies.map(movie => (
          <div key={movie.id} className="item-card">
            <div className="poster-placeholder">
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
            <button
              className="notify-button"
              onClick={() => handleNotify(movie)}
              disabled={notifications.some(item => item.content_id === movie.id)}
            >
              {notifications.some(item => item.content_id === movie.id)
                ? "Notify On"
                : "Notify"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={
            !isLoggedIn ? (
              <LoginPage onLoginSuccess={() => setIsLoggedIn(true)} />
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/"
          element={isLoggedIn ? <MainPage onLogout={() => setIsLoggedIn(false)} /> : <Navigate to="/login" />}
        />
        <Route
          path="/current-watchlist"
          element={isLoggedIn ? <CurrentWatchlist /> : <Navigate to="/login" />}
        />
        <Route
          path="/upcoming-movies"
          element={isLoggedIn ? <UpcomingMovies /> : <Navigate to="/login" />}
        />
      </Routes>
    </Router>
  );
}

export default App;
