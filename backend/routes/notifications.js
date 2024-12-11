const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');


router.get('/', notificationController.getAllNotifications);


router.get('/:id', notificationController.getNotificationById);


router.post('/', notificationController.createNotification);


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
  
      console.log(`Sending email to ${userEmail} about notification ID: ${notification_id}`);
  
      res.json({ message: `Email sent to ${userEmail}` });
    } catch (error) {
      console.error('Error sending email notification:', error);
      res.status(500).json({ error: 'Failed to send email notification.' });
    }
  });
  

router.delete('/:id', notificationController.deleteNotification);

module.exports = router;
