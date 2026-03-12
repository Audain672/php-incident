/**
 * Local Storage Utilities
 * Professional localStorage wrapper with error handling and type safety
 * @module localStorage
 */

/**
 * Storage keys constants
 */
const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
  INCIDENTS: 'incidents_data',
  SETTINGS: 'app_settings',
};

/**
 * Safe localStorage operations with error handling
 */
class StorageManager {
  /**
   * Get item from localStorage
   * @param {string} key - Storage key
   * @param {any} defaultValue - Default value if key doesn't exist
   * @returns {any} Stored value or default
   */
  static getItem(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Error getting item from localStorage: ${key}`, error);
      return defaultValue;
    }
  }

  /**
   * Set item in localStorage
   * @param {string} key - Storage key
   * @param {any} value - Value to store
   * @returns {boolean} Success status
   */
  static setItem(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Error setting item in localStorage: ${key}`, error);
      return false;
    }
  }

  /**
   * Remove item from localStorage
   * @param {string} key - Storage key
   * @returns {boolean} Success status
   */
  static removeItem(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing item from localStorage: ${key}`, error);
      return false;
    }
  }

  /**
   * Clear all app data from localStorage
   * @returns {boolean} Success status
   */
  static clearAppData() {
    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
      return true;
    } catch (error) {
      console.error('Error clearing app data from localStorage', error);
      return false;
    }
  }
}

/**
 * Authentication storage utilities
 */
export const authStorage = {
  /**
   * Store authentication token
   * @param {string} token - JWT token
   */
  setToken: (token) => StorageManager.setItem(STORAGE_KEYS.AUTH_TOKEN, token),

  /**
   * Get authentication token
   * @returns {string|null} JWT token
   */
  getToken: () => StorageManager.getItem(STORAGE_KEYS.AUTH_TOKEN),

  /**
   * Remove authentication token
   */
  removeToken: () => StorageManager.removeItem(STORAGE_KEYS.AUTH_TOKEN),

  /**
   * Store user data
   * @param {object} userData - User information
   */
  setUser: (userData) => StorageManager.setItem(STORAGE_KEYS.USER_DATA, userData),

  /**
   * Get user data
   * @returns {object|null} User information
   */
  getUser: () => StorageManager.getItem(STORAGE_KEYS.USER_DATA),

  /**
   * Remove user data
   */
  removeUser: () => StorageManager.removeItem(STORAGE_KEYS.USER_DATA),

  /**
   * Check if user is authenticated
   * @returns {boolean} Authentication status
   */
  isAuthenticated: () => {
    const token = authStorage.getToken();
    const user = authStorage.getUser();
    return !!(token && user);
  },

  /**
   * Clear all authentication data
   */
  clearAuth: () => {
    authStorage.removeToken();
    authStorage.removeUser();
  },
};

/**
 * Incidents storage utilities
 */
export const incidentsStorage = {
  /**
   * Store incidents data
   * @param {Array} incidents - Array of incidents
   */
  setIncidents: (incidents) => StorageManager.setItem(STORAGE_KEYS.INCIDENTS, incidents),

  /**
   * Get incidents data
   * @returns {Array} Array of incidents
   */
  getIncidents: () => StorageManager.getItem(STORAGE_KEYS.INCIDENTS, []),

  /**
   * Add new incident
   * @param {object} incident - Incident data
   * @returns {boolean} Success status
   */
  addIncident: (incident) => {
    try {
      const incidents = incidentsStorage.getIncidents();
      const newIncident = {
        ...incident,
        id: Date.now().toString(), // Simple ID generation
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      incidents.push(newIncident);
      return incidentsStorage.setIncidents(incidents);
    } catch (error) {
      console.error('Error adding incident to localStorage', error);
      return false;
    }
  },

  /**
   * Update incident
   * @param {string} id - Incident ID
   * @param {object} updates - Updates to apply
   * @returns {boolean} Success status
   */
  updateIncident: (id, updates) => {
    try {
      const incidents = incidentsStorage.getIncidents();
      const index = incidents.findIndex(inc => inc.id === id);
      if (index !== -1) {
        incidents[index] = {
          ...incidents[index],
          ...updates,
          updatedAt: new Date().toISOString(),
        };
        return incidentsStorage.setIncidents(incidents);
      }
      return false;
    } catch (error) {
      console.error('Error updating incident in localStorage', error);
      return false;
    }
  },

  /**
   * Delete incident
   * @param {string} id - Incident ID
   * @returns {boolean} Success status
   */
  deleteIncident: (id) => {
    try {
      const incidents = incidentsStorage.getIncidents();
      const filteredIncidents = incidents.filter(inc => inc.id !== id);
      return incidentsStorage.setIncidents(filteredIncidents);
    } catch (error) {
      console.error('Error deleting incident from localStorage', error);
      return false;
    }
  },

  /**
   * Clear all incidents
   */
  clearIncidents: () => StorageManager.removeItem(STORAGE_KEYS.INCIDENTS),
};

/**
 * Settings storage utilities
 */
export const settingsStorage = {
  /**
   * Store app settings
   * @param {object} settings - App settings
   */
  setSettings: (settings) => StorageManager.setItem(STORAGE_KEYS.SETTINGS, settings),

  /**
   * Get app settings
   * @returns {object} App settings
   */
  getSettings: () => StorageManager.getItem(STORAGE_KEYS.SETTINGS, {}),

  /**
   * Update specific setting
   * @param {string} key - Setting key
   * @param {any} value - Setting value
   */
  updateSetting: (key, value) => {
    const settings = settingsStorage.getSettings();
    settings[key] = value;
    settingsStorage.setSettings(settings);
  },
};

export { STORAGE_KEYS };
export default StorageManager;
