/**
 * Axios API Client Configuration
 * Configures the base Axios instance with interceptors for authentication and error handling
 * @module apiClient
 */

import axios from 'axios';
import { getAccessToken, setAccessToken, clearTokens, getRefreshToken } from '../utils/tokenStorage.js';
import { parseAxiosError, shouldLogout } from '../utils/errorHandler.js';

/**
 * Get the base API URL from environment variables
 * @returns {string} The base API URL
 */
const getBaseURL = () => {
  return import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
};

/**
 * Get the API timeout from environment variables
 * @returns {number} The timeout in milliseconds
 */
const getTimeout = () => {
  return parseInt(import.meta.env.VITE_API_TIMEOUT) || 10000;
};

/**
 * Create and configure the base Axios instance
 */
const apiClient = axios.create({
  baseURL: getBaseURL(),
  timeout: getTimeout(),
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

/**
 * Request interceptor to automatically add Bearer token
 */
apiClient.interceptors.request.use(
  (config) => {
    // Get the access token from memory storage
    const token = getAccessToken();
    
    if (token) {
      // Add Authorization header with Bearer token
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Handle FormData - let Axios set the Content-Type automatically
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    // Add request timestamp for debugging
    config.metadata = { startTime: new Date() };

    return config;
  },
  (error) => {
    // Log request error for debugging
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

/**
 * Flag to prevent multiple refresh attempts
 */
let isRefreshing = false;
let failedQueue = [];

/**
 * Process the queue of failed requests
 * @param {Error} error - The error that occurred during refresh
 * @param {string|null} token - The new token (if refresh was successful)
 */
const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

/**
 * Response interceptor for error handling and token refresh
 */
apiClient.interceptors.response.use(
  (response) => {
    // Log successful request timing for debugging
    const endTime = new Date();
    const duration = endTime - response.config.metadata.startTime;
    console.debug(`API Request completed in ${duration}ms: ${response.config.method?.toUpperCase()} ${response.config.url}`);
    
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Don't retry if the request was already retried or is not a 401
    if (error.response?.status !== 401 || originalRequest._retry) {
      // Handle specific error cases
      if (error.response?.status === 403) {
        // Forbidden - user doesn't have permission
        const parsedError = parseAxiosError(error);
        console.error('Access forbidden:', parsedError.message);
        return Promise.reject(parsedError);
      }

      if (error.response?.status >= 500) {
        // Server error
        const parsedError = parseAxiosError(error);
        console.error('Server error:', parsedError.message);
        return Promise.reject(parsedError);
      }

      // Network errors and other cases
      const parsedError = parseAxiosError(error);
      return Promise.reject(parsedError);
    }

    // Handle 401 Unauthorized - try to refresh the token
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, add this request to the queue
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        }).catch((err) => {
          return Promise.reject(err);
        });
      }

      isRefreshing = true;
      originalRequest._retry = true;

      const refreshToken = getRefreshToken();

      if (!refreshToken) {
        // No refresh token available - clear tokens and redirect to login
        clearTokens();
        processQueue(new Error('No refresh token available'));
        
        // Trigger logout event for the app to handle
        window.dispatchEvent(new CustomEvent('auth:logout'));
        
        return Promise.reject(parseAxiosError(error));
      }

      try {
        // Attempt to refresh the token
        const response = await axios.post(
          `${getBaseURL()}/auth/refresh`,
          { refreshToken },
          {
            headers: {
              'Content-Type': 'application/json',
            },
            timeout: getTimeout(),
          }
        );

        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data;

        // Update tokens in memory
        setAccessToken(newAccessToken);
        if (newRefreshToken) {
          // Note: This would need to be implemented in tokenStorage
          // setRefreshToken(newRefreshToken);
        }

        // Process the queue with the new token
        processQueue(null, newAccessToken);

        // Retry the original request with the new token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);

      } catch (refreshError) {
        // Refresh failed - clear tokens and trigger logout
        clearTokens();
        processQueue(refreshError);
        
        // Trigger logout event for the app to handle
        window.dispatchEvent(new CustomEvent('auth:logout'));
        
        return Promise.reject(parseAxiosError(refreshError));
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(parseAxiosError(error));
  }
);

/**
 * Utility function to create FormData for file uploads
 * @param {object} data - The data to convert to FormData
 * @param {File|null} file - Optional file to include
 * @returns {FormData} FormData instance
 */
export const createFormData = (data, file = null) => {
  const formData = new FormData();
  
  // Add all data fields
  Object.keys(data).forEach(key => {
    if (data[key] !== null && data[key] !== undefined) {
      formData.append(key, data[key]);
    }
  });
  
  // Add file if provided
  if (file) {
    formData.append('image', file);
  }
  
  return formData;
};

/**
 * Utility function to handle API responses consistently
 * @param {Promise} apiCall - The API call to make
 * @returns {Promise} Promise that resolves with data or rejects with error
 */
export const handleApiResponse = async (apiCall) => {
  try {
    const response = await apiCall;
    return response.data;
  } catch (error) {
    // Check if error requires logout
    if (shouldLogout(error)) {
      clearTokens();
      window.dispatchEvent(new CustomEvent('auth:logout'));
    }
    throw error;
  }
};

/**
 * Export the configured Axios instance
 */
export default apiClient;

/**
 * Export utilities for use in other API modules
 */
export { getBaseURL, getTimeout };
