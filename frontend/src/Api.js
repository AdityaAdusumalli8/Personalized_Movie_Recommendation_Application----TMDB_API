// frontend/src/api.js
import axios from 'axios';

// Create an Axios instance
const api = axios.create({
  baseURL: '/api', // Uses the proxy defined in package.json
});

// Maximum allowed token size in characters (example: 4096)
const MAX_TOKEN_SIZE = 4096;

// Request interceptor to add the token to headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      // Check token size to prevent large headers
      if (token.length < MAX_TOKEN_SIZE) {
        config.headers['Authorization'] = `Bearer ${token}`;
      } else {
        console.warn('Token is too large, removing it to prevent large headers.');
        localStorage.removeItem('token');
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle auth errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // Remove invalid token and redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login'; // Redirect to login
    }
    return Promise.reject(error);
  }
);

export default api;
