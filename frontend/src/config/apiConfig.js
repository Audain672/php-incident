/**
 * API Configuration
 * Central configuration for switching between localStorage and real API
 * @module apiConfig
 */

/**
 * Environment configuration
 */
const ENV_CONFIG = {
  // Set to 'local' for localStorage mode, 'api' for real backend
  MODE: import.meta.env?.VITE_API_MODE || 'local',
  
  // API base URL (used when MODE is 'api')
  API_BASE_URL: import.meta.env?.VITE_API_BASE_URL || 'http://localhost:8080/api',
  
  // Enable/disable mock delays for localStorage mode
  MOCK_DELAY: import.meta.env?.VITE_MOCK_DELAY !== 'false',
  
  // Enable debug logging
  DEBUG: import.meta.env?.MODE === 'development',
};

/**
 * API mode detection
 */
export const isLocalMode = () => ENV_CONFIG.MODE === 'local';
export const isApiMode = () => ENV_CONFIG.MODE === 'api';

/**
 * Dynamic API imports based on mode
 */
export const getAuthApi = async () => {
  if (isLocalMode()) {
    const { localAuthApi } = await import('../api/localAuthApi.js');
    return localAuthApi;
  } else {
    const authApi = await import('../api/authApi.js');
    return authApi;
  }
};

export const getIncidentApi = async () => {
  if (isLocalMode()) {
    const { localIncidentApi } = await import('../api/localIncidentApi.js');
    return localIncidentApi;
  } else {
    const incidentApi = await import('../api/incidentApi.js');
    return incidentApi;
  }
};

/**
 * Storage configuration based on mode
 */
export const getStorageConfig = () => {
  if (isLocalMode()) {
    return {
      useLocalStorage: true,
      useMemoryStorage: false,
    };
  } else {
    return {
      useLocalStorage: false,
      useMemoryStorage: true,
    };
  }
};

/**
 * Mock delay configuration
 */
export const getMockDelay = () => {
  if (!ENV_CONFIG.MOCK_DELAY || isApiMode()) {
    return 0;
  }
  
  // Random delay between 300ms and 1500ms for realistic feel
  return Math.floor(Math.random() * 1200) + 300;
};

/**
 * Debug logging utility
 */
export const debugLog = (message, data = null) => {
  if (ENV_CONFIG.DEBUG) {
    console.log(`[API Config - ${ENV_CONFIG.MODE.toUpperCase()}] ${message}`, data);
  }
};

/**
 * Configuration validation
 */
export const validateConfig = () => {
  const errors = [];
  
  if (!['local', 'api'].includes(ENV_CONFIG.MODE)) {
    errors.push(`Invalid API_MODE: ${ENV_CONFIG.MODE}. Must be 'local' or 'api'`);
  }
  
  if (isApiMode() && !ENV_CONFIG.API_BASE_URL) {
    errors.push('API_BASE_URL is required when MODE is "api"');
  }
  
  if (errors.length > 0) {
    console.error('API Configuration errors:', errors);
    return false;
  }
  
  return true;
};

/**
 * Get current configuration summary
 */
export const getConfigSummary = () => {
  return {
    mode: ENV_CONFIG.MODE,
    baseUrl: ENV_CONFIG.API_BASE_URL,
    mockDelay: ENV_CONFIG.MOCK_DELAY,
    debug: ENV_CONFIG.DEBUG,
    storage: getStorageConfig(),
  };
};

// Validate configuration on import
validateConfig();

export default ENV_CONFIG;
