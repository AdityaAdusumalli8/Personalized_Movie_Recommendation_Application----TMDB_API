const { Notification, User, Movie, TVShow } = require('../models');

exports.getAllNotifications = async (req, res) => {
  try {
    const notifications = await Notification.findAll({
      include: [
        { model: User, as: 'user' },
        { model: Movie, as: 'movie' },
        { model: TVShow, as: 'tv_show' }
      ]
    });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve notifications.' });
  }
};

exports.getNotificationById = async (req, res) => {
  try {
    const notification = await Notification.findByPk(req.params.id, {
      include: [
        { model: User, as: 'user' },
        { model: Movie, as: 'movie' },
        { model: TVShow, as: 'tv_show' }
      ]
    });
    if (notification) {
      res.json(notification);
    } else {
      res.status(404).json({ error: 'Notification not found.' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve notification.' });
  }
};

exports.createNotification = async (req, res) => {
  try {
    const { user_id, content_id, notification_type, scheduled_at } = req.body;

    // Optionally, verify that content_id exists in Movie or TVShow
    if (content_id) {
      const movie = await Movie.findByPk(content_id);
      const tvShow = await TVShow.findByPk(content_id);
      if (!movie && !tvShow) {
        return res.status(400).json({ error: 'Invalid content ID.' });
      }
    }

    const newNotification = await Notification.create({
      user_id,
      content_id,
      notification_type,
      scheduled_at
    });
    res.status(201).json(newNotification);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create notification.', details: error.message });
  }
};

exports.updateNotification = async (req, res) => {
  try {
    const { content_id, notification_type, scheduled_at, sent_at } = req.body;
    const notification = await Notification.findByPk(req.params.id);
    if (notification) {
      // Optionally, verify that content_id exists in Movie or TVShow if being updated
      if (content_id) {
        const movie = await Movie.findByPk(content_id);
        const tvShow = await TVShow.findByPk(content_id);
        if (!movie && !tvShow) {
          return res.status(400).json({ error: 'Invalid content ID.' });
        }
      }

      await notification.update({
        content_id: content_id || notification.content_id,
        notification_type: notification_type || notification.notification_type,
        scheduled_at: scheduled_at || notification.scheduled_at,
        sent_at: sent_at || notification.sent_at
      });
      res.json(notification);
    } else {
      res.status(404).json({ error: 'Notification not found.' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to update notification.' });
  }
};

exports.deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findByPk(req.params.id);
    if (notification) {
      await notification.destroy();
      res.json({ message: 'Notification deleted successfully.' });
    } else {
      res.status(404).json({ error: 'Notification not found.' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete notification.' });
  }
};
