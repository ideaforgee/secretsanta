const response = require('../utils/response.js');
const tambolaService = require('../service/TambolaService.js');
const message = require('../constant/SecretSantaMessages.js');

const createNewTambolaGame = async (req, res) => {
    const { userId } = req.body;
    const result = await tambolaService.createNewTambolaGame(userId);
    return response(res, result.status, message.SUCCESS, result.response);
};

const joinUserToTambolaGame = async (req, res) => {
    const { userId, gameCode } = req.body;
    const result = await tambolaService.joinUserToTambolaGame(userId, gameCode);
    return response(res, result.status, message.SUCCESS, result.response);
};

const generateTicketsForTambolaGame = async (req, res) => {
    const { tambolaGameId } = req.body;
    const result = await tambolaService.generateTicketsForTambolaGame(tambolaGameId);
    return response(res, result.status, message.SUCCESS, result.response);
};

const getTambolaGameDetails = async (req, res) => {
    const { userId, tambolaGameId } = req.body;
    const result = await tambolaService.getTambolaGameDetails(userId, tambolaGameId);
    return response(res, result.status, message.SUCCESS, result.response);
};

module.exports = {
    createNewTambolaGame,
    joinUserToTambolaGame,
    generateTicketsForTambolaGame,
    getTambolaGameDetails
};