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

// DELETE /api/notifications/:id - Delete a notification by ID
router.delete('/:id', notificationController.deleteNotification);

module.exports = router;
