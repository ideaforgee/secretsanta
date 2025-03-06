const express = require('express');
const router = express.Router();
const secretSantaController = require('../controller/SecretSantaController.js');
const { protect } = require('../middleware/authMiddleware.js');


router.post('/api/game/createGame', protect, secretSantaController.createNewSecretSantaGame);
router.post('/api/game/startGame', protect, secretSantaController.startSecretSantaGame);
router.get('/api/game/gameinfo/:gameId', protect, secretSantaController.getSecretSantaGameInfo);
router.post('/api/game/joinuser', protect, secretSantaController.joinUserToSecretSantaGame);
router.get('/api/game/isActive/:gameId', protect, secretSantaController.getGameActiveStatus);
router.delete('/api/game/endGame/:gameId', protect, secretSantaController.endGame);
router.post('/api/game/exit', protect, secretSantaController.exitSecretSantaGame);
router.post('/api/game/validateGame', protect, secretSantaController.validateIfGameExist);

module.exports = router;