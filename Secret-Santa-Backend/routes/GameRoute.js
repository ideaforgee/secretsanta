const express = require('express');
const router = express.Router();
const gameController = require('../controller/GameController.js');
const { protect } = require('../middleware/authMiddleware.js');


router.post('/api/game/createGame', protect, gameController.createNewSecretSantaGame);
router.post('/api/game/startGame', protect, gameController.startSecretSantaGame);
router.get('/api/game/gameinfo/:gameId', protect, gameController.getSecretSantaGameInfo);
router.post('/api/game/joinuser', protect, gameController.joinUserToSecretSantaGame);
router.get('/api/game/isActive/:gameId', protect, gameController.getGameActiveStatus);
router.delete('/api/game/endGame/:gameId', protect, gameController.endGame);
router.post('/api/game/exit', protect, gameController.exitSecretSantaGame);
router.post('/api/game/validateGame', protect, gameController.validateIfGameExist);

module.exports = router;