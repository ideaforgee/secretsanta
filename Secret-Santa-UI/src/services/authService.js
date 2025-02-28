
import axiosInstance from '../services/axionsInstance';
import { GAME_ID_KEY } from '../constants/appConstant';
import { cardActionAreaClasses } from '@mui/material';
import { jwtDecode } from 'jwt-decode';

const TOKEN_KEY = 'token';
const USER_KEY = 'userId';

export const registerHandler = async (name, email, password) => {
  try {
    const response = await axiosInstance.post('api/auth/register', {
      name,
      email,
      password,
    });
    const { token, userId } = response.data.data;

    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(userId));
    
    return { token, userId };
  } catch (error) {
    throw error.response ? error.response.data : 'Registration failed';
  }
};

export const loginHandler = async (email, password) => {
  try {
    const response = await axiosInstance.post('api/auth/login', { email, password });
    const { token, userId } = response.data.data;

    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(userId));

    return { token, userId };
  } catch (error) {
    throw error.response ? error.response.data : 'Login failed';
  }
};

export const forgetPasswordHandler = async (email) => {
  try {
    const response = await axiosInstance.post('api/auth/forgetPassword', { email });
    const { success } = response.data.data;

    return success;
  } catch (error) {
    throw error.response ? error.response : 'Froget Password Failed';
  }
}

export const resetPasswordHandler = async (newPassword, userId) => {
  try {
    const response = await axiosInstance.post('api/auth/resetPassword', { newPassword, userId });
    const { success } = response.data.data;

    return success;
  } catch (error) {
    throw error.response ? error.response : "Reset Password Failed";
  }
}

export const logout = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(GAME_ID_KEY);
};

export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

export const getUser = () => {
  const user = localStorage.getItem(USER_KEY);
  return user ? JSON.parse(user) : null;
};

export const isAuthenticated = () => {
  const token = getToken();
  if (token || isTokenValid(token)) {
    return true;
  }

  logout();
  return false;
};

export const isTokenValid = (token) => {
  if (!token) return false;

  try {
    const decodedToken = jwtDecode(token);
    const currentTime = Math.floor(Date.now() / 1000);
    if (decodedToken.exp && decodedToken.exp < currentTime) {
      return false;
    }
    return true;
  } catch (error) {
    return false;
  }
};