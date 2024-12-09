const messageService = require('../service/MessageService');
const response = require('../utils/response.js');
const message = require('../constant/SecretSantaMessages');

/**
 * Retrieve all messages for a specific user and game.
 *
 * @route POST /api/chat/getMessages
 * @example
 * Request Body:
 * {
 *   "userId": 123,
 *   "gameId": 456
 * }
 *
 * Response:
 * [
 *   {
 *     "messageId": 1,
 *     "userId": 123,
 *     "gameId": 456,
 *     "content": "Hello!",
 *     "timestamp": "2024-11-24T10:00:00Z"
 *   },
 *   ...
 * ]
 */
const getMessagesForUserInGame = async (req, res) => {
    const { userId, gameId } = req.body;
    const result = await messageService.fetchMessagesForUserInGame(userId, gameId);
    response(res, result.status, message.SUCCESS, result.response);
};

/**
 * Retrieve pending messages for a specific user and game.
 *
 * @route POST /api/chat/getPendingMessages
 * @example
 * Request Body:
 * {
 *   "userId": 123,
 *   "gameId": 456
 * }
 *
 * Response:
 * [
 *   {
 *     "messageId": 1,
 *     "userId": 123,
 *     "gameId": 456,
 *     "content": "You have pending messages.",
 *     "timestamp": "2024-11-24T10:15:00Z"
 *   },
 *   ...
 * ]
 */
const getPendingMessagesForUserInGame = async (req, res) => {
    const { userId, gameId } = req.body;
    const result = await messageService.getPendingMessagesForUserInGame(userId, gameId);
    response(res, result.status, message.SUCCESS, result.response);
};

/**
 * Mark email notifications as unsent for a specific user, game, and chat type.
 *
 * @route POST /api/chat/markEmailAsUnsent
 * @example
 * Request Body:
 * {
 *   "userId": 123,
 *   "gameId": 456,
 *   "chatBoxType": "support"
 * }
 *
 * Response:
 * {
 *   "success": true,
 *   "message": "Email marked as unsent."
 * }
 */
const markEmailAsNotSent = async (req, res) => {
    const { userId, gameId, chatBoxType } = req.body;
    const result = await messageService.markEmailAsNotSent(userId, gameId, chatBoxType);
    return response(res, result.status, message.SUCCESS, result.response);
};

module.exports = {
    getMessagesForUserInGame,
    getPendingMessagesForUserInGame,
    markEmailAsNotSent
};
