const httpResponse = require('../HttpResponse.js');
const tambolaDao = require('../dao/TambolaDao.js');
const userDao = require('../dao/UserDao.js');
const secretSantaService = require('../service/SecretSantaService');
const commonService = require('../service/CommonService');
const messages = require('../constant/SecretSantaMessages.js');
const emailService = require('./EmailService.js');
const notificationPushService = require('./NotificationPushService.js');
const WebSocket = require('ws');

/**
 * Creates a new Tambola game and saves it to the database.
 *
 * @param {number} userId - The ID of the user creating the game.
 * @returns {Object} The response indicating the result of the game creation.
 */
const createNewTambolaGame = async (userId) => {
    try {
        const user = await userDao.getUserDetailsById(Number(userId));
        const tambolaGameCode = secretSantaService.generateUniqueGameCode(user.name);

        const tambolaGameId = await tambolaDao.saveNewTambolaGame(userId, tambolaGameCode);

        notificationPushService.sendPushNotifications(Number(userId), messages.CREATED_GAME_SUCCESSFULLY, `Here is your tambola game Code ${tambolaGameCode}`);

        await emailService.sendCreatedSecretSantaGameEmail(user, tambolaGameCode);

        return commonService.createResponse(httpResponse.SUCCESS, { tambolaGameId, gameCode: tambolaGameCode });
    }
    catch (error) {
        return commonService.createResponse(httpResponse.INTERNAL_SERVER_ERROR, error.message);
    }
};

/**
 * Adds a user to an existing Tambola game.
 *
 * @param {number} userId - The ID of the user to be added to the game.
 * @param {string} gameCode - The unique code of the game.
 * @returns {Object} The response indicating the result of joining the game.
 */
const joinUserToTambolaGame = async (userId, gameCode) => {
    if (!userId || !gameCode) {
        return commonService.createResponse(httpResponse.BAD_REQUEST, messages.INVALID_CREDENTIALS);
    }

    try {
        const result = await tambolaDao.joinUserToTambolaGame(Number(userId), gameCode);
        return result
            ? commonService.createResponse(httpResponse.SUCCESS, result)
            : commonService.createResponse(httpResponse.BAD_REQUEST, messages.INVALID_GAME_CODE);
    } catch (error) {
        return commonService.createResponse(httpResponse.INTERNAL_SERVER_ERROR, error.message);
    }
};

/**
 * Generates tickets for all users in the given Tambola game.
 *
 * @param {number} tambolaGameId - The ID of the Tambola game.
 * @returns {Object} The response indicating the result of generating tickets.
 */
const generateTicketsForTambolaGame = async (tambolaGameId) => {
    if (!tambolaGameId) {
        return commonService.createResponse(httpResponse.BAD_REQUEST, messages.INVALID_CREDENTIALS);
    }
    try {
        const users = await tambolaDao.getUsersForTambolaGame(tambolaGameId);

        if (!users?.length) {
            return commonService.createResponse(httpResponse.BAD_REQUEST, messages.USERS_COUNT_INVALID);
        }

        const chunkSize = 15; // Process in batches of 15
        for (let i = 0; i < users.length; i += chunkSize) {
            const batch = users.slice(i, i + chunkSize);

            await Promise.allSettled(batch.map(user => {
                const ticket = generateTambolaTicket();
                return tambolaDao.saveUserTicketForTambolaGame(ticket, user.userId, tambolaGameId);
            }));
        }

        await tambolaDao.updateTambolaGameStatus(tambolaGameId, 'Active');

        return commonService.createResponse(httpResponse.SUCCESS, messages.SUCCESSFULLY_STARTED);

    } catch (error) {
        return commonService.createResponse(httpResponse.INTERNAL_SERVER_ERROR, error.message);
    }
};

/**
 * Generates a Tambola ticket for a user.
 *
 * @returns {Array} A 2D array representing the generated ticket.
 */
function generateTambolaTicket() {
    const ticket = Array.from({ length: 3 }, () => Array(9).fill(null));

    for (let col = 0; col < 9; col++) {
        let start = col * 10 + 1;
        let end = col === 8 ? 90 : (col + 1) * 10;
        let numbers = shuffle([...Array(end - start + 1).keys()].map(n => n + start)).slice(0, 3);

        numbers.sort((a, b) => a - b);

        for (let row = 0; row < 3; row++) {
            ticket[row][col] = numbers[row];
        }
    }

    for (let row = 0; row < 3; row++) {
        let filledCols = ticket[row].map((val, idx) => (val !== null ? idx : null)).filter(idx => idx !== null);
        let excess = filledCols.length - 5;

        while (excess > 0) {
            let removeIdx = filledCols.splice(Math.floor(Math.random() * filledCols.length), 1)[0];
            ticket[row][removeIdx] = null;
            excess--;
        }
    }

    return ticket;
}

/**
 * Helper function to shuffle an array.
 *
 * @param {Array} array - The array to be shuffled.
 * @returns {Array} The shuffled array.
 */
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

/**
 * Retrieves all the marked claims in the Tambola game.
 *
 * @param {Object} tambolaGameDetails - The details of the Tambola game.
 * @returns {Array} An array of marked claims.
 */
const getAllMarkedClaims = (tambolaGameDetails) => {
    const { topLine, middleLine, bottomLine, earlyFive, fullHouse } = tambolaGameDetails;
    return Object.entries({ topLine, middleLine, bottomLine, earlyFive, fullHouse })
        .filter(([_, value]) => value !== null)
        .map(([key]) =>
            key.replace(/([A-Z])/g, ' $1')
                .trim()
                .replace(/\b\w/g, (char) => char.toUpperCase())
        );
};

/**
 * Retrieves the details of a Tambola game for a specific user.
 *
 * @param {number} userId - The ID of the user.
 * @param {number} tambolaGameId - The ID of the Tambola game.
 * @returns {Object} The response containing the game details.
 */
const getTambolaGameDetails = async (userId, tambolaGameId) => {
    try {
        const result = await tambolaDao.getTambolaGameDetails(userId, tambolaGameId);

        const allMarkedClaims = getAllMarkedClaims(result[0]);

        const response = {
            hostId: result[0]?.hostId,
            withdrawnNumbers: JSON.parse(result[0]?.withdrawnNumbers) ?? [],
            ticketNumbers: result[0]?.ticketNumbers ? JSON.parse(result[0].ticketNumbers) : [[], [], []],
            markedNumbers: JSON.parse(result[0]?.markedNumbers) ?? [],
            status: result[0]?.status,
            markedClaims: allMarkedClaims
        };

        return commonService.createResponse(httpResponse.SUCCESS, response);
    } catch (error) {
        return commonService.createResponse(httpResponse.INTERNAL_SERVER_ERROR, error.message);
    }
};

/**
 * Sends the current number to all users in a Tambola game.
 *
 * @param {number} userId - The ID of the user who triggered the action.
 * @param {number} tambolaGameId - The ID of the Tambola game.
 * @param {number} currentNumber - The current number being called.
 * @param {Array} withDrawnNumbers - The list of withdrawn numbers.
 * @param {Map} connections - A map of active WebSocket connections.
 * @returns {Object} The response indicating the result of sending the current number.
 */
const sendCurrentNumberToAllUser = async (userId, tambolaGameId, currentNumber, withDrawnNumbers, connections) => {
    try {
        const users = await tambolaDao.getUsersForTambolaGame(tambolaGameId);
        const messageData = {
            type: 'withDrawnNumbers',
            withDrawnNumbers: withDrawnNumbers,
            message: currentNumber
        }

        for (let user of users) {
            const webSocket = connections.get(user.userId?.toString());
            if (user.userId !== Number(userId) && webSocket && webSocket.readyState === WebSocket.OPEN) {
                webSocket.send(JSON.stringify(messageData));
            }
        }

        return commonService.createResponse(httpResponse.SUCCESS, messages.SUCCESSFULLY_STARTED)

    } catch (error) {
        return commonService.createResponse(httpResponse.INTERNAL_SERVER_ERROR, error.message);
    }
};

