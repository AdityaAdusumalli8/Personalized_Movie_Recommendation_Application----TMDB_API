// models/tvshow.js

const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class TVShow extends Model {
    static associate(models) {
      TVShow.hasMany(models.Watchlist, {
        foreignKey: 'tv_show_id',
        as: 'watchlists',
      });
      
      TVShow.hasMany(models.Notification, {
        foreignKey: 'content_id', 
        constraints: false,
        as: 'notifications',
      });
    }
  }

  TVShow.init(
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
      start_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      end_date: {
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
      modelName: 'TVShow',
      tableName: 'tv_shows',
      timestamps: false,
    }
  );

  return TVShow;
};
