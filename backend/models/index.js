// models/index.js

const fs = require('fs');
const path = require('path');
const sequelize = require('../config/database'); // Correct path to database.js
const { Sequelize } = require('sequelize');

const basename = path.basename(__filename);
const db = {};

// Dynamically import all model files
fs
  .readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&             // Ignore hidden files
      file !== basename &&                    // Ignore index.js
      file.slice(-3) === '.js'                // Only .js files
    );
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

// Handle model associations
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// Export the Sequelize instance and models
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
