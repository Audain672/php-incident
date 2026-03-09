/**
 * Incidents Hook
 * React Query hook for fetching incidents with caching and invalidation
 * @module useIncidents
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchIncidents, fetchIncidentById } from '../api/localIncidentApi.js';
import useMapStore from '../store/useMapStore.js';

/**
 * Hook for fetching incidents list
 * @param {object} [options] - Query options
 * @param {boolean} [options.enabled=true] - Whether the query should be enabled
 * @param {number} [options.staleTime=60000] - Time in ms that data remains fresh
 * @returns {object} Query result with incidents data
 */
export const useIncidents = (options = {}) => {
  const { 
    enabled = true, 
    staleTime = 60 * 1000, // 60 seconds as requested
    ...queryOptions 
  } = options;

  const getQueryFilters = useMapStore((state) => state.getQueryFilters);
  const filters = getQueryFilters();

  return useQuery({
    queryKey: ['incidents', 'list', filters],
    queryFn: () => fetchIncidents(filters),
    enabled: enabled && Object.keys(filters).length > 0,
    staleTime,
    retry: (failureCount, error) => {
      // Don't retry on 404 errors (no results)
      if (error.response?.status === 404) {
        return false;
      }
      // Retry up to 2 times for other errors
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
    select: (data) => {
      // Transform data if needed
      return {
        ...data,
        incidents: data.incidents || data.data || [],
        pagination: data.pagination || data.meta || {
          currentPage: data.page || 1,
          totalPages: data.totalPages || 1,
          totalItems: data.total || data.totalItems || 0,
          itemsPerPage: data.limit || data.itemsPerPage || 20,
        },
      };
    },
    ...queryOptions,
  });
};

/**
 * Hook for fetching a single incident
 * @param {string|number} id - Incident ID
 * @param {object} [options] - Query options
 * @param {boolean} [options.enabled=true] - Whether the query should be enabled
 * @param {number} [options.staleTime=300000] - Time in ms that data remains fresh (5 minutes)
 * @returns {object} Query result with incident data
 */
export const useIncident = (id, options = {}) => {
  const { 
    enabled = true, 
    staleTime = 5 * 60 * 1000, // 5 minutes
    ...queryOptions 
  } = options;

  return useQuery({
    queryKey: ['incidents', 'detail', id],
    queryFn: () => fetchIncidentById(id),
    enabled: enabled && !!id,
    staleTime,
    retry: (failureCount, error) => {
      // Don't retry on 404 errors (incident not found)
      if (error.response?.status === 404) {
        return false;
      }
      return failureCount < 2;
    },
    select: (data) => {
      // Ensure consistent data structure
      return data.incident || data.data || data;
    },
    ...queryOptions,
  });
};

/**
 * Hook for fetching incidents with real-time updates
 * @param {object} [options] - Query options
 * @param {number} [options.refetchInterval=30000] - Refetch interval in ms (30 seconds)
 * @returns {object} Query result with real-time incidents data
 */
export const useRealTimeIncidents = (options = {}) => {
  const { refetchInterval = 30 * 1000, ...queryOptions } = options;

  return useIncidents({
    refetchInterval,
    staleTime: 10 * 1000, // Shorter stale time for real-time
    ...queryOptions,
  });
};

/**
 * Hook for incidents statistics
 * @param {object} [params] - Statistics parameters
 * @param {string} [params.dateFrom] - Start date filter
 * @param {string} [params.dateTo] - End date filter
 * @param {object} [options] - Query options
 * @returns {object} Query result with statistics
 */
export const useIncidentStats = (params = {}, options = {}) => {
  const { staleTime = 5 * 60 * 1000, ...queryOptions } = options;

  return useQuery({
    queryKey: ['incidents', 'stats', params],
    queryFn: () => {
      // Import here to avoid circular dependencies
      return import('../api/localIncidentApi.js').then(({ getIncidentStats }) => 
        getIncidentStats(params)
      );
    },
    staleTime,
    enabled: true,
    ...queryOptions,
  });
};

/**
 * Hook for searching incidents
 * @param {string} query - Search query
 * @param {object} [params] - Additional search parameters
 * @param {object} [options] - Query options
 * @returns {object} Query result with search results
 */
export const useSearchIncidents = (query, params = {}, options = {}) => {
  const { 
    enabled = true, 
    staleTime = 2 * 60 * 1000, // 2 minutes for search results
    ...queryOptions 
  } = options;

  return useQuery({
    queryKey: ['incidents', 'search', query, params],
    queryFn: () => {
      // Import here to avoid circular dependencies
      return import('../api/localIncidentApi.js').then(({ searchIncidents }) => 
        searchIncidents(query, params)
      );
    },
    enabled: enabled && query.trim().length > 0,
    staleTime,
    retry: false, // Don't retry search queries automatically
    ...queryOptions,
  });
};

/**
 * Hook for incidents near a location
 * @param {number} latitude - Latitude
 * @param {number} longitude - Longitude
 * @param {number} [radius=5] - Search radius in km
 * @param {object} [filters] - Additional filters
 * @param {object} [options] - Query options
 * @returns {object} Query result with nearby incidents
 */
export const useNearbyIncidents = (latitude, longitude, radius = 5, filters = {}, options = {}) => {
  const { 
    enabled = true, 
    staleTime = 60 * 1000, // 1 minute for location-based data
    ...queryOptions 
  } = options;

  return useQuery({
    queryKey: ['incidents', 'nearby', { latitude, longitude, radius, ...filters }],
    queryFn: () => {
      // Import here to avoid circular dependencies
      return import('../api/localIncidentApi.js').then(({ getNearbyIncidents }) => 
        getNearbyIncidents(latitude, longitude, radius, filters)
      );
    },
    enabled: enabled && latitude && longitude,
    staleTime,
    ...queryOptions,
  });
};

/**
 * Hook for user's incidents
 * @param {string|number} userId - User ID
 * @param {object} [params] - Query parameters
 * @param {object} [options] - Query options
 * @returns {object} Query result with user incidents
 */
export const useUserIncidents = (userId, params = {}, options = {}) => {
  const { 
    enabled = true, 
    staleTime = 2 * 60 * 1000, // 2 minutes for user data
    ...queryOptions 
  } = options;

  return useQuery({
    queryKey: ['incidents', 'user', userId, params],
    queryFn: () => {
      // Import here to avoid circular dependencies
      return import('../api/localIncidentApi.js').then(({ getUserIncidents }) => 
        getUserIncidents(userId, params)
      );
    },
    enabled: enabled && !!userId,
    staleTime,
    ...queryOptions,
  });
};

/**
 * Hook to invalidate incidents cache
 * @returns {object} Cache invalidation methods
 */
export const useInvalidateIncidents = () => {
  const queryClient = useQueryClient();

  /**
   * Invalidate all incidents queries
   */
  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ['incidents'] });
  };

  /**
   * Invalidate incidents list
   */
  const invalidateList = () => {
    queryClient.invalidateQueries({ queryKey: ['incidents', 'list'] });
  };

  /**
   * Invalidate specific incident
   * @param {string|number} id - Incident ID
   */
  const invalidateIncident = (id) => {
    queryClient.invalidateQueries({ queryKey: ['incidents', 'detail', id] });
  };

  /**
   * Invalidate statistics
   */
  const invalidateStats = () => {
    queryClient.invalidateQueries({ queryKey: ['incidents', 'stats'] });
  };

  /**
   * Prefetch incidents data
   * @param {object} [filters] - Filters to prefetch
   */
  const prefetchIncidents = (filters = {}) => {
    queryClient.prefetchQuery({
      queryKey: ['incidents', 'list', filters],
      queryFn: () => fetchIncidents(filters),
      staleTime: 60 * 1000,
    });
  };

  return {
    invalidateAll,
    invalidateList,
    invalidateIncident,
    invalidateStats,
    prefetchIncidents,
  };
};

export default useIncidents;
