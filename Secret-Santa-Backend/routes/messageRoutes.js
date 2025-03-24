const express = require('express');
const messageController = require('../controller/messageController');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware.js');

router.post('/api/chat/getMessages', protect, messageController.getMessagesForUserInGame);
router.post('/api/chat/getPendingMessages', protect, messageController.getPendingMessagesForUserInGame);
router.post('/api/chat/markEmailAsNotSent', protect, messageController.markEmailAsNotSent);
router.post('/api/chat/fetchGroupDiscussionMessages', protect, messageController.fetchGroupDiscussionMessages);
router.post('/api/chat/fetchGroupDiscussionPendingMessages', protect, messageController.fetchGroupDiscussionPendingMessages);

module.exports = router;
