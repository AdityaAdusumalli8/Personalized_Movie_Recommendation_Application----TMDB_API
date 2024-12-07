
// server.js
const express = require('express');
const dotenv = require('dotenv');
const routes = require('./routes'); // Centralized routes
const sequelize = require('./config/database');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware
app.use(express.json()); // Built-in middleware to parse JSON
app.use(express.urlencoded({ extended: true })); // Built-in middleware to parse URL-encoded data

// API Routes
app.use('/api', routes);

// Test Route
app.get('/', (req, res) => {
  res.send('API is running!');
});


// Sync Database and Start Server
const PORT = process.env.PORT || 3000;

sequelize.sync({ alter: true }) // Use { force: true } during development to reset tables
  .then(() => {
    console.log('Database synced successfully!');
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Error syncing database:', err);
  });

