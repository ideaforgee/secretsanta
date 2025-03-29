const express = require('express');
const router = express.Router();
const notificationController = require('../controller/NotificationController');
const { protect } = require('../middleware/authMiddleware');

router.post('/api/send-notification', notificationController.sendNotificationHandler);
router.post('/api/subscribe', protect, notificationController.subscribe);

module.exports = router;