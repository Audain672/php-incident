/**
 * Local Incident API
 * Mock incident API using localStorage for development/demo purposes
 * @module localIncidentApi
 */

import { incidentsStorage } from '../utils/localStorage.js';
import { INCIDENT_TYPES, INCIDENT_STATUS } from '../utils/constants.js';

/**
 * Mock incidents data generator
 */
const generateMockIncidents = () => {
  console.log('🎯 generateMockIncidents called');
  
  try {
    const incidents = [
      {
        id: '1',
        title: 'Feu de signalisation défectueux',
        description: 'Le feu de signalisation à l\'intersection ne fonctionne plus correctement, clignote constamment.',
        type: INCIDENT_TYPES.ACCIDENT.id,
        status: INCIDENT_STATUS.PENDING.id,
        latitude: 48.8566,
        longitude: 2.3522,
        address: 'Place de la Concorde, Paris',
        severity: 'medium',
        reportedBy: '1',
        createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        updatedAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        images: [],
        comments: [],
      },
      {
        id: '2',
        title: 'Nid-de-poule sur la chaussée',
        description: 'Un nid-de-poule important représente un danger pour les véhicules et les cyclistes.',
        type: INCIDENT_TYPES.ACCIDENT.id,
        status: INCIDENT_STATUS.IN_PROGRESS.id,
        latitude: 48.8606,
        longitude: 2.3376,
        address: 'Rue de Rivoli, Paris',
        severity: 'low',
        reportedBy: '2',
        createdAt: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
        updatedAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        images: [],
        comments: [],
      },
    ];

    console.log('📋 Mock incidents created:', incidents.length);

    // Initialize localStorage with mock data if empty
    const existingIncidents = incidentsStorage.getIncidents();
    console.log('📦 Existing incidents in localStorage:', existingIncidents.length);
    
    if (existingIncidents.length === 0) {
      console.log('💾 Storing mock incidents to localStorage...');
      const success = incidentsStorage.setIncidents(incidents);
      console.log('✅ Mock incidents stored successfully:', success);
    } else {
      console.log('ℹ️ Incidents already exist in localStorage');
    }

    return incidents;
  } catch (error) {
    console.error('❌ Error in generateMockIncidents:', error);
    return [];
  }
};

/**
 * Local incident API functions
 */
