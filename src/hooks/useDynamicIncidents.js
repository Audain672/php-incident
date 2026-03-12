/**
 * Dynamic Incidents Hook
 * Automatically switches between localStorage and real API based on configuration
 * @module useDynamicIncidents
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getIncidentApi, isLocalMode, debugLog } from '../config/apiConfig.js';
import useMapStore from '../store/useMapStore.js';

/**
 * Hook for fetching incidents list with dynamic API switching
 * @param {object} [options] - Query options
 * @returns {object} Query result with incidents data
 */
export const useDynamicIncidents = (options = {}) => {
  const { 
    enabled = true, 
    staleTime = 60 * 1000,
    ...queryOptions 
  } = options;

  const getQueryFilters = useMapStore((state) => state.getQueryFilters);
  const filters = getQueryFilters();

  return useQuery({
    queryKey: ['incidents', 'list', filters],
    queryFn: async () => {
      const incidentApi = await getIncidentApi();
      debugLog('Fetching incidents', { filters, mode: isLocalMode() ? 'local' : 'api' });
      return incidentApi.getIncidents(filters);
    },
    enabled: enabled, // Remove the filter condition to always fetch
    staleTime,
    retry: (failureCount, error) => {
      debugLog('Incidents query retry', { failureCount, error });
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
 * Hook for fetching a single incident with dynamic API switching
 * @param {string|number} id - Incident ID
 * @param {object} [options] - Query options
 * @returns {object} Query result with incident data
 */
export const useDynamicIncident = (id, options = {}) => {
  const { 
    enabled = true, 
    staleTime = 5 * 60 * 1000,
    ...queryOptions 
  } = options;

  return useQuery({
    queryKey: ['incidents', 'detail', id],
    queryFn: async () => {
      const incidentApi = await getIncidentApi();
      debugLog('Fetching incident', { id, mode: isLocalMode() ? 'local' : 'api' });
      return incidentApi.getIncidentById(id);
    },
    enabled: enabled && !!id,
    staleTime,
    retry: (failureCount, error) => {
      debugLog('Incident query retry', { id, failureCount, error });
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
 * Hook for creating incidents with dynamic API switching
 * @param {object} [options] - Mutation options
 * @returns {object} Mutation result with create methods
 */
export const useDynamicCreateIncident = (options = {}) => {
  const queryClient = useQueryClient();
  const { invalidateAll, invalidateList, invalidateStats } = useDynamicInvalidateIncidents();

  return useMutation({
    mutationFn: async (incidentData) => {
      const incidentApi = await getIncidentApi();
      debugLog('Creating incident', { incidentData, mode: isLocalMode() ? 'local' : 'api' });
      return incidentApi.createIncident(incidentData);
    },
    onMutate: async (newIncident) => {
      // Cancel any ongoing refetches
      await queryClient.cancelQueries({ queryKey: ['incidents'] });

      // Snapshot the previous value
      const previousIncidents = queryClient.getQueryData(['incidents', 'list']);

      // Optimistically add to the list
      if (previousIncidents) {
        queryClient.setQueryData(['incidents', 'list'], (old) => {
          if (!old) return old;
          
          const tempIncident = {
            ...newIncident,
            id: `temp-${Date.now()}`, // Temporary ID
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            status: 'pending',
          };

          return {
            ...old,
            incidents: [tempIncident, ...(old.incidents || [])],
            pagination: {
              ...old.pagination,
              totalItems: (old.pagination?.totalItems || 0) + 1,
            },
          };
        });
      }

      return { previousIncidents };
    },
    onError: (error, newIncident, context) => {
      // Rollback on error
      if (context?.previousIncidents) {
        queryClient.setQueryData(['incidents', 'list'], context.previousIncidents);
      }
      debugLog('Create incident failed', { error, newIncident });
      console.error('Failed to create incident:', error);
    },
    onSuccess: (data, variables) => {
      debugLog('Create incident success', { data, variables });
      // Invalidate all incident-related queries
      invalidateAll();
    },
    onSettled: () => {
      // Always refetch after mutation completes
      invalidateList();
    },
    ...options,
  });
};

/**
 * Hook for deleting incidents with dynamic API switching
 * @param {object} [options] - Mutation options
 * @returns {object} Mutation result with delete methods
 */
export const useDynamicDeleteIncident = (options = {}) => {
  const queryClient = useQueryClient();
  const { invalidateAll, invalidateList, invalidateStats } = useDynamicInvalidateIncidents();
  const { setSelectedIncident } = useMapStore();

  return useMutation({
    mutationFn: async (incidentId) => {
      const incidentApi = await getIncidentApi();
      debugLog('Deleting incident', { incidentId, mode: isLocalMode() ? 'local' : 'api' });
      return incidentApi.deleteIncident(incidentId);
    },
    onMutate: async (incidentId) => {
      // Cancel any ongoing refetches
      await queryClient.cancelQueries({ queryKey: ['incidents'] });

      // Snapshot the previous value
      const previousIncidents = queryClient.getQueryData(['incidents', 'list']);
      const previousIncident = queryClient.getQueryData(['incidents', 'detail', incidentId]);

      // Optimistically remove the incident from the list
      if (previousIncidents) {
        queryClient.setQueryData(['incidents', 'list'], (old) => {
          if (!old) return old;

          return {
            ...old,
            incidents: (old.incidents || []).filter(incident => incident.id !== incidentId),
            pagination: {
              ...old.pagination,
              totalItems: Math.max(0, (old.pagination?.totalItems || 0) - 1),
            },
          };
        });
      }

      // Optimistically remove the incident detail
      if (previousIncident) {
        queryClient.setQueryData(['incidents', 'detail', incidentId], null);
      }

      // Return context for rollback
      return { previousIncidents, previousIncident, incidentId };
    },
    onError: (error, incidentId, context) => {
      // Rollback to previous value on error
      if (context?.previousIncidents) {
        queryClient.setQueryData(['incidents', 'list'], context.previousIncidents);
      }
      if (context?.previousIncident) {
        queryClient.setQueryData(['incidents', 'detail', context.incidentId], context.previousIncident);
      }
      debugLog('Delete incident failed', { error, incidentId });
      console.error('Failed to delete incident:', error);
    },
    onSuccess: (data, incidentId) => {
      debugLog('Delete incident success', { data, incidentId });
      // Invalidate all incident-related queries
      invalidateAll();
      
      // Clear selected incident if it was the deleted one
      setSelectedIncident(null);
    },
    onSettled: () => {
      // Always refetch after mutation completes (success or error)
      invalidateList();
    },
    ...options,
  });
};

/**
 * Hook to invalidate incidents cache with dynamic API switching
 * @returns {object} Cache invalidation methods
 */
export const useDynamicInvalidateIncidents = () => {
  const queryClient = useQueryClient();

  /**
   * Invalidate all incidents queries
   */
  const invalidateAll = () => {
    debugLog('Invalidating all incidents queries');
    queryClient.invalidateQueries({ queryKey: ['incidents'] });
  };

  /**
   * Invalidate incidents list
   */
  const invalidateList = () => {
    debugLog('Invalidating incidents list');
    queryClient.invalidateQueries({ queryKey: ['incidents', 'list'] });
  };

  /**
   * Invalidate specific incident
   * @param {string|number} id - Incident ID
   */
  const invalidateIncident = (id) => {
    debugLog('Invalidating incident', { id });
    queryClient.invalidateQueries({ queryKey: ['incidents', 'detail', id] });
  };

  /**
   * Invalidate statistics
   */
  const invalidateStats = () => {
    debugLog('Invalidating incidents stats');
    queryClient.invalidateQueries({ queryKey: ['incidents', 'stats'] });
  };

  /**
   * Prefetch incidents data
   * @param {object} [filters] - Filters to prefetch
   */
  const prefetchIncidents = async (filters = {}) => {
    debugLog('Prefetching incidents', { filters });
    const incidentApi = await getIncidentApi();
    queryClient.prefetchQuery({
      queryKey: ['incidents', 'list', filters],
      queryFn: () => incidentApi.getIncidents(filters),
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

export default useDynamicIncidents;
