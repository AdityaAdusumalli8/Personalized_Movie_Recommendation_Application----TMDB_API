import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import './App.css';
import LoginPage from './Loginpage';

function MainPage({ onLogout }) {
  const [movies, setMovies] = useState([]);
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
  }, [navigate]);

  const handleLogout = () => {
    // Clear token and log out
    localStorage.removeItem('token');
    onLogout(); // Inform App that user is logged out
    navigate('/login'); // Redirect to login page
  };

  return (
    <div className="app-container">
      {/* Header Section */}
      <header className="header">
        <h1 className="header-title">My WatchList</h1>
        <button 
          className="header-button" 
          onClick={handleLogout}
        >
          Log Out
        </button>
      </header>

      {/* Search Section */}
      <div className="search-section">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search for Movies or TV Show..."
            className="search-input"
          />
          <button className="search-button">
            <span className="search-icon">🔍</span>
          </button>
        </div>
      </div>

      {/* Content Grid */}
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
              <button className="add-button">Add</button>
            </div>
          ))
        ) : (
          <p>Loading movies...</p>
        )}
      </div>

      {/* Footer Section */}
      <footer className="footer">
        <h2>Upcoming Movies</h2>
      </footer>
    </div>
  );
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));

  // Called after successful login
  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  return (
    <Router>
      <Routes>
        <Route 
          path="/login" 
          element={!isLoggedIn ? <LoginPage onLoginSuccess={handleLoginSuccess}/> : <Navigate to="/" />} 
        />
        <Route 
          path="/" 
          element={isLoggedIn ? <MainPage onLogout={handleLogout}/> : <Navigate to="/login" />} 
        />
      </Routes>
    </Router>
  );
}

export default App;
