import { handleRequest } from '../utils/requestHandler';

export const hostGameHandler = (userId, payload) => {
    return handleRequest({
        method: 'post',
        url: '/api/game/createGame',
        data: { userId, payload },
    });
};

export const joinGameHandler = (userId, gameCode) => {
    return handleRequest({
        method: 'post',
        url: '/api/game/joinuser',
        data: { userId, gameCode }
    });
};

export const isGameActiveHandler = (gameId) => {
    return handleRequest({
        method: 'get',
        url: `/api/game/isActive/${gameId}`,
    });
};

export const getGameUsers = (gameId) => {
    return handleRequest({
        method: 'get',
        url: `/api/game/gameinfo/${gameId}`,
    });
};

export const startGame = (gameId) => {
    return handleRequest({
        method: 'post',
        url: '/api/game/startGame',
        data: { gameId },
    });
};

export const exitGame = (userId, gameId) => {
    return handleRequest({
        method: 'post',
        url: '/api/game/exit',
        data: { userId, gameId },
    });
};

export const endGame = (gameId) => {
    return handleRequest({
        method: 'delete',
        url: `/api/game/endGame/${gameId}`,
    });
};

export const validateGameId = (gameId) => {
    return handleRequest({
        method: 'post',
        url: '/api/game/validateGame',
        data: { gameId },
    });
};

export const createNewMasterMindGame = (userId, severity) => {
    return handleRequest({
        method: 'post',
        url: '/api/game/createNewMasterMindGame',
        data: { userId, severity },
    });
};

export const getUserMasterGameInfo = (userId, masterMindGameId) => {
    return handleRequest({
        method: 'post',
        url: '/api/game/getUserMasterGameInfo',
        data: { userId, masterMindGameId },
    });
};

export const validateUserMasterMindLevel = (userId, masterMindGameId, level, guess) => {
    return handleRequest({
        method: 'post',
        url: '/api/game/validateUserMasterMindLevel',
        data: { userId, masterMindGameId, level, guess },
    });
};

export const getRealPatternForMasterMindGame = (masterMindGameId) => {
    return handleRequest({
        method: 'post',
        url: '/api/game/getRealPatternForMasterMindGame',
        data: { masterMindGameId },
    });
};

export const getTabmolaGameDetais  = (userId, tambolaGameId) => {
    return handleRequest({
        method: 'post',
        url: '/api/game/getTabmolaGameDetais',
        data: { userId, tambolaGameId },
    });
};

export const generateTicketsForTambolaGame  = (tambolaGameId) => {
    return handleRequest({
        method: 'post',
        url: '/api/game/generateTicketsForTambolaGame',
        data: { tambolaGameId },
    });
};

export const setIsCompleteTrue = (userId, masterMindGameId) => {
    return handleRequest({
        method: 'post',
        url: '/api/game/setIsCompleteTrue',
        data: { userId, masterMindGameId },
    });
};