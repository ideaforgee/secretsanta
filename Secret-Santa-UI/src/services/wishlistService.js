import { handleRequest } from '../utils/requestHandler';

export const getMineWishlist = (userId, gameId) => {
    return handleRequest({
        method: 'get',
        url: '/api/user/getMineWishlist',
        params: { userId, gameId },
    });
};

export const addWishToMineWishList = (userId, gameId, payload) => {
    return handleRequest({
        method: 'post',
        url: '/api/user/addWishToMineWishList',
        data: { userId, gameId, ...payload },
    });
};

export const getGiftNinjaWishList = (userId, gameId) => {
    return handleRequest({
        method: 'get',
        url: '/api/user/giftNinjaWishlist',
        params: { userId, gameId },
    });
};
