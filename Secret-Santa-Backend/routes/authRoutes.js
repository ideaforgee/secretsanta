const express = require('express');
const authController = require('../controller/authController');
const router = express.Router();

router.post('/api/auth/register', authController.registerUserForSecretSanta);
router.post('/api/auth/login', authController.loginUserForSecretSanta);

module.exports = router;