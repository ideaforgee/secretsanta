const express = require('express');
const router = express.Router();
const tambolaGameController = require('../controller/TambolaGameController.js')
const { protect } = require('../middleware/authMiddleware.js');

router.post('/api/game/createNewTambolaGame', protect, tambolaGameController.createNewTambolaGame);
router.post('/api/game/joinUserToTambolaGame', protect, tambolaGameController.joinUserToTambolaGame);
router.post('/api/game/generateTicketsForTambolaGame', protect, tambolaGameController.generateTicketsForTambolaGame);

module.exports = router;