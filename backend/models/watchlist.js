const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Watchlist extends Model {
    static associate(models) {
      Watchlist.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });

      Watchlist.belongsTo(models.Movie, {
        foreignKey: 'movie_id',
        as: 'movie'
      });

      Watchlist.belongsTo(models.TVShow, {
        foreignKey: 'tv_show_id',
        as: 'tv_show'
      });
    }
  }

  Watchlist.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      movie_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'movies',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      tv_show_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'tv_shows',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      status: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: 'planned',
        validate: {
          isIn: [['planned', 'watching', 'completed']],
        },
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: 'Watchlist',
      tableName: 'watchlists',
      timestamps: false,
    }
  );

  return Watchlist;
};
