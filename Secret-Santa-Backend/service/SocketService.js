const WebSocket = require('ws');
const url = require('url');
const messageService = require('./MessageService');
const tambolaService = require('./TambolaService');
const groupService = require('./GroupService');
const tambolaDao = require('../dao/TambolaDao');
const messageDao = require('../dao/messageDao');
const groupDao = require('../dao/GroupDao.js');
const encryptDecryptService = require('../service/EncryptionAndDecryptionService');
const connections = new Map();

/**
 * Initializes WebSocket server and handles incoming connections
 * @param {Object} server - HTTP server to attach WebSocket server to
 */
const initializeSocketServer = (server) => {
    const webSocketServer = new WebSocket.Server({ server });
    console.log(server);
    webSocketServer.on('headers', (headers) => {
        console.log(headers);
        headers.push('Access-Control-Allow-Origin: *');
    });

    webSocketServer.on('connection', (webSocket, req) => {
        console.log(req);
        const parsedUrl = url.parse(req.url, true);
        const userId = parsedUrl.query.userId;

        if (userId) {
            connections.set(userId, webSocket);

            webSocket.on('message', async (message) => {
                console.log(`Message received from ${userId}:`, message);
                const parsedMessage = JSON.parse(message);
                if (parsedMessage.type == 'message') {
                    handleSecretSantaChat(parsedMessage, userId);
                }

                if (parsedMessage.type == 'startTambolaGame') {
                    handleTambolaStartGame(parsedMessage, userId);
                }

                if (parsedMessage.type == 'withDrawnNumbers') {
                    handleTambolaWithDrawnNumbers(parsedMessage, userId);
                }

                if (parsedMessage.type == 'markedNumbers') {
                    handleTambolaMarkedNumbers(parsedMessage, userId);
                }

                if (parsedMessage.type == 'claim') {
                    handleTambolaClaim(parsedMessage, userId);
                }

                if (parsedMessage.type == 'pressBuzzer') {
                    handlePressBuzzer(parsedMessage, userId);
                }

                if (parsedMessage.type == 'reactiveBuzzer') {
                    handleReactiveBuzzer(parsedMessage);
                }

                if (parsedMessage.type == 'groupDiscussionMessage') {
                    handleGroupDiscussionMessage(parsedMessage, userId);
                }
            });

            webSocket.on('close', () => {
                console.log(`User disconnected: ${userId}`);
                connections.delete(userId);
            });
        } else {
            console.error('Connection attempted without userId');
            webSocket.close();
        }
    });

    console.log('WebSocket server initialized');
};

async function handleTambolaStartGame(parsedMessage, userId) {
    console.log(`${userId} has start tambola game`);
    const users = await tambolaDao.getUsersForTambolaGame(parsedMessage.tambolaGameId);

    for (let user of users) {
        const webSocket = connections.get(user.userId?.toString());
        if (webSocket && webSocket.readyState === WebSocket.OPEN) {
            const messageData = {type: parsedMessage.type}
            webSocket.send(JSON.stringify(messageData));
        }
    }
}

async function handleTambolaWithDrawnNumbers(parsedMessage, userId) {
    console.log(`current number is ${parsedMessage.currentNumber} and till withdrawn numbers are: ${parsedMessage.withDrawnNumbers}`);
    tambolaService.sendCurrentNumberToAllUser(userId, parsedMessage.tambolaGameId, parsedMessage.currentNumber, parsedMessage.withDrawnNumbers, connections);
    tambolaDao.updateTambolaWithDrawnNumbers(parsedMessage.tambolaGameId, parsedMessage.withDrawnNumbers);
}

async function handleTambolaMarkedNumbers(parsedMessage, userId) {
    console.log(`${userId} marked numbers: ${parsedMessage.markedNumbers}`);
    await tambolaDao.saveUserMarkedNumbers(Number(userId), parsedMessage.markedNumbers, parsedMessage.tambolaGameId);
}

async function handleTambolaClaim(parsedMessage, userId) {
    console.log(`${parsedMessage.claimType} claimed by ${userId}`);
    tambolaService.verifyTambolaGameClaim(parsedMessage, userId, connections);
}

async function handleSecretSantaChat(parsedMessage, userId) {
    const encryptedReceiverId = await messageDao.getReceiverIdForSenderAndGame(
        parsedMessage.userId, parsedMessage.gameId, parsedMessage.chatBoxType
    );
    const receiverId = encryptDecryptService.decrypt(encryptedReceiverId);
    messageService.dispatchMessageToUser(receiverId, parsedMessage, connections);
    await messageService.processIncomingMessage(userId, parsedMessage);
}

async function handlePressBuzzer(parsedMessage, userId) {
    await groupDao.addUserToBuzzerRoom(userId, parsedMessage.newUser?.groupId, parsedMessage.newUser?.time);
}

async function handleReactiveBuzzer(parsedMessage) {
    groupService.reactiveBuzzerRoom(parsedMessage.groupId, connections);
    await groupDao.reactiveBuzzerRoom(parsedMessage.groupId);
}

async function handleGroupDiscussionMessage(parsedMessage, userId) {
    const receivers = await messageDao.getReceiversIdsForGroupDiscussion(parsedMessage.groupId);

    for (let receiver of receivers) {
        messageService.dispatchGroupDiscussionMessageToUser(userId, receiver.receiverId, parsedMessage, connections);
    }
    messageService.processIncomingGroupDiscussionMessage(userId, parsedMessage);
}

module.exports = {
    initializeSocketServer,
};
