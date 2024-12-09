const messageDao = require('../dao/messageDao');
const emailService = require('./EmailService.js');
const commonService = require('../service/CommonService.js')
const httpResponse = require('../HttpResponse.js');
const message = require('../constant/SecretSantaMessages.js');
const WebSocket = require('ws');

/**
 * Retrieves messages for a specific user in a given game.
 *
 * @param {number} userId - The ID of the user requesting the messages.
 * @param {number} gameId - The ID of the game for which messages are retrieved.
 * @returns {object} - An object containing secretSantaMessages and giftNinjaMessages arrays.
 */
const fetchMessagesForUserInGame = async (userId, gameId) => {
    if (!userId || !gameId) {
        return commonService.createResponse(httpResponse.BAD_REQUEST, message.INVALID_CREDENTIALS);
    }

    try {
        const [secretSantaMessages, giftNinjaMessages] = await messageDao.getMessagesByUserAndGame(Number(userId), Number(gameId));

        const formatMessages = (messages) => messages.map((msg) => ({
            from: msg.from,
            content: msg.content,
        }));

        const result = {
            secretSantaMessages: formatMessages(secretSantaMessages),
            giftNinjaMessages: formatMessages(giftNinjaMessages),
        };

        return commonService.createResponse(httpResponse.SUCCESS, result);

    } catch (error) {
        return commonService.createResponse(httpResponse.INTERNAL_SERVER_ERROR, error.message);
    }
};

/**
 * Saves a new message sent by a user for a specific game and chat box type.
 *
 * @param {number} userId - The ID of the user sending the message.
 * @param {number} gameId - The ID of the game where the message will be saved.
 * @param {string} chatBoxType - Type of chat box ('secretSanta' or 'giftNinja').
 * @param {string} messageContent - The content of the message.
 * @returns {void}
 */
const storeSentMessage = async (userId, gameId, chatBoxType, messageContent) => {
    try {
        const user = parseInt(userId, 10);
        const game = parseInt(gameId, 10);

        if (isNaN(user) || isNaN(game)) {
            throw new Error("Invalid userId or gameId.");
        }

        await messageDao.saveSenderMessage(messageContent, user, game, chatBoxType);
    } catch (error) {
        return null;
    }
};

/**
 * Sends a message to a specific user through WebSocket or email if the user is not connected.
 *
 * @param {string} receiverId - The ID of the user receiving the message.
 * @param {object} messageData - The message object to send.
 * @param {Map} connections - A map of WebSocket connections indexed by user IDs.
 * @returns {void}
 */
const dispatchMessageToUser = async (receiverId, messageData, connections) => {
    const webSocket = connections.get(receiverId?.toString());
    if (webSocket && webSocket.readyState === WebSocket.OPEN) {
        webSocket.send(JSON.stringify(messageData));
    } else {
        sendEmailNotificationToUser(receiverId, messageData);
        console.error(`Cannot send message. User ${receiverId} is not connected.`);
    }
};

/**
 * Handles an incoming message from a user, saving it to the database.
 *
 * @param {string} senderId - ID of the user sending the message.
 * @param {object} messageData - The message object from the user.
 * @returns {void}
 */
const processIncomingMessage = async (senderId, messageData) => {
    try {
        storeSentMessage(messageData.userId, messageData.gameId, messageData.chatBoxType, messageData.content);
        console.log(`Message processed from user ${senderId}:`, messageData);
    } catch (error) {
        console.error("Error processing incoming message:", error);
    }
};

/**
 * Retrieves pending messages for a user in a given game.
 *
 * @param {number} userId - The ID of the user requesting the pending messages.
 * @param {number} gameId - The ID of the game for which pending messages are retrieved.
 * @returns {object} - An object indicating if there are pending messages for 'secretSanta' and 'giftNinja' chat boxes.
 */
const getPendingMessagesForUserInGame = async (userId, gameId) => {
    if (!userId || !gameId) {
        return commonService.createResponse(httpResponse.BAD_REQUEST, message.INVALID_CREDENTIALS);
    }

    try {
        const pendingMessages = await messageDao.getPendingMessagesForUserInGame(Number(userId), Number(gameId));

        const result = {
            secretSantaPendingMessages: Boolean(pendingMessages?.secretSantaPendingMessages),
            giftNinjaPendingMessages: Boolean(pendingMessages?.giftNinjaPendingMessages),
        };
        return commonService.createResponse(httpResponse.SUCCESS, result);
    } catch (error) {
        return commonService.createResponse(httpResponse.INTERNAL_SERVER_ERROR, error.message);
    }
};

/**
 * Sends an email notification to a user if a message cannot be delivered via WebSocket.
 *
 * @param {string} receiverId - The ID of the user receiving the email.
 * @param {object} messageData - The message object to send in the email.
 * @returns {void}
 */
const sendEmailNotificationToUser = async (receiverId, messageData) => {
    const reverserChatBoxType = messageData.chatBoxType === 'secretSanta' ? 'giftNinja' : 'secretSanta'
    const emailAlreadySent = await hasEmailAlreadyBeenSent(receiverId, messageData, reverserChatBoxType);
    if (!emailAlreadySent) {
        const targetUser = await messageDao.getUserById(receiverId);
        await emailService.sendSecretSantaSentMessageEmail(targetUser, reverserChatBoxType);
        messageDao.upsertUserEmailStatusForGame(receiverId, messageData.gameId, reverserChatBoxType);
    }
};

/**
 * Checks if an email notification has already been sent to a user.
 *
 * @param {string} receiverId - The ID of the user receiving the email.
 * @param {object} messageData - The message object associated with the email.
 * @returns {boolean} - Returns true if an email has been sent, false otherwise.
 */
const hasEmailAlreadyBeenSent = async (receiverId, messageData, chatBoxType) => {
    const result = await messageDao.isEmailAlreadySent(receiverId, messageData.gameId, chatBoxType);
    return result.isEmailAlreadySent === 1 ? true : false;
};

/**
 * Marks an email as not sent for a specific user, game, and chat box type.
 *
 * @param {string} userId - The ID of the user.
 * @param {number} gameId - The ID of the game.
 * @param {string} chatBoxType - The type of chat box ('secretSanta' or 'giftNinja').
 * @returns {void}
 */
const markEmailAsNotSent = async (userId, gameId, chatBoxType) => {
    if (!userId || !gameId || !chatBoxType) {
        return commonService.createResponse(httpResponse.BAD_REQUEST, message.INVALID_CREDENTIALS);
    }

    await messageDao.markEmailAsNotSent(userId, gameId, chatBoxType);
    return commonService.createResponse(httpResponse.SUCCESS, message.EMAIL_MARKED_NOT_SENT);
};


module.exports = {
    fetchMessagesForUserInGame,
    dispatchMessageToUser,
    processIncomingMessage,
    getPendingMessagesForUserInGame,
    markEmailAsNotSent
};
