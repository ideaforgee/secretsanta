const httpResponse = require('../HttpResponse.js');
const tambolaDao = require('../dao/TambolaDao.js');
const userDao = require('../dao/UserDao.js');
const secretSantaService = require('../service/SecretSantaService');
const commonService = require('../service/CommonService');
const messages = require('../constant/SecretSantaMessages.js');
const emailService = require('./EmailService.js');
const WebSocket = require('ws');

const createNewTambolaGame = async (userId) => {
    try {
        const user = await userDao.getUserDetailsById(Number(userId));
        const gameCode = secretSantaService.generateUniqueGameCode(user.name);

        await tambolaDao.saveNewTambolaGame(userId, gameCode);
        //await emailService.sendCreatedSecretSantaGameEmail(user, gameCode);

        return commonService.createResponse(httpResponse.SUCCESS, gameCode);
    }
    catch (error) {
        return commonService.createResponse(httpResponse.INTERNAL_SERVER_ERROR, error.message);
    }
};

/**
 * Adds a user to a Secret Santa game.
 *
 * @param {number} userId - The ID of the user to be added to the game.
 * @param {string} gameCode - The unique code of the game.
 * @returns {Object} The response indicating the result of joining the game.
 *
 * @throws {Error} Throws an error if the user could not join the game.
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

const generateTicketsForTambolaGame = async (tambolaGameId) => {
    if (!tambolaGameId) {
        return commonService.createResponse(httpResponse.BAD_REQUEST, messages.INVALID_CREDENTIALS);
    }
    try {
        const users = await tambolaDao.getUsersForTambolaGame(tambolaGameId);

        if (users?.length) {
            commonService.createResponse(httpResponse.BAD_REQUEST, messages.USERS_COUNT_INVALID);
        }

        for (let user of users) {
            const ticket = generateTambolaTicket();
            await tambolaDao.saveUserTicketForTambolaGame(ticket, user.userId, tambolaGameId);
        }

        return commonService.createResponse(httpResponse.SUCCESS, messages.SUCCESSFULLY_STARTED)

    } catch (error) {
        return commonService.createResponse(httpResponse.INTERNAL_SERVER_ERROR, error.message);
    }
};


function generateTambolaTicket() {
    const ticket = Array.from({ length: 3 }, () => Array(9).fill(null));

    for (let col = 0; col < 9; col++) {
        let start = col * 10 + 1;
        let end = col === 8 ? 90 : (col + 1) * 10;
        let numbers = shuffle([...Array(end - start + 1).keys()].map(n => n + start)).slice(0, 3);

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

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

const getTambolaGameDetails = async (userId, tambolaGameId) => {
    try {
        const result = await tambolaDao.getTambolaGameDetails(userId, tambolaGameId);
        return commonService.createResponse(httpResponse.SUCCESS, result);
    } catch (error) {
        return commonService.createResponse(httpResponse.INTERNAL_SERVER_ERROR, error.message);
    }
};

const sendCurrentNumberToAllUser = async (tambolaGameId, currentNumber, connections) => {
    try {
        const users = await tambolaDao.getUsersForTambolaGame(tambolaGameId);

        for (let user of users) {
            const webSocket = connections.get(user.id?.toString());
            if (webSocket && webSocket.readyState === WebSocket.OPEN) {
                webSocket.send(JSON.stringify(currentNumber));
            }
        }

        return commonService.createResponse(httpResponse.SUCCESS, messages.SUCCESSFULLY_STARTED)

    } catch (error) {
        return commonService.createResponse(httpResponse.INTERNAL_SERVER_ERROR, error.message);
    }
};

const verifyTambolaGameClaim = async (claimType, userId, tambolaGameId, connections) => {

    try {
        const userData = await tambolaDao.gatUserDataForTambolaGame(userId, tambolaGameId)

        let { ticketNumbers, markedNumbers } = userData[0];
        ticketNumbers = JSON.parse(ticketNumbers);
        markedNumbers = JSON.parse(markedNumbers);

        const [gameData] = await tambolaDao.gatTambolaGameData(tambolaGameId);

        const withdrawnNumbers = JSON.parse(gameData[0].withdrawnNumbers);

        const isLineMarked = (line) => line.every(num => num === null || withdrawnNumbers.includes(num));

        let isValidClaim = false;

        switch (claimType) {
            case 'topLine':
                isValidClaim = isLineMarked(ticket[0]);
                break;
            case 'middleLine':
                isValidClaim = isLineMarked(ticket[1]);
                break;
            case 'bottomLine':
                isValidClaim = isLineMarked(ticket[2]);
                break;
            case 'earlyFive':
                const markedCount = markedNumbers.filter(num => withdrawnNumbers.includes(num)).length;
                isValidClaim = markedCount >= 5;
                break;
            case 'fullHouse':
                isValidClaim = ticket.flat().every(num => num === null || withdrawnNumbers.includes(num));
                break;
            default:
                returns;
        }


        if (!isValidClaim) {
            const webSocket = connections.get(userId?.toString());
            if (webSocket && webSocket.readyState === WebSocket.OPEN) {
                webSocket.send(claimType, 'unClaimed');
            }
        } else {
            const users = await tambolaDao.getUsersForTambolaGame(tambolaGameId);

            for (let user of users) {
                const webSocket = connections.get(user.id?.toString());
                if (webSocket && webSocket.readyState === WebSocket.OPEN) {
                    webSocket.send(claimType, 'claimed');
                }
            }
            await tambolaDao.updateTambolaGameClaims(tambolaGameId, userId);
        }

    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal server error" });
    }
};

module.exports = {
    createNewTambolaGame,
    joinUserToTambolaGame,
    generateTicketsForTambolaGame,
    getTambolaGameDetails,
    sendCurrentNumberToAllUser,
    verifyTambolaGameClaim
}