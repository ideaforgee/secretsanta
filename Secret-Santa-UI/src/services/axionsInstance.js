import axios from "axios";
import { getToken } from "./authService";
import APP_CONFIG from '../config/appConfig';

const axiosInstance = axios.create({
  baseURL: APP_CONFIG.BACKEND_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

let requestQueue = [];

/**
 * Update the spinner status based on the request queue length.
 *
 * @param {Function} startLoading - Function to start the loading spinner.
 * @param {Function} stopLoading - Function to stop the loading spinner.
 */
const updateSpinnerStatus = (startLoading, stopLoading) => {
  if (requestQueue.length > 0) {
    startLoading(true);
  } else {
    stopLoading(true);
  }
};

/**
 * Setup Axios interceptors for request and response.
 *
 * This function adds authorization headers to requests and manages the loading spinner
 * based on the request queue.
 *
 * @param {Function} startLoading - Function to start the loading spinner.
 * @param {Function} stopLoading - Function to stop the loading spinner.
 */
const setupInterceptors = (startLoading, stopLoading) => {
  axiosInstance.interceptors.request.use(
    (config) => {
      const token = getToken();
      if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }

      requestQueue.push(config);
      updateSpinnerStatus(startLoading, stopLoading);

      return config;
    },
    (error) => {
      requestQueue.shift();
      updateSpinnerStatus(startLoading, stopLoading);

      return Promise.reject(error);
    }
  );

  axiosInstance.interceptors.response.use(
    (response) => {
      requestQueue = requestQueue.filter(
        (req) => req !== response.config
      );
      updateSpinnerStatus(startLoading, stopLoading);

      return response;
    },
    (error) => {
      requestQueue = requestQueue.filter(
        (req) => req !== error.config
      );
      updateSpinnerStatus(startLoading, stopLoading);

      return Promise.reject(error);
    }
  );
};

export { setupInterceptors };
export default axiosInstance;
