/**
 * Incident API functions
 * Pure functions for incident CRUD operations
 * @module incidentApi
 */

import apiClient from './apiClient.js';
import { createFormData, handleApiResponse } from './apiClient.js';

/**
 * Fetch incidents with pagination and filtering
 * @param {object} [params] - Query parameters
 * @param {number} [params.page=1] - Page number
 * @param {number} [params.limit=20] - Items per page
 * @param {string} [params.type] - Filter by incident type
 * @param {string} [params.severity] - Filter by severity level
 * @param {string} [params.status] - Filter by status
 * @param {string} [params.search] - Search term
 * @param {string} [params.dateFrom] - Filter incidents from date (ISO string)
 * @param {string} [params.dateTo] - Filter incidents to date (ISO string)
 * @param {number} [params.latitude] - Filter by latitude (with radius)
 * @param {number} [params.longitude] - Filter by longitude (with radius)
 * @param {number} [params.radius] - Radius in kilometers for location filter
 * @returns {Promise<object>} Promise that resolves with paginated incidents
 */
export const fetchIncidents = async (params = {}) => {
  const {
    page = 1,
    limit = 20,
    type,
    severity,
    status,
    search,
    dateFrom,
    dateTo,
    latitude,
    longitude,
    radius,
  } = params;

  const queryParams = new URLSearchParams();
  
  // Add pagination
  queryParams.append('page', page.toString());
  queryParams.append('limit', limit.toString());
  
  // Add filters if provided
  if (type) queryParams.append('type', type);
  if (severity) queryParams.append('severity', severity);
  if (status) queryParams.append('status', status);
  if (search) queryParams.append('search', search);
  if (dateFrom) queryParams.append('dateFrom', dateFrom);
  if (dateTo) queryParams.append('dateTo', dateTo);
  if (latitude) queryParams.append('latitude', latitude.toString());
  if (longitude) queryParams.append('longitude', longitude.toString());
  if (radius) queryParams.append('radius', radius.toString());

  const apiCall = apiClient.get(`/incidents?${queryParams.toString()}`);
  return handleApiResponse(apiCall);
};

/**
 * Fetch a single incident by ID
 * @param {string|number} id - Incident ID
 * @returns {Promise<object>} Promise that resolves with incident data
 */
export const fetchIncidentById = async (id) => {
  const apiCall = apiClient.get(`/incidents/${id}`);
  return handleApiResponse(apiCall);
};

/**
 * Create a new incident
 * @param {object} incidentData - Incident data
 * @param {string} incidentData.title - Incident title
 * @param {string} incidentData.description - Incident description
 * @param {string} incidentData.type - Incident type
 * @param {string} incidentData.severity - Severity level
 * @param {number} incidentData.latitude - Latitude coordinate
 * @param {number} incidentData.longitude - Longitude coordinate
 * @param {string} [incidentData.locationName] - Location name
 * @param {File|null} [imageFile] - Optional image file
 * @returns {Promise<object>} Promise that resolves with created incident
 */
export const createIncident = async (incidentData, imageFile = null) => {
  // If there's an image file, use FormData
  if (imageFile) {
    const formData = createFormData(incidentData, imageFile);
    const apiCall = apiClient.post('/incidents', formData);
    return handleApiResponse(apiCall);
  }
  
  // Otherwise, send as JSON
  const apiCall = apiClient.post('/incidents', incidentData);
  return handleApiResponse(apiCall);
};

/**
 * Update an existing incident
 * @param {string|number} id - Incident ID
 * @param {object} incidentData - Updated incident data
 * @param {string} [incidentData.title] - Updated title
 * @param {string} [incidentData.description] - Updated description
 * @param {string} [incidentData.type] - Updated type
 * @param {string} [incidentData.severity] - Updated severity
 * @param {string} [incidentData.status] - Updated status
 * @param {number} [incidentData.latitude] - Updated latitude
 * @param {number} [incidentData.longitude] - Updated longitude
 * @param {string} [incidentData.locationName] - Updated location name
 * @param {File|null} [imageFile] - Optional new image file
 * @returns {Promise<object>} Promise that resolves with updated incident
 */
export const updateIncident = async (id, incidentData, imageFile = null) => {
  // If there's an image file, use FormData
  if (imageFile) {
    const formData = createFormData(incidentData, imageFile);
    const apiCall = apiClient.post(`/incidents/${id}`, formData); // POST for FormData
    return handleApiResponse(apiCall);
  }
  
  // Otherwise, send as JSON with PUT
  const apiCall = apiClient.put(`/incidents/${id}`, incidentData);
  return handleApiResponse(apiCall);
};

/**
 * Delete an incident
 * @param {string|number} id - Incident ID
 * @returns {Promise<object>} Promise that resolves with deletion response
 */
export const deleteIncident = async (id) => {
  const apiCall = apiClient.delete(`/incidents/${id}`);
  return handleApiResponse(apiCall);
};

/**
 * Upload an image for an incident
 * @param {string|number} id - Incident ID
 * @param {File} imageFile - Image file to upload
 * @returns {Promise<object>} Promise that resolves with upload response
 */
