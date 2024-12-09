import { handleRequest } from '../utils/requestHandler';

export const fetchMessages = (userId, gameId) => {
    return handleRequest({
        method: 'post',
        url: '/api/chat/getMessages',
        data: { userId, gameId },
    });
};

export const fetchPendingMessages = (userId, gameId) => {
    return handleRequest({
        method: 'post',
        url: '/api/chat/getPendingMessages',
        data: { userId, gameId },
    });
};

export const deleteMessage = (messageId) => {
    return handleRequest({
        method: 'delete',
        url: '/api/messages/delete',
        params: { messageId },
    });
};

export const markEmailAsNotSent = (userId, gameId, chatBoxType) => {
    return handleRequest({
        method: 'post',
        url: '/api/chat/markEmailAsNotSent',
        data: { userId, gameId, chatBoxType },
    });
};
