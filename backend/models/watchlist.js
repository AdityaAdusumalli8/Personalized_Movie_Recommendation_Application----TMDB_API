// models/watchlist.js

const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Watchlist extends Model {
    static associate(models) {
      // Associations
      Watchlist.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });

      // Polymorphic association for content (Movie or TVShow)
      Watchlist.belongsTo(models.Movie, {
        foreignKey: 'content_id',
        constraints: false,
        as: 'movie',
      });
      Watchlist.belongsTo(models.TVShow, {
        foreignKey: 'content_id',
        constraints: false,
        as: 'tv_show',
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
      content_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      content_type: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: {
          isIn: [['movie', 'tv_show']],
        },
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
