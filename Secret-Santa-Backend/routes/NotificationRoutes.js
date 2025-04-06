const express = require('express');
const router = express.Router();
const notificationController = require('../controller/NotificationController');
const { protect } = require('../middleware/authMiddleware');

router.post('/api/send-notification', notificationController.sendNotificationHandler);
router.post('/api/subscribe', protect, notificationController.subscribe);
router.post('/api/validateSubscription', protect, notificationController.validateSubscription);

module.exports = router;