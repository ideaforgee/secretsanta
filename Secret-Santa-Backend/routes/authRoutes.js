const express = require('express');
const authController = require('../controller/authController');
const router = express.Router();

router.post('/api/auth/register', authController.registerUserForSecretSanta);
router.post('/api/auth/login', authController.loginUserForSecretSanta);
router.post('/api/auth/forgetPassword', authController.forgetPasswodForSecretSanta);
router.post('/api/auth/resetPassword', authController.resetPasswodForSecretSanta);

module.exports = router;