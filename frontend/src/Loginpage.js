import React, { useState } from 'react';
import axios from 'axios';
import './Loginpage.css';
// import { useNavigate } from 'react-router-dom';

function LoginPage({ onLoginSuccess }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  //const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isRegistering) {
      // Register a new user
      axios.post('/api/auth/register', { username, email, password })
        .then(response => {
          setMessage(`Registration successful: ${response.data.user.username}. Please login now.`);
          setIsRegistering(false);
          setUsername('');
          setEmail('');
          setPassword('');
        })
        .catch(err => {
          console.error(err);
          setMessage(err.response?.data?.error || 'Registration failed');
        });
    } else {
      // Login existing user
      axios.post('/api/auth/login', { email, password })
        .then(response => {
          localStorage.setItem('token', response.data.token);
          onLoginSuccess();
        })
        .catch(err => {
          console.error(err);
          setMessage(err.response?.data?.error || 'Login failed. Check credentials.');
        });
    }
  };

  return (
    <div className="login-container">
      <h2>{isRegistering ? 'Register' : 'Login'}</h2>
      <form onSubmit={handleSubmit}>
        {isRegistering && (
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
          />
        )}
        <input 
          type="email" 
          placeholder="Email" 
          value={email}
          onChange={e => setEmail(e.target.value)}
          required 
        />
        <input 
          type="password" 
          placeholder="Password" 
          value={password}
          onChange={e => setPassword(e.target.value)}
          required 
        />
        <button type="submit">
          {isRegistering ? 'Register' : 'Login'}
        </button>
      </form>
      {message && <p>{message}</p>}
      <button className="toggle-button" onClick={() => {
        setIsRegistering(!isRegistering);
        setMessage(''); // Clear messages when toggling
      }}>
        {isRegistering ? 'Already have an account? Login' : 'Need an account? Register'}
      </button>
    </div>
  );
}

export default LoginPage;


