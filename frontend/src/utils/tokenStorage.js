/**
 * JWT Token Storage using closure for in-memory storage
 * This module provides secure token storage without using localStorage
 * @module tokenStorage
 */

/**
 * Closure-based token storage for security
 * Tokens are kept in memory only and cleared on page refresh
 */
const TokenStorage = (() => {
  // Private variables within the closure
  let accessToken = null;
  let refreshToken = null;
  let tokenExpiryTime = null;

  /**
   * Set the access token with optional expiry time
   * @param {string} token - The JWT access token
   * @param {number} [expiresIn] - Token expiry time in seconds (optional)
   */
  const setAccessToken = (token, expiresIn = null) => {
    accessToken = token;
    if (expiresIn) {
      tokenExpiryTime = Date.now() + (expiresIn * 1000);
    } else {
      // Default expiry of 1 hour if not specified
      tokenExpiryTime = Date.now() + (60 * 60 * 1000);
    }
  };

  /**
   * Get the current access token
   * @returns {string|null} The access token or null if not set/expired
   */
  const getAccessToken = () => {
    if (!accessToken) return null;
    
    // Check if token has expired
    if (tokenExpiryTime && Date.now() >= tokenExpiryTime) {
      clearTokens();
      return null;
    }
    
    return accessToken;
  };

  /**
   * Set the refresh token
   * @param {string} token - The JWT refresh token
   */
  const setRefreshToken = (token) => {
    refreshToken = token;
  };

  /**
   * Get the current refresh token
   * @returns {string|null} The refresh token or null if not set
   */
  const getRefreshToken = () => {
    return refreshToken;
  };

  /**
   * Check if the access token is expired or will expire soon
   * @param {number} [bufferTime=30000] - Buffer time in milliseconds before expiry (default: 30 seconds)
   * @returns {boolean} True if token is expired or will expire soon
   */
  const isTokenExpired = (bufferTime = 30000) => {
    if (!tokenExpiryTime) return true;
    return Date.now() >= (tokenExpiryTime - bufferTime);
  };

  /**
   * Check if user is authenticated (has valid access token)
   * @returns {boolean} True if user has a valid access token
   */
  const isAuthenticated = () => {
    return getAccessToken() !== null;
  };

  /**
   * Clear all tokens from memory
   */
  const clearTokens = () => {
    accessToken = null;
    refreshToken = null;
    tokenExpiryTime = null;
  };

  /**
   * Get token information for debugging
   * @returns {object} Token status information (without exposing actual tokens)
   */
  const getTokenInfo = () => {
    return {
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!refreshToken,
      expiryTime: tokenExpiryTime,
      isExpired: isTokenExpired(),
      timeUntilExpiry: tokenExpiryTime ? Math.max(0, tokenExpiryTime - Date.now()) : 0,
    };
  };

  /**
   * Parse JWT token to extract payload (for non-sensitive data only)
   * @param {string} token - The JWT token to parse
   * @returns {object|null} Parsed token payload or null if invalid
   */
  const parseJWT = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error parsing JWT token:', error);
      return null;
    }
  };

  /**
   * Get user information from access token
   * @returns {object|null} User information from token or null if not available
   */
  const getUserFromToken = () => {
    const token = getAccessToken();
    if (!token) return null;
    
    const payload = parseJWT(token);
    if (!payload) return null;
    
    return {
      id: payload.sub || payload.userId,
      email: payload.email,
      firstName: payload.firstName,
      lastName: payload.lastName,
      role: payload.role,
      exp: payload.exp,
      iat: payload.iat,
    };
  };

  // Public API
  return {
    setAccessToken,
    getAccessToken,
    setRefreshToken,
    getRefreshToken,
    isTokenExpired,
    isAuthenticated,
    clearTokens,
    getTokenInfo,
    getUserFromToken,
    parseJWT,
  };
})();

/**
 * Export the token storage instance as default
 */
export default TokenStorage;

/**
 * Export individual functions for named imports
 */
export const {
  setAccessToken,
  getAccessToken,
  setRefreshToken,
  getRefreshToken,
  isTokenExpired,
  isAuthenticated,
  clearTokens,
  getTokenInfo,
  getUserFromToken,
  parseJWT,
} = TokenStorage;
