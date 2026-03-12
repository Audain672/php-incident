// AUDIT ÉTAPE 1
// ──────────────────────────────────────────────────────────────────
// CE QUE FAIT CE FICHIER (état actuel) :
//   - Définit les constantes globales de l'application :
//     API_ENDPOINTS, INCIDENT_TYPES, SEVERITY_LEVELS, LIMITS,
//     FILE_CONSTRAINTS, DEFAULT_COORDINATES, INCIDENT_STATUS,
//     PAGINATION, STORAGE_KEYS
//   - INCIDENT_TYPES : chaque type a id, label, color, icon (émoji)
//   - SEVERITY_LEVELS : chaque niveau a id, label, color
//   - DEFAULT_COORDINATES : Paris (lat 48.8566, lng 2.3522, zoom 13)
//
// CE QUI DOIT CHANGER AUX ÉTAPES SUIVANTES :
//   - Aucun changement urgent sur ce fichier
//   - Optionnel : ajouter MAP_INTERACTION_CONFIG (durée d'animation flyTo,
//     zoom cible lors de la sélection d'un marqueur, etc.)
//
// DÉPENDANCES :
//   - Utilisé par useMapStore.js, MapContainer.jsx, IncidentMarker.jsx,
//     MapPage.jsx, et de nombreux autres composants
// ──────────────────────────────────────────────────────────────────

/**
 * Constants for the Incident Reporter application
 * @module constants
 */

/**
 * API endpoints
 */
export const API_ENDPOINTS = {
  // Authentication
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  REFRESH: '/auth/refresh',
  ME: '/auth/me',
  
  // Incidents
  INCIDENTS: '/incidents',
  INCIDENT: '/incidents/:id',
  INCIDENT_IMAGE: '/incidents/:id/image',
  
  // Categories
  CATEGORIES: '/categories',
  
  // Users
  USERS: '/users',
  USER_PROFILE: '/users/profile',
};

/**
 * Incident types with their corresponding colors and icons
 */
export const INCIDENT_TYPES = {
  ACCIDENT: {
    id: 'accident',
    label: 'Accident',
    color: '#ef4444',
    icon: '🚗',
  },
  FIRE: {
    id: 'fire',
    label: 'Incendie',
    color: '#f59e0b',
    icon: '🔥',
  },
  FLOOD: {
    id: 'flood',
    label: 'Inondation',
    color: '#3b82f6',
    icon: '🌊',
  },
  ROAD_WORK: {
    id: 'road_work',
    label: 'Travaux routiers',
    color: '#fbbf24',
    icon: '🚧',
  },
  OBSTACLE: {
    id: 'obstacle',
    label: 'Obstacle',
    color: '#8b5cf6',
    icon: '🚧',
  },
  WEATHER: {
    id: 'weather',
    label: 'Météo',
    color: '#06b6d4',
    icon: '🌦️',
  },
  OTHER: {
    id: 'other',
    label: 'Autre',
    color: '#6b7280',
    icon: '📌',
  },
};

/**
 * Incident severity levels
 */
export const SEVERITY_LEVELS = {
  LOW: {
    id: 'low',
    label: 'Faible',
    color: '#22c55e',
  },
  MEDIUM: {
    id: 'medium',
    label: 'Moyen',
    color: '#f59e0b',
  },
  HIGH: {
    id: 'high',
    label: 'Élevé',
    color: '#ef4444',
  },
  CRITICAL: {
    id: 'critical',
    label: 'Critique',
    color: '#dc2626',
  },
};

/**
 * Application limits and constraints
 */
export const LIMITS = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB in bytes
  MAX_TITLE_LENGTH: 100,
  MAX_DESCRIPTION_LENGTH: 1000,
  MAX_LOCATION_NAME_LENGTH: 200,
  MIN_ZOOM_LEVEL: 1,
  MAX_ZOOM_LEVEL: 20,
  DEFAULT_ZOOM_LEVEL: 13,
  API_TIMEOUT: 10000, // 10 seconds
};

/**
 * File upload constraints
 */
export const FILE_CONSTRAINTS = {
  ALLOWED_TYPES: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
  ],
  ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.gif', '.pdf'],
  MAX_SIZE: LIMITS.MAX_FILE_SIZE,
  MAX_SIZE_MB: 5,
};

/**
 * Leaflet default coordinates (Paris, France)
 */
export const DEFAULT_COORDINATES = {
  LAT: 48.8566,
  LNG: 2.3522,
  ZOOM: 13,
};

/**
 * Status options for incidents
 */
export const INCIDENT_STATUS = {
  PENDING: {
    id: 'pending',
    label: 'En attente',
    color: '#f59e0b',
  },
  IN_PROGRESS: {
    id: 'in_progress',
    label: 'En cours',
    color: '#3b82f6',
  },
  RESOLVED: {
    id: 'resolved',
    label: 'Résolu',
    color: '#22c55e',
  },
  CLOSED: {
    id: 'closed',
    label: 'Fermé',
    color: '#6b7280',
  },
};

/**
 * Pagination defaults
 */
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
};

/**
 * Local storage keys (for non-sensitive data only)
 */
export const STORAGE_KEYS = {
  THEME: 'incident_reporter_theme',
  LANGUAGE: 'incident_reporter_language',
  MAP_PREFERENCES: 'incident_reporter_map_preferences',
};
