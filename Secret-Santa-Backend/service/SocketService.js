const WebSocket = require('ws');
const url = require('url');
const messageService = require('./MessageService');
const messageDao = require('../dao/messageDao');
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
                    const encryptedReceiverId = await messageDao.getReceiverIdForSenderAndGame(
                        parsedMessage.userId, parsedMessage.gameId, parsedMessage.chatBoxType
                    );
                    const receiverId = encryptDecryptService.decrypt(encryptedReceiverId);
                    messageService.dispatchMessageToUser(receiverId, parsedMessage, connections);
                    await messageService.processIncomingMessage(userId, parsedMessage);
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

module.exports = {
    initializeSocketServer,
};