export const uploadIncidentImage = async (id, imageFile) => {
  const formData = new FormData();
  formData.append('image', imageFile);
  
  const apiCall = apiClient.post(`/incidents/${id}/image`, formData);
  return handleApiResponse(apiCall);
};

/**
 * Delete an incident image
 * @param {string|number} id - Incident ID
 * @returns {Promise<object>} Promise that resolves with deletion response
 */
export const deleteIncidentImage = async (id) => {
  const apiCall = apiClient.delete(`/incidents/${id}/image`);
  return handleApiResponse(apiCall);
};

/**
 * Get incidents statistics
 * @param {object} [params] - Optional filter parameters
 * @param {string} [params.dateFrom] - Filter from date
 * @param {string} [params.dateTo] - Filter to date
 * @returns {Promise<object>} Promise that resolves with statistics
 */
export const getIncidentStats = async (params = {}) => {
  const { dateFrom, dateTo } = params;
  
  let url = '/incidents/stats';
  const queryParams = new URLSearchParams();
  
  if (dateFrom) queryParams.append('dateFrom', dateFrom);
  if (dateTo) queryParams.append('dateTo', dateTo);
  
  if (queryParams.toString()) {
    url += `?${queryParams.toString()}`;
  }
  
  const apiCall = apiClient.get(url);
  return handleApiResponse(apiCall);
};

/**
 * Get incidents near a specific location
 * @param {number} latitude - Latitude coordinate
 * @param {number} longitude - Longitude coordinate
 * @param {number} [radius=5] - Search radius in kilometers
 * @param {object} [filters] - Additional filters
 * @returns {Promise<object>} Promise that resolves with nearby incidents
 */
export const getNearbyIncidents = async (latitude, longitude, radius = 5, filters = {}) => {
  const queryParams = new URLSearchParams();
  queryParams.append('latitude', latitude.toString());
  queryParams.append('longitude', longitude.toString());
  queryParams.append('radius', radius.toString());
  
  // Add additional filters
  Object.keys(filters).forEach(key => {
    if (filters[key]) {
      queryParams.append(key, filters[key]);
    }
  });
  
  const apiCall = apiClient.get(`/incidents/nearby?${queryParams.toString()}`);
  return handleApiResponse(apiCall);
};

/**
 * Get incidents by user
 * @param {string|number} userId - User ID
 * @param {object} [params] - Pagination and filter parameters
 * @returns {Promise<object>} Promise that resolves with user incidents
 */
export const getUserIncidents = async (userId, params = {}) => {
  const { page = 1, limit = 20, status, type } = params;
  
  const queryParams = new URLSearchParams();
  queryParams.append('page', page.toString());
  queryParams.append('limit', limit.toString());
  
  if (status) queryParams.append('status', status);
  if (type) queryParams.append('type', type);
  
  const apiCall = apiClient.get(`/incidents/user/${userId}?${queryParams.toString()}`);
  return handleApiResponse(apiCall);
};

/**
 * Report an incident (anonymous or authenticated)
 * @param {object} incidentData - Incident data
 * @param {string} incidentData.title - Incident title
 * @param {string} incidentData.description - Incident description
 * @param {string} incidentData.type - Incident type
 * @param {string} incidentData.severity - Severity level
 * @param {number} incidentData.latitude - Latitude coordinate
 * @param {number} incidentData.longitude - Longitude coordinate
 * @param {string} [incidentData.locationName] - Location name
 * @param {string} [incidentData.reporterName] - Reporter name (for anonymous reports)
 * @param {string} [incidentData.reporterEmail] - Reporter email (for anonymous reports)
 * @param {File|null} [imageFile] - Optional image file
 * @returns {Promise<object>} Promise that resolves with report response
 */
export const reportIncident = async (incidentData, imageFile = null) => {
  // If there's an image file, use FormData
  if (imageFile) {
    const formData = createFormData(incidentData, imageFile);
    const apiCall = apiClient.post('/incidents/report', formData);
    return handleApiResponse(apiCall);
  }
  
  // Otherwise, send as JSON
  const apiCall = apiClient.post('/incidents/report', incidentData);
  return handleApiResponse(apiCall);
};

/**
 * Get incident categories/types
 * @returns {Promise<object>} Promise that resolves with available incident types
 */
export const getIncidentTypes = async () => {
  const apiCall = apiClient.get('/categories');
  return handleApiResponse(apiCall);
};

/**
 * Search incidents by text query
 * @param {string} query - Search query
 * @param {object} [params] - Additional search parameters
 * @param {number} [params.page=1] - Page number
 * @param {number} [params.limit=20] - Items per page
 * @returns {Promise<object>} Promise that resolves with search results
 */
export const searchIncidents = async (query, params = {}) => {
  const { page = 1, limit = 20 } = params;
  
  const queryParams = new URLSearchParams();
  queryParams.append('q', query);
  queryParams.append('page', page.toString());
  queryParams.append('limit', limit.toString());
  
  const apiCall = apiClient.get(`/incidents/search?${queryParams.toString()}`);
  return handleApiResponse(apiCall);
};

// Aliases for compatibility with useDynamicIncidents
export const getIncidents = fetchIncidents;
export const getIncidentById = fetchIncidentById;

