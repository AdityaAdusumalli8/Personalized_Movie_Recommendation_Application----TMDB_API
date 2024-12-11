import React, { useState, useContext } from 'react';
import api from './Api';
import './Loginpage.css';
import { AuthContext } from './AuthContext';

function LoginPage() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const { login } = useContext(AuthContext);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isRegistering) {
      api.post('/auth/register', { username, email, password })
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
      api.post('/auth/login', { email, password })
        .then(response => {
          login(response.data.token);
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
        setMessage('');
      }}>
        {isRegistering ? 'Already have an account? Login' : 'Need an account? Register'}
      </button>
    </div>
  );
}

export default LoginPage;
