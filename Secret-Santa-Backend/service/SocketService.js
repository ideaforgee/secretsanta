const WebSocket = require('ws');
const url = require('url');
const messageService = require('./MessageService');
const messageDao = require('../dao/messageDao');
const connections = new Map();

/**
 * Initializes WebSocket server and handles incoming connections
 * @param {Object} server - HTTP server to attach WebSocket server to
 */
const initializeSocketServer = (server) => {
    const webSocketServer = new WebSocket.Server({ server });

    webSocketServer.on('connection', (webSocket, req) => {
        const parsedUrl = url.parse(req.url, true);
        const userId = parsedUrl.query.userId;

        if (userId) {
            connections.set(userId, webSocket);

            webSocket.on('message', async (message) => {
                console.log(`Message received from ${userId}:`, message);
                const parsedMessage = JSON.parse(message);
                if (parsedMessage.type == 'message') {
                    const receiverId = await messageDao.getReceiverIdForSenderAndGame(
                        parsedMessage.userId, parsedMessage.gameId, parsedMessage.chatBoxType
                    );
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
