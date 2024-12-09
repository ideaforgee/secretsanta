import axiosInstance from '../services/axionsInstance';
import { REQUEST_ERROR_MESSAGE } from '../constants/secretSantaConstants';

export const handleRequest = async ({ method, url, params = {}, data = {} }) => {
    try {
        const response = await axiosInstance({
            method,
            url,
            params,
            data,
        });
        return response.data?.data;
    } catch (error) {
        throw error.response ? error.response.data?.data : REQUEST_ERROR_MESSAGE;
    }
};
