const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Notification extends Model {
    static associate(models) {

      Notification.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });

      Notification.belongsTo(models.Movie, {
        foreignKey: 'content_id',
        constraints: false,
        as: 'movie',
      });
      Notification.belongsTo(models.TVShow, {
        foreignKey: 'content_id',
        constraints: false,
        as: 'tv_show',
      });
    }
  }

  Notification.init(
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
        allowNull: true,
      },
      notification_type: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      scheduled_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      sent_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: 'Notification',
      tableName: 'notifications',
      timestamps: false,
    }
  );

  return Notification;
};
