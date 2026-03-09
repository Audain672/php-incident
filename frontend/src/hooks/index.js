/**
 * Hooks Index
 * Central export point for all hooks with dynamic API switching
 * @module hooks
 */

// Configuration
import { isLocalMode, isApiMode, getAuthApi, getIncidentApi, debugLog } from '../config/apiConfig.js';

// Dynamic hooks (recommended for use)
export { 
  useDynamicAuth as useAuth,
  useDynamicLoginForm as useLoginForm,
  useDynamicRegisterForm as useRegisterForm,
} from './useDynamicAuth.js';

export {
  useDynamicIncidents as useIncidents,
  useDynamicIncident as useIncident,
  useDynamicCreateIncident as useCreateIncident,
  useDynamicDeleteIncident as useDeleteIncident,
  useDynamicInvalidateIncidents as useInvalidateIncidents,
} from './useDynamicIncidents.js';

// Original hooks (for backward compatibility)
export { useAuth as useOriginalAuth } from './useAuth.js';
export { useLoginForm as useOriginalLoginForm } from './useAuth.js';
export { useRegisterForm as useOriginalRegisterForm } from './useAuth.js';
export { useIncidents as useOriginalIncidents } from './useIncidents.js';
export { useIncident as useOriginalIncident } from './useIncidents.js';
export { useCreateIncident as useOriginalCreateIncident } from './useCreateIncident.js';
export { useDeleteIncident as useOriginalDeleteIncident } from './useDeleteIncident.js';
export { useInvalidateIncidents as useOriginalInvalidateIncidents } from './useIncidents.js';

// Other hooks
export { default as useGeolocation } from './useGeolocation.js';

/**
 * Hook to get current API mode and configuration
 * @returns {object} API configuration
 */
export const useApiConfig = () => {
  return {
    isLocalMode: isLocalMode(),
    isApiMode: isApiMode(),
    config: {
      mode: import.meta.env?.VITE_API_MODE || 'local',
      baseUrl: import.meta.env?.VITE_API_BASE_URL || 'http://localhost:8000/api',
      mockDelay: import.meta.env?.VITE_MOCK_DELAY !== 'false',
      debug: import.meta.env?.MODE === 'development',
    },
  };
};
