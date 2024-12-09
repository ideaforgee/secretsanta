const express = require('express');
const messageController = require('../controller/messageController');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware.js');

router.post('/api/chat/getMessages', protect, messageController.getMessagesForUserInGame);
router.post('/api/chat/getPendingMessages', protect, messageController.getPendingMessagesForUserInGame);
router.post('/api/chat/markEmailAsNotSent', protect, messageController.markEmailAsNotSent);

module.exports = router;