/**
 * Verifies a claim made by a user in a Tambola game.
 *
 * @param {Object} messageData - The data to be sent in the notification message.
 * @param {number} userId - The ID of the user making the claim.
 * @param {Map} connections - A map of active WebSocket connections.
 */
const verifyTambolaGameClaim = async (messageData, userId, connections) => {
    try {
        const userData = await getUserData(userId, messageData.tambolaGameId);
        const [gameData] = await tambolaDao.gatTambolaGameData(messageData.tambolaGameId);

        let { ticketNumbers, markedNumbers } = userData;
        let withdrawnNumbers = JSON.parse(gameData.withdrawnNumbers) ?? [];

        let isValidClaim = await validateClaim(messageData.claimType, ticketNumbers, markedNumbers, withdrawnNumbers);

        messageData.isValidClaim = isValidClaim;

        if (!isValidClaim) {
            await handleInvalidClaim(userId, messageData, connections);
        } else {
            await handleValidClaim(messageData, connections, userId);
        }

    } catch (err) {
        console.error(err);
    }
};

/**
 * Helper function to validate a claim based on its type.
 *
 * @param {string} claimType - The type of claim (e.g., 'Top Line', 'Full House').
 * @param {Array} ticketNumbers - The ticket numbers of the user.
 * @param {Array} markedNumbers - The marked numbers of the user.
 * @param {Array} withdrawnNumbers - The withdrawn numbers in the game.
 * @returns {boolean} Whether the claim is valid.
 */
const validateClaim = async (claimType, ticketNumbers, markedNumbers, withdrawnNumbers) => {
    const isLineMarked = (line) => line.every(num => num === null || (withdrawnNumbers.includes(num) && markedNumbers.includes(num)));
    let isValidClaim = false;

    switch (claimType) {
        case 'Top Line':
            isValidClaim = isLineMarked(ticketNumbers[0]);
            break;
        case 'Middle Line':
            isValidClaim = isLineMarked(ticketNumbers[1]);
            break;
        case 'Bottom Line':
            isValidClaim = isLineMarked(ticketNumbers[2]);
            break;
        case 'Early Five':
            const markedCount = markedNumbers?.filter(num => withdrawnNumbers.includes(num)).length;
            isValidClaim = markedCount >= 5;
            break;
        case 'Full House':
            isValidClaim = ticketNumbers.flat().every(num => num === null || (withdrawnNumbers.includes(num) && markedNumbers.includes(num)));
            break;
        default:
            break;
    }
    return isValidClaim;
};

/**
 * Fetches user data for a specific Tambola game.
 *
 * @param {number} userId - The ID of the user.
 * @param {number} tambolaGameId - The ID of the Tambola game.
 * @returns {Object} The ticket numbers and marked numbers of the user.
 */
const getUserData = async (userId, tambolaGameId) => {
    const userData = await tambolaDao.gatUserDataForTambolaGame(userId, tambolaGameId);
    let { ticketNumbers, markedNumbers } = userData[0];
    ticketNumbers = JSON.parse(ticketNumbers) ?? [];
    markedNumbers = JSON.parse(markedNumbers) ?? [];
    return { ticketNumbers, markedNumbers };
};

/**
 * Handles the case when a claim is invalid by notifying the user and updating their score.
 *
 * @param {number} userId - The ID of the user making the claim.
 * @param {Object} messageData - The data to be sent in the notification message.
 * @param {Map} connections - A map of active WebSocket connections indexed by user IDs.
 */
const handleInvalidClaim = async (userId, messageData, connections) => {
    const webSocket = connections.get(userId?.toString());
    if (webSocket && webSocket.readyState === WebSocket.OPEN) {
        messageData.message = `Your claim for ${messageData.claimType} is false. Your current score has been reduced by 5.`;
        webSocket.send(JSON.stringify(messageData));
        await tambolaDao.updateUserTambolaScore(userId, messageData.tambolaGameId, -5);
    }
};

/**
 * Handles the case when a claim is valid by notifying users, updating the game status,
 * and adjusting the user's score based on the claim type.
 *
 * @param {Object} messageData - The data to be sent in the notification message.
 * @param {Map} connections - A map of active WebSocket connections indexed by user IDs.
 * @param {number} userId - The ID of the user making the claim.
 */
