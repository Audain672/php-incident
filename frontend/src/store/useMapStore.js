/**
 * Map Store using Zustand
 * Global state management for map-related UI state
 * @module useMapStore
 */

import { create } from 'zustand';
import { DEFAULT_COORDINATES } from '../utils/constants.js';

/**
 * Map store interface and state
 */
const useMapStore = create((set, get) => ({
  // Initial state
  selectedType: null,
  currentPage: 1,
  mapCenter: {
    lat: DEFAULT_COORDINATES.LAT,
    lng: DEFAULT_COORDINATES.LNG,
  },
  mapZoom: DEFAULT_COORDINATES.ZOOM,
  isFormOpen: false,
  selectedIncident: null,
  filters: {
    type: null,
    severity: null,
    status: null,
    dateFrom: null,
    dateTo: null,
    search: '',
  },
  mapBounds: null,
  userLocation: null,
  isLocating: false,

  // Actions
  
  /**
   * Set the selected incident type filter
   * @param {string|null} type - Incident type or null to clear
   */
  setSelectedType: (type) => set({ selectedType: type }),

  /**
   * Set the current page for pagination
   * @param {number} page - Page number
   */
  setCurrentPage: (page) => set({ currentPage: page }),

  /**
   * Update map center coordinates
   * @param {object} center - Map center coordinates
   * @param {number} center.lat - Latitude
   * @param {number} center.lng - Longitude
   */
  setMapCenter: (center) => set({ mapCenter: center }),

  /**
   * Update map zoom level
   * @param {number} zoom - Zoom level
   */
  setMapZoom: (zoom) => set({ mapZoom: zoom }),

  /**
   * Toggle or set incident form visibility
   * @param {boolean} [isOpen] - Form open state (optional, toggles if not provided)
   */
  setIsFormOpen: (isOpen) => set((state) => ({ 
    isFormOpen: isOpen !== undefined ? isOpen : !state.isFormOpen 
  })),

  /**
   * Set the selected incident for details view
   * @param {object|null} incident - Incident object or null to clear
   */
  setSelectedIncident: (incident) => set({ selectedIncident: incident }),

  /**
   * Update filter values
   * @param {object} newFilters - New filter values
   */
  setFilters: (newFilters) => set((state) => ({
    filters: { ...state.filters, ...newFilters }
  })),

  /**
   * Clear all filters
   */
  clearFilters: () => set({
    filters: {
      type: null,
      severity: null,
      status: null,
      dateFrom: null,
      dateTo: null,
      search: '',
    },
    selectedType: null,
  }),

  /**
   * Update map bounds
   * @param {object|null} bounds - Map bounds object
   */
  setMapBounds: (bounds) => set({ mapBounds: bounds }),

  /**
   * Set user location
   * @param {object|null} location - User location coordinates
   * @param {number} location.lat - Latitude
   * @param {number} location.lng - Longitude
   */
  setUserLocation: (location) => set({ userLocation: location }),

  /**
   * Set geolocation loading state
   * @param {boolean} loading - Whether geolocation is loading
   */
  setIsLocating: (loading) => set({ isLocating: loading }),

  /**
   * Reset map state to defaults
   */
  resetMapState: () => set({
    mapCenter: {
      lat: DEFAULT_COORDINATES.LAT,
      lng: DEFAULT_COORDINATES.LNG,
    },
    mapZoom: DEFAULT_COORDINATES.ZOOM,
    selectedIncident: null,
    selectedType: null,
    currentPage: 1,
    isFormOpen: false,
    mapBounds: null,
  }),

  /**
   * Reset all state including filters
   */
  resetAllState: () => set({
    selectedType: null,
    currentPage: 1,
    mapCenter: {
      lat: DEFAULT_COORDINATES.LAT,
      lng: DEFAULT_COORDINATES.LNG,
    },
    mapZoom: DEFAULT_COORDINATES.ZOOM,
    isFormOpen: false,
    selectedIncident: null,
    filters: {
      type: null,
      severity: null,
      status: null,
      dateFrom: null,
      dateTo: null,
      search: '',
    },
    mapBounds: null,
    userLocation: null,
    isLocating: false,
  }),

  /**
   * Get current filters as query parameters
   * @returns {object} Filters object for API calls
   */
  getQueryFilters: () => {
    const { filters, selectedType, currentPage } = get();
    const queryFilters = { page: currentPage };

    // Add non-null filters
    Object.keys(filters).forEach(key => {
      if (filters[key] !== null && filters[key] !== '') {
        queryFilters[key] = filters[key];
      }
    });

    // Add selected type if not already in filters
    if (selectedType && !queryFilters.type) {
      queryFilters.type = selectedType;
    }

    return queryFilters;
  },

  /**
   * Check if any filters are active
   * @returns {boolean} True if any filters are set
   */
  hasActiveFilters: () => {
    const { filters, selectedType } = get();
    const hasFilters = Object.values(filters).some(value => 
      value !== null && value !== ''
    );
    return hasFilters || selectedType !== null;
  },

  /**
   * Pan map to specific coordinates
   * @param {number} lat - Latitude
   * @param {number} lng - Longitude
   * @param {number} [zoom] - Optional zoom level
   */
  panTo: (lat, lng, zoom) => set((state) => ({
    mapCenter: { lat, lng },
    mapZoom: zoom !== undefined ? zoom : state.mapZoom,
  })),

  /**
   * Open incident form with pre-filled location
   * @param {number} lat - Latitude
   * @param {number} lng - Longitude
   * @param {string} [locationName] - Optional location name
   */
  openFormAtLocation: (lat, lng, locationName = null) => set({
    isFormOpen: true,
    mapCenter: { lat, lng },
    mapZoom: 16, // Zoom in for better precision
    // This could be extended to include pre-filled form data
  }),
}));

export default useMapStore;
