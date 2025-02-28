const authService = require('../service/AuthService');
const response = require('../utils/response.js');
const message = require('../constant/SecretSantaMessages.js');

/**
 * Register a new user.
 *
 * @route POST /api/auth/register
 * @example
 * Request Body:
 * {
 *   "name": "John Doe",
 *   "email": "john.doe@example.com",
 *   "password": "securePassword123"
 * }
 *
 * Response:
 * {
 *   "status": 200,
 *   "message": "User Registered Successfully",
 *   "data": {
 *     "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
 *     "userId": 123
 *   }
 * }
 */
const registerUserForSecretSanta = async (req, res) => {
  const { name, email, password } = req.body;
  const result = await authService.registerUser(name, email, password);
  return response(res, result.status, message.SUCCESS, result.response);
};

/**
 * Log in an existing user.
 *
 * @route POST /api/auth/login
 * @example
 * Request Body:
 * {
 *   "email": "john.doe@example.com",
 *   "password": "securePassword123"
 * }
 *
 * Response:
 * {
 *   "status": 200,
 *   "message": "Login Successfully",
 *   "data": {
 *     "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
 *     "userId": 123
 *   }
 * }
 */
const loginUserForSecretSanta = async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.loginUser(email, password);
  return response(res, result.status, message.SUCCESS, result.response);
};

/**
 * Send verification link in case of Forget Password for an existing user.
 *
 * @route POST /api/auth/forget-password
 * @example
 * Request Body:
 * {
 *   "email": "john.doe@example.com"
 * }
 *
 * Response:
 * {
 *   "status": 200,
 *   "message": "Verification link send Successfully",
 *   "data": {
 *   }
 * }
 */
const forgetPasswodForSecretSanta = async (req, res) => {
  const { email } = req.body;
  const result = await authService.forgetPassword(email);
  return response(res, result.status, message.VERIFICATION_LINK_SENT, result.response);
};

/**
 * Reset password for an existing user.
 *
 * @route POST /api/auth/reset-password
 * @example
 * Request Body:
 * {
 *   "password": "123456"
 * }
 *
 * Response:
 * {
 *   "status": 200,
 *   "message": "Password Reset Successfully",
 *   "data": {
 *   }
 * }
 */
const resetPasswodForSecretSanta = async (req, res) => {
  const { newPassword, userId } = req.body;
  const result = await authService.resetPassword(newPassword, userId);
  return response(res, result.status, message.RESET_PASSWORD_SUCCESS, result.response);
};


module.exports = {
  registerUserForSecretSanta,
  loginUserForSecretSanta,
  forgetPasswodForSecretSanta,
  resetPasswodForSecretSanta
};
