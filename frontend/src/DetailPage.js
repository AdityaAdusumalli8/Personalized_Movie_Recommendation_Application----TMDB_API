import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import api from './Api';

function DetailsPage() {
  const { media_type, id } = useParams();
  const [details, setDetails] = useState(null);
  const [error, setError] = useState('');
  const [watchlist, setWatchlist] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const fromWatchlist = location.state?.fromWatchlist || false;

  useEffect(() => {
    const apiKey = process.env.REACT_APP_TMDB_API_KEY;
    const endpoint = media_type === 'movie' 
      ? `https://api.themoviedb.org/3/movie/${id}?api_key=${apiKey}&language=en-US`
      : `https://api.themoviedb.org/3/tv/${id}?api_key=${apiKey}&language=en-US`;
    
    fetch(endpoint)
      .then(res => res.json())
      .then(data => {
        if (data.id) {
          setDetails(data);
        } else {
          setError('Failed to fetch details.');
        }
      })
      .catch(err => {
        console.error("Error fetching details:", err);
        setError('An error occurred while fetching details.');
      });

    api.get('/watchlists')
      .then(response => {
        setWatchlist(response.data);
      })
      .catch(error => {
        console.error("Error fetching watchlist:", error);
      });
  }, [media_type, id]);

  const handleAddToWatchlist = async () => {
    try {
      if (watchlist.some(watchItem => 
        watchItem.movie?.tmdb_id === details.id || 
        watchItem.tv_show?.tmdb_id === details.id
      )) {
        setError('This title is already in your watchlist!');
        setTimeout(() => setError(''), 3000);
        return;
      }

      const genre_ids = details.genres.map(g => g.id);

      const requestData = {
        content_type: media_type === 'tv' ? 'tv_show' : 'movie',
        status: 'planned',
        movie_data: media_type !== 'tv' ? {
          tmdb_id: details.id,
          title: details.title,
          genre_ids: genre_ids,
          release_date: details.release_date,
          summary: details.overview,
          poster_url: details.poster_path ? `https://image.tmdb.org/t/p/w500${details.poster_path}` : null,
        } : null,
        tv_data: media_type === 'tv' ? {
          tmdb_id: details.id,
          title: details.name,
          genre_ids: genre_ids,
          release_date: details.first_air_date,
          summary: details.overview,
          poster_url: details.poster_path ? `https://image.tmdb.org/t/p/w500${details.poster_path}` : null,
        } : null
      };

      await api.post('/watchlists', requestData);
      navigate(-1); 
    } catch (error) {
      console.error("Error adding to watchlist:", error);
      setError('Failed to add to watchlist. Please try again.');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleBack = () => {
    navigate(-1); 
  };

  if (error) {
    return (
      <div className="app-container">
        <div className="error-message">{error}</div>
        <button className="header-button" onClick={handleBack}>Back</button>
      </div>
    );
  }

  if (!details) {
    return <div className="app-container">Loading...</div>;
  }

  const title = media_type === 'movie' ? details.title : details.name;
  const releaseDate = media_type === 'movie' ? details.release_date : details.first_air_date;
  const posterUrl = details.poster_path ? `https://image.tmdb.org/t/p/w300${details.poster_path}` : null;

  const isInWatchlist = watchlist.some(watchItem => 
    watchItem.movie?.tmdb_id === details.id || 
    watchItem.tv_show?.tmdb_id === details.id
  );

  return (
    <div className="app-container">
      <div className="detail-header">
        <button className="header-button" onClick={handleBack}>Back</button>
        {!fromWatchlist && ( 
          <button 
            className="add-button"
            onClick={handleAddToWatchlist}
            disabled={isInWatchlist}
          >
            {isInWatchlist ? 'Already in Watchlist' : 'Add to Watchlist'}
          </button>
        )}
      </div>
      <div className="detail-content">
        <h1>{title}</h1>
        {posterUrl && <img src={posterUrl} alt={title} className="detail-poster" />}
        <p><strong>Release Date: </strong>{releaseDate}</p>
        <p><strong>Overview: </strong>{details.overview}</p>
        {details.genres && (
          <p><strong>Genres: </strong>{details.genres.map(g => g.name).join(', ')}</p>
        )}
      </div>
    </div>
  );
}

export default DetailsPage;



