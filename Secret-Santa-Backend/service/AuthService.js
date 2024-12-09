const userDao = require('../dao/UserDao.js');
const httpResponse = require('../HttpResponse.js');
const messages = require('../constant/SecretSantaMessages');
const commonService = require('../service/CommonService');

/**
 * Register a new user.
 * @param {string} name - User's name.
 * @param {string} email - User's email.
 * @param {string} password - User's password.
 * @returns {Promise<object>} - Response object with token and user ID or an error message.
 */
const registerUser = async (name, email, password) => {
  try {
    const existingUser = await userDao.getUserByEmail(email);
    if (existingUser) {
      return commonService.createResponse(httpResponse.BAD_REQUEST, messages.EMAIL_ALREADY_USED);
    }

    const userId = await userDao.registerUser(name, email, password);
    const token = commonService.generateToken(userId);

    return commonService.createResponse(httpResponse.SUCCESS, { userId, token });
  } catch (error) {
    return commonService.createResponse(httpResponse.INTERNAL_SERVER_ERROR, messages.SERVER_ERROR);
  }
};

/**
 * Log in an existing user.
 * @param {string} email - User's email.
 * @param {string} password - User's password.
 * @returns {Promise<object>} - Response object with token and user ID or an error message.
 */
const loginUser = async (email, password) => {
  try {
    const user = await userDao.getUserByEmail(email);
    if (!user || !(await userDao.verifyPassword(password, user.password))) {
      return commonService.createResponse(httpResponse.BAD_REQUEST, messages.INVALID_CREDENTIALS);
    }

    const token = commonService.generateToken(user.id);
    return commonService.createResponse(httpResponse.SUCCESS, { userId: user.id, token });
  } catch (error) {
    return commonService.createResponse(httpResponse.INTERNAL_SERVER_ERROR, messages.SERVER_ERROR);
  }
};

module.exports = { registerUser, loginUser };
