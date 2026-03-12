/**
 * Authentication API functions
 * Pure functions for authentication operations
 * @module authApi
 */

import apiClient from './apiClient.js';
import { handleApiResponse } from './apiClient.js';

/**
 * User login
 * @param {object} credentials - Login credentials
 * @param {string} credentials.email - User email
 * @param {string} credentials.password - User password
 * @returns {Promise<object>} Promise that resolves with login response
 */
export const login = async (credentials) => {
  const apiCall = apiClient.post('/auth/login', credentials);
  return handleApiResponse(apiCall);
};

/**
 * User registration
 * @param {object} userData - User registration data
 * @param {string} userData.firstName - User first name
 * @param {string} userData.lastName - User last name
 * @param {string} userData.email - User email
 * @param {string} userData.password - User password
 * @returns {Promise<object>} Promise that resolves with registration response
 */
export const register = async (userData) => {
  const apiCall = apiClient.post('/auth/register', userData);
  return handleApiResponse(apiCall);
};

/**
 * User logout
 * @param {string} [refreshToken] - Optional refresh token to invalidate
 * @returns {Promise<object>} Promise that resolves with logout response
 */
export const logout = async (refreshToken = null) => {
  const payload = refreshToken ? { refreshToken } : {};
  const apiCall = apiClient.post('/auth/logout', payload);
  return handleApiResponse(apiCall);
};

/**
 * Refresh access token
 * @param {string} refreshToken - The refresh token
 * @returns {Promise<object>} Promise that resolves with new tokens
 */
export const refresh = async (refreshToken) => {
  const apiCall = apiClient.post('/auth/refresh', { refreshToken });
  return handleApiResponse(apiCall);
};

/**
 * Get current user profile
 * @returns {Promise<object>} Promise that resolves with user profile data
 */
export const getCurrentUser = async () => {
  const apiCall = apiClient.get('/auth/me');
  return handleApiResponse(apiCall);
};

/**
 * Request password reset
 * @param {string} email - User email address
 * @returns {Promise<object>} Promise that resolves with password reset response
 */
export const requestPasswordReset = async (email) => {
  const apiCall = apiClient.post('/auth/forgot-password', { email });
  return handleApiResponse(apiCall);
};

/**
 * Reset password with token
 * @param {object} resetData - Password reset data
 * @param {string} resetData.token - Reset token
 * @param {string} resetData.email - User email
 * @param {string} resetData.password - New password
 * @param {string} resetData.passwordConfirmation - Password confirmation
 * @returns {Promise<object>} Promise that resolves with password reset response
 */
export const resetPassword = async (resetData) => {
  const apiCall = apiClient.post('/auth/reset-password', resetData);
  return handleApiResponse(apiCall);
};

/**
 * Verify email address
 * @param {string} token - Email verification token
 * @returns {Promise<object>} Promise that resolves with email verification response
 */
export const verifyEmail = async (token) => {
  const apiCall = apiClient.post('/auth/verify-email', { token });
  return handleApiResponse(apiCall);
};

/**
 * Resend email verification
 * @param {string} email - User email address
 * @returns {Promise<object>} Promise that resolves with resend verification response
 */
export const resendEmailVerification = async (email) => {
  const apiCall = apiClient.post('/auth/resend-verification', { email });
  return handleApiResponse(apiCall);
};

/**
 * Change user password
 * @param {object} passwordData - Password change data
 * @param {string} passwordData.currentPassword - Current password
 * @param {string} passwordData.newPassword - New password
 * @param {string} passwordData.confirmPassword - New password confirmation
 * @returns {Promise<object>} Promise that resolves with password change response
 */
export const changePassword = async (passwordData) => {
  const apiCall = apiClient.post('/auth/change-password', passwordData);
  return handleApiResponse(apiCall);
};

/**
 * Update user profile
 * @param {object} profileData - Profile update data
 * @param {string} profileData.firstName - First name
 * @param {string} profileData.lastName - Last name
 * @param {string} profileData.email - Email address
 * @param {string} [profileData.phone] - Phone number
 * @returns {Promise<object>} Promise that resolves with profile update response
 */
export const updateProfile = async (profileData) => {
  const apiCall = apiClient.put('/auth/profile', profileData);
  return handleApiResponse(apiCall);
};

/**
 * Delete user account
 * @param {string} password - User password for confirmation
 * @returns {Promise<object>} Promise that resolves with account deletion response
 */
export const deleteAccount = async (password) => {
  const apiCall = apiClient.delete('/auth/account', {
    data: { password }
  });
  return handleApiResponse(apiCall);
};

/**
 * Check if email is available
 * @param {string} email - Email to check
 * @returns {Promise<object>} Promise that resolves with email availability
 */
export const checkEmailAvailability = async (email) => {
  const apiCall = apiClient.get('/auth/check-email', {
    params: { email }
  });
  return handleApiResponse(apiCall);
};

/**
 * Get user session information
 * @returns {Promise<object>} Promise that resolves with session data
 */
export const getSession = async () => {
  const apiCall = apiClient.get('/auth/session');
  return handleApiResponse(apiCall);
};
