const express = require('express');
const router = express.Router();
const masterMindGameController = require('../controller/MasterMindGameController.js');
const { protect } = require('../middleware/authMiddleware.js');

router.post('/api/game/createNewMasterMindGame', protect, masterMindGameController.createNewMasterMindGame);
router.post('/api/game/getUserMasterGameInfo', protect, masterMindGameController.getUserMasterGameInfo);
router.post('/api/game/validateUserMasterMindLevel', protect, masterMindGameController.validateUserMasterMindLevel);
router.post('/api/game/getRealPatternForMasterMindGame', protect, masterMindGameController.getRealPatternForMasterMindGame);
router.post('/api/game/setIsCompleteTrue', protect, masterMindGameController.setIsCompleteTrue);

module.exports = router;