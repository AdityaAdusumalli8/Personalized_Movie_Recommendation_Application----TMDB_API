// routes/notifications.js

const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');

// GET /api/notifications - Get all notifications
router.get('/', notificationController.getAllNotifications);

// GET /api/notifications/:id - Get a notification by ID
router.get('/:id', notificationController.getNotificationById);

// POST /api/notifications - Create a new notification
router.post('/', notificationController.createNotification);

// PUT /api/notifications/:id - Update a notification by ID
router.put('/:id', notificationController.updateNotification);
router.post('/send-notification-email', async (req, res) => {
    const { notification_id } = req.body;
  
    try {
      const notification = await Notification.findByPk(notification_id, {
        include: [{ model: User, as: 'user' }],
      });
  
      if (!notification) {
        return res.status(404).json({ error: 'Notification not found.' });
      }
  
      const userEmail = notification.user.email;
  
      // Simulate email sending (replace this with an actual email service)
      console.log(`Sending email to ${userEmail} about notification ID: ${notification_id}`);
  
      res.json({ message: `Email sent to ${userEmail}` });
    } catch (error) {
      console.error('Error sending email notification:', error);
      res.status(500).json({ error: 'Failed to send email notification.' });
    }
  });
  

// DELETE /api/notifications/:id - Delete a notification by ID
router.delete('/:id', notificationController.deleteNotification);

module.exports = router;
