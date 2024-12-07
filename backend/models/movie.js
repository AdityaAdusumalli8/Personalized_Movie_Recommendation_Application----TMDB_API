
// models/movie.js

const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Movie extends Model {
    static associate(models) {
      // Associations can be defined here if needed
      Movie.hasMany(models.Watchlist, {
        foreignKey: 'content_id',
        constraints: false,
        scope: {
          content_type: 'movie',
        },
        as: 'watchlists',
      });
      Movie.hasMany(models.Notification, {
        foreignKey: 'content_id',
        constraints: false,
        as: 'notifications',
      });
    }
  }

  Movie.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      tmdb_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING(200),
        allowNull: false,
      },
      genre_ids: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      release_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      summary: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      poster_url: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: 'Movie',
      tableName: 'movies',
      timestamps: false,
    }
  );

  return Movie;
};
