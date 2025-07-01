const userDao = require('../dao/UserDao.js');
const httpResponse = require('../HttpResponse.js');
const messages = require('../constant/SecretSantaMessages');
const commonService = require('../service/CommonService');
const mailService = require('./EmailService.js');

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
    const isUserInGroup = userDao.checkUserInGroup(userId);

    return commonService.createResponse(httpResponse.SUCCESS, { userId, token, isUserInGroup });
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
    const isUserInGroup = await userDao.checkUserInGroup(user.id);
    return commonService.createResponse(httpResponse.SUCCESS, { userId: user.id, token, userName: user.name, isUserInGroup: isUserInGroup });
  } catch (error) {
    return commonService.createResponse(httpResponse.INTERNAL_SERVER_ERROR, messages.SERVER_ERROR);
  }
};

/**
 * Send link to rest Password.
 * @param {string} email - User's email.
 * @returns {Promise<object>} - Response object with Email or an error message.
 */
const forgetPassword = async (email) => {
  try {
    const user = await userDao.getUserByEmail(email);
    if (!user) {
      return commonService.createResponse(httpResponse.BAD_REQUEST, messages.NO_USER_EXISTS);
    }

    const token = commonService.generateTokenToResetPassword(user.id);

    mailService.sendRestPasswordEmail(email, token);
    return commonService.createResponse(httpResponse.SUCCESS, { email });
  } catch (error) {
    return commonService.createResponse(httpResponse.INTERNAL_SERVER_ERROR, messages.SERVER_ERROR);
  }
};

/**
 * Rest Password of the user.
 * @param {string} newPassword - User's new Password.
 * @param {string} userId - User's id
 * @returns {Promise<object>} - Response object with Email or an error message.
 */
const resetPassword = async (newPassword, userId) => {
  try {
    const user = await userDao.getUserDetailsById(userId);
    if (!user) {
      return commonService.createResponse(httpResponse.BAD_REQUEST, messages.NO_USER_EXISTS);
    }

    const result = await userDao.updateUserPassword(newPassword, userId);
    return commonService.createResponse(httpResponse.SUCCESS, { result });
  } catch (error) {
    return commonService.createResponse(httpResponse.INTERNAL_SERVER_ERROR, messages.SERVER_ERROR);
  }
};




module.exports = { registerUser, loginUser, forgetPassword, resetPassword };
