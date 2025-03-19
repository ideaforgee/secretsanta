const response = require('../utils/response.js');
const tambolaService = require('../service/TambolaService.js');
const message = require('../constant/SecretSantaMessages.js');

/**
 * Creates a new Tambola game for a specific user.
 *
 * @param {Object} req - The request object containing the user's ID in the body.
 * @param {Object} res - The response object to send the response.
 * @returns {Object} The response object with the result of the game creation.
 */
const createNewTambolaGame = async (req, res) => {
    const { userId } = req.body;
    const result = await tambolaService.createNewTambolaGame(userId);
    return response(res, result.status, message.SUCCESS, result.response);
};

/**
 * Adds a user to a Tambola game using a provided game code.
 *
 * @param {Object} req - The request object containing the user's ID and game code in the body.
 * @param {Object} res - The response object to send the response.
 * @returns {Object} The response object with the result of joining the game.
 */
const joinUserToTambolaGame = async (req, res) => {
    const { userId, gameCode } = req.body;
    const result = await tambolaService.joinUserToTambolaGame(userId, gameCode);
    return response(res, result.status, message.SUCCESS, result.response);
};

/**
 * Generates tickets for a specific Tambola game.
 *
 * @param {Object} req - The request object containing the Tambola game ID in the body.
 * @param {Object} res - The response object to send the response.
 * @returns {Object} The response object with the result of generating tickets.
 */
const generateTicketsForTambolaGame = async (req, res) => {
    const { tambolaGameId } = req.body;
    const result = await tambolaService.generateTicketsForTambolaGame(tambolaGameId);
    return response(res, result.status, message.SUCCESS, result.response);
};

/**
 * Retrieves the details of a specific Tambola game.
 *
 * @param {Object} req - The request object containing the user's ID and Tambola game ID in the body.
 * @param {Object} res - The response object to send the response.
 * @returns {Object} The response object with the game details.
 */
const getTambolaGameDetails = async (req, res) => {
    const { userId, tambolaGameId } = req.body;
    const result = await tambolaService.getTambolaGameDetails(userId, tambolaGameId);
    return response(res, result.status, message.SUCCESS, result.response);
};

/**
 * Retrieves the list of users and their scores for a specific Tambola game.
 *
 * @param {Object} req - The request object containing the Tambola game ID in the body.
 * @param {Object} res - The response object to send the response.
 * @returns {Object} The response object with the users and their scores.
 */
const gatGameUsersWithScore = async (req, res) => {
    const { tambolaGameId } = req.body;
    const result = await tambolaService.gatGameUsersWithScore(tambolaGameId);
    return response(res, result.status, message.SUCCESS, result.response);
};

module.exports = {
    createNewTambolaGame,
    joinUserToTambolaGame,
    generateTicketsForTambolaGame,
    getTambolaGameDetails,
    gatGameUsersWithScore
};