const handleValidClaim = async (messageData, connections, userId) => {
    const claimType = messageData.claimType;
    const tambolaGameId = messageData.tambolaGameId;
    const users = await tambolaDao.getUsersForTambolaGame(tambolaGameId);
    const claims = await tambolaDao.getAllClaimsForTambolaGame(tambolaGameId);
    const markedClaims = claims?.id ? getAllMarkedClaims(claims) : [];

    messageData.markedClaims = [...markedClaims, claimType];
    messageData.isComplete = messageData.markedClaims?.length === 5;

    await sendClaimNotificationsInChunks(users, claimType, messageData, connections);

    await tambolaDao.updateTambolaGameClaims(tambolaGameId, userId, claimType.replaceAll(' ', ''));
    if (messageData.isComplete) {
        await tambolaDao.updateTambolaGameStatus(tambolaGameId, 'Complete');
    }

    const scoreChange = claimType === 'Full House' ? 50 : 30;
    await tambolaDao.updateUserTambolaScore(userId, tambolaGameId, scoreChange);
};

/**
 * Sends claim notifications in chunks to users to avoid overloading the WebSocket connection.
 *
 * @param {Array} users - The list of users to send notifications to.
 * @param {string} claimType - The type of claim being made.
 * @param {Object} messageData - The data to be sent in the notification message.
 * @param {Map} connections - A map of active WebSocket connections indexed by user IDs.
 * @param {number} [chunkSize=20] - The size of each chunk of users to be processed.
 */
const sendClaimNotificationsInChunks = async (users, claimType, messageData, connections, chunkSize = 20) => {
    const chunkedUsers = chunkArray(users, chunkSize);

    for (let chunk of chunkedUsers) {
        await Promise.all(chunk.map(user => sendClaimNotification(user, claimType, messageData, connections)));
    }
};

/**
 * Splits an array into smaller chunks of a specified size.
 *
 * @param {Array} array - The array to be chunked.
 * @param {number} chunkSize - The size of each chunk.
 * @returns {Array} An array of chunks.
 */
const chunkArray = (array, chunkSize) => {
    const chunks = [];
    for (let i = 0; i < array.length; i += chunkSize) {
        chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
};

/**
 * Sends a claim notification to a single user.
 *
 * @param {Object} user - The user object containing user details.
 * @param {string} claimType - The type of claim being made.
 * @param {Object} messageData - The data to be sent in the notification message.
 * @param {Map} connections - A map of active WebSocket connections indexed by user IDs.
 * @returns {Promise} A promise that resolves when the message has been sent.
 */
const sendClaimNotification = (user, claimType, messageData, connections) => {
    return new Promise((resolve, reject) => {
        const webSocket = connections.get(user.userId?.toString());
        if (webSocket && webSocket.readyState === WebSocket.OPEN) {
            messageData.message = `${messageData.claimedBy} has successfully claimed ${claimType}.`;
            messageData.claimType = claimType;
            webSocket.send(JSON.stringify(messageData), (err) => {
                if (err) reject(err);
                else resolve();
            });
        } else {
            resolve();
        }
    });
};

/**
 * Retrieves users with their scores for a specific Tambola game.
 *
 * @param {number} tambolaGameId - The ID of the Tambola game.
 * @returns {Object} A response containing the list of users and their scores.
 */
const gatGameUsersWithScore = async (tambolaGameId) => {
    try {
        const result = await tambolaDao.gatGameUsersWithScore(Number(tambolaGameId));
        return commonService.createResponse(httpResponse.SUCCESS, result);
    } catch (error) {
        return commonService.createResponse(httpResponse.INTERNAL_SERVER_ERROR, error.message);
    }
};

module.exports = {
    createNewTambolaGame,
    joinUserToTambolaGame,
    generateTicketsForTambolaGame,
    getTambolaGameDetails,
    sendCurrentNumberToAllUser,
    verifyTambolaGameClaim,
    gatGameUsersWithScore
}