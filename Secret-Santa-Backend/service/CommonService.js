const jwt = require('jsonwebtoken');
const messages = require('../constant/SecretSantaMessages');

/**
 * Generate a JWT for a user.
 * @param {number} userId - User's ID.
 * @returns {string} - Signed JWT.
 */
const generateToken = (userId) => {
    try {
        return jwt.sign({ id: userId }, process.env.JWT_SECRET);
    } catch (error) {
        throw new Error(messages.TOKEN_GENERATION_FAILED);
    }
};

/**
 * Prepare a standardized response object.
 * @param {number} status - HTTP status code.
 * @param {string|object} response - Message or result data.
 * @returns {object} - Standardized response.
 */
const createResponse = (status, response) => ({ status, response });

module.exports = { generateToken, createResponse };