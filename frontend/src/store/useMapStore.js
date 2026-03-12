// AUDIT ÉTAPE 1
// ──────────────────────────────────────────────────────────────────
// CE QUE FAIT CE FICHIER (état actuel) :
//   - Store Zustand gérant l'état global de l'interface carte :
//     filtres, pagination, centre/zoom, formulaire, incident sélectionné,
//     limites de la carte, position de l'utilisateur
//
// CE QUI A ÉTÉ AJOUTÉ (ÉTAPE 1) :
//   - selectedIncidentUuid : UUID de l'incident sélectionné (réf. cart. ↔ liste)
//   - hoveredIncidentUuid  : UUID de l'incident survolé (effet hover marqueur)
//   - isDetailPanelOpen    : visibilité du panneau de détail
//   - detailPanelMode      : 'side' (desktop) | 'bottom' (mobile)
//   - isMapLoading         : chargement des incidents en cours
//   - mapRef               : référence à l'instance Leaflet
//   - Actions : selectIncident, hoverIncident, clearSelection,
//               setMapRef, setDetailPanelOpen, setDetailPanelMode
//
// DÉPENDANCES :
//   - zustand (create)
//   - DEFAULT_COORDINATES depuis constants.js
// ──────────────────────────────────────────────────────────────────

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
  // ── État existant ──────────────────────────────────────────────
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

  // ── Nouvelles propriétés (Étape 1) ──────────────────────────────

  /** UUID de l'incident actuellement sélectionné (synchronise carte ↔ liste) */
  selectedIncidentUuid: null,

  /** UUID de l'incident survolé par la souris (hover) */
  hoveredIncidentUuid: null,

  /** Coordonnées du marqueur brouillon (nouveau signalement, Étape 7) */
  draftLocation: null,

  /** Le panneau de détail est-il visible ? */
  isDetailPanelOpen: false,

  /** Mode d'affichage du panneau : 'side' (desktop) | 'bottom' (mobile) */
  detailPanelMode: 'side',

  /** Chargement des incidents en cours sur la carte */
  isMapLoading: false,

  /** Référence à l'instance Leaflet (map object) — non sérialisable */
  mapRef: null,

  // ── Actions existantes ─────────────────────────────────────────
  
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
   * @param {object|null} location - User location data
   * @param {number} location.lat - Latitude
   * @param {number} location.lng - Longitude
   * @param {number} [location.accuracy] - Accuracy in meters
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
    selectedIncidentUuid: null,
    hoveredIncidentUuid: null,
    draftLocation: null,
    isDetailPanelOpen: false,
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
    selectedIncidentUuid: null,
    hoveredIncidentUuid: null,
    draftLocation: null,
    isDetailPanelOpen: false,
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
    mapZoom: 16,
    draftLocation: { lat, lng },
  }),

  // \u2500\u2500 Nouvelles actions (\u00c9tape 1) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

  /**
   * S\u00e9lectionner un incident par UUID
   * Ouvre automatiquement le panneau de d\u00e9tail et efface tout hover en cours.
   * @param {string|null} uuid - UUID de l'incident \u00e0 s\u00e9lectionner, ou null
   */
  selectIncident: (uuid) => set({
    selectedIncidentUuid: uuid,
    hoveredIncidentUuid: null,
    isDetailPanelOpen: uuid !== null,
  }),

  /**
   * D\u00e9finir l'incident survol\u00e9 (effet hover sur le marqueur)
   * @param {string|null} uuid - UUID de l'incident survol\u00e9, ou null
   */
  hoverIncident: (uuid) => set({ hoveredIncidentUuid: uuid }),

  /**
   * Remove hover state from an incident
   */
  clearHover: () => set({ hoveredIncidentUuid: null }),

  /**
   * Définit la position du marqueur brouillon
   * @param {object|null} location - {lat, lng}
   */
  setDraftLocation: (location) => set({ draftLocation: location }),

  /**
   * Effacer la s\u00e9lection en cours et fermer le panneau de d\u00e9tail
   */
  clearSelection: () => set({
    selectedIncidentUuid: null,
    hoveredIncidentUuid: null,
    isDetailPanelOpen: false,
  }),

  /**
   * Stocker la référence à l'instance Leaflet
   * Permet aux composants extérieurs d'appeler flyTo, setView, etc.
   * @param {object|null} ref - Instance Leaflet map
   */
  setMapRef: (ref) => set((state) => ({ 
    mapRef: ref ?? state.mapRef 
  })),

  /**
   * Contr\u00f4ler la visibilit\u00e9 du panneau de d\u00e9tail
   * @param {boolean} isOpen - true pour afficher, false pour masquer
   */
  setDetailPanelOpen: (isOpen) => set({ isDetailPanelOpen: isOpen }),

  /**
   * D\u00e9finir le mode d'affichage du panneau de d\u00e9tail
   * @param {'side'|'bottom'} mode - 'side' pour desktop, 'bottom' pour mobile
   */
  setDetailPanelMode: (mode) => set({ detailPanelMode: mode }),

  /**
   * Mettre \u00e0 jour l'\u00e9tat de chargement de la carte
   * @param {boolean} loading - true si le chargement est en cours
   */
  setIsMapLoading: (loading) => set({ isMapLoading: loading }),
}));

export default useMapStore;