export const localIncidentApi = {
  /**
   * Get all incidents with optional filtering
   * @param {object} filters - Filter options
   * @returns {Promise<Array>} Array of incidents
   */
  getIncidents: async (filters = {}) => {
    console.log('🚀 getIncidents called with filters:', filters);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));

    try {
      // Ensure mock data exists
      console.log('📝 Calling generateMockIncidents...');
      generateMockIncidents();

      let incidents = incidentsStorage.getIncidents();
      console.log('🔍 LocalStorage incidents count:', incidents.length);
      console.log('📋 Filters applied:', filters);

      // Apply filters
      if (filters.type) {
        incidents = incidents.filter(inc => inc.type === filters.type);
      }

      if (filters.status) {
        incidents = incidents.filter(inc => inc.status === filters.status);
      }

      if (filters.severity) {
        incidents = incidents.filter(inc => inc.severity === filters.severity);
      }

      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        incidents = incidents.filter(inc => 
          inc.title.toLowerCase().includes(searchTerm) ||
          inc.description.toLowerCase().includes(searchTerm) ||
          inc.address.toLowerCase().includes(searchTerm)
        );
      }

      // Sort by creation date (newest first)
      incidents.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      const result = {
        incidents,
        pagination: {
          currentPage: filters.page || 1,
          totalPages: 1,
          totalItems: incidents.length,
          itemsPerPage: 20,
        },
      };

      console.log('✅ Returning incidents:', result);
      return result;
    } catch (error) {
      console.error('❌ Error in getIncidents:', error);
      throw error;
    }
  },

  /**
   * Get incident by ID
   * @param {string} id - Incident ID
   * @returns {Promise<object>} Incident data
   */
  getIncidentById: async (id) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 200));

    const incidents = incidentsStorage.getIncidents();
    const incident = incidents.find(inc => inc.id === id);

    if (!incident) {
      throw new Error('Incident non trouvé');
    }

    return incident;
  },

  /**
   * Create new incident
   * @param {object} incidentData - Incident data
   * @returns {Promise<object>} Created incident
   */
  createIncident: async (incidentData) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Ensure mock data exists
    generateMockIncidents();

    const newIncident = {
      ...incidentData,
      id: Date.now().toString(),
      status: INCIDENT_STATUS.REPORTED.id,
      severity: incidentData.severity || 'medium',
      reportedBy: '1', // Current user ID (in production, get from auth context)
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      images: incidentData.images || [],
      comments: [],
    };

    const success = incidentsStorage.addIncident(newIncident);
    if (!success) {
      throw new Error('Erreur lors de la création de l\'incident');
    }

    return newIncident;
  },

  /**
   * Update incident
   * @param {string} id - Incident ID
   * @param {object} updates - Updates to apply
   * @returns {Promise<object>} Updated incident
   */
  updateIncident: async (id, updates) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 400));

    const success = incidentsStorage.updateIncident(id, updates);
    if (!success) {
      throw new Error('Incident non trouvé ou erreur lors de la mise à jour');
    }

    const updatedIncident = await localIncidentApi.getIncidentById(id);
    return updatedIncident;
  },

  /**
   * Delete incident
   * @param {string} id - Incident ID
   * @returns {Promise<void>}
   */
  deleteIncident: async (id) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));

    const success = incidentsStorage.deleteIncident(id);
    if (!success) {
      throw new Error('Incident non trouvé ou erreur lors de la suppression');
    }
  },

  /**
   * Add comment to incident
   * @param {string} id - Incident ID
   * @param {object} commentData - Comment data
   * @returns {Promise<object>} Updated incident
   */
  addComment: async (id, commentData) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));

    const incident = await localIncidentApi.getIncidentById(id);
    const newComment = {
      id: Date.now().toString(),
      ...commentData,
      createdAt: new Date().toISOString(),
    };

    incident.comments.push(newComment);
    incident.updatedAt = new Date().toISOString();

    const success = incidentsStorage.updateIncident(id, { 
      comments: incident.comments,
      updatedAt: incident.updatedAt 
    });

    if (!success) {
      throw new Error('Erreur lors de l\'ajout du commentaire');
    }

    return incident;
  },

  /**
   * Update incident status
   * @param {string} id - Incident ID
   * @param {string} status - New status
   * @returns {Promise<object>} Updated incident
   */
  updateStatus: async (id, status) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 400));

    return localIncidentApi.updateIncident(id, { status });
  },

  /**
   * Get incident statistics
   * @returns {Promise<object>} Incident statistics
   */
  getStatistics: async () => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 200));

    const incidents = incidentsStorage.getIncidents();

    const stats = {
      total: incidents.length,
      byStatus: {},
      byType: {},
      bySeverity: {},
      recent: incidents.filter(inc => 
        new Date(inc.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      ).length,
    };

    // Calculate statistics by status
    Object.values(INCIDENT_STATUS).forEach(status => {
      stats.byStatus[status.id] = incidents.filter(inc => inc.status === status.id).length;
    });

    // Calculate statistics by type
    Object.values(INCIDENT_TYPES).forEach(type => {
      stats.byType[type.id] = incidents.filter(inc => inc.type === type.id).length;
    });

    // Calculate statistics by severity
    ['low', 'medium', 'high'].forEach(severity => {
      stats.bySeverity[severity] = incidents.filter(inc => inc.severity === severity).length;
    });

    return stats;
  },
};

// Named exports for compatibility with existing hooks
export const fetchIncidents = localIncidentApi.getIncidents;
export const fetchIncidentById = localIncidentApi.getIncidentById;
export const createIncident = localIncidentApi.createIncident;
export const updateIncident = localIncidentApi.updateIncident;
export const deleteIncident = localIncidentApi.deleteIncident;
export const getIncidentStats = localIncidentApi.getStats;
export const searchIncidents = localIncidentApi.searchIncidents;
export const getNearbyIncidents = localIncidentApi.getNearbyIncidents;
export const getUserIncidents = localIncidentApi.getUserIncidents;

export default localIncidentApi;
