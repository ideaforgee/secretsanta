const express = require("express");
const router = express.Router();
const groupController = require('../controller/GroupController.js');
const { protect } = require('../middleware/authMiddleware.js');

router.post('/api/group/createGroup', protect, groupController.createGroup);
router.post('/api/group/gameAssist', protect, groupController.joinGroup);
router.get('/api/group/getGroupMembersInfo/:groupId', protect, groupController.getGroupMembersInfo);
router.post('/api/group/announceGame', protect, groupController.announceGame);

module.exports = router;