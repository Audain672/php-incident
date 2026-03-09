/**
 * Create Incident Hook
 * React Query mutation hook for creating incidents with cache invalidation
 * @module useCreateIncident
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createIncident } from '../api/localIncidentApi.js';
import { useInvalidateIncidents } from './useIncidents.js';
import useMapStore from '../store/useMapStore.js';

/**
 * Hook for creating incidents
 * @param {object} [options] - Mutation options
 * @returns {object} Mutation result with create methods
 */
export const useCreateIncident = (options = {}) => {
  const queryClient = useQueryClient();
  const { invalidateAll, invalidateList, invalidateStats } = useInvalidateIncidents();
  const { setIsFormOpen, resetMapState } = useMapStore();

  return useMutation({
    mutationFn: ({ incidentData, imageFile = null }) => {
      return createIncident(incidentData, imageFile);
    },
    onMutate: async ({ incidentData }) => {
      // Cancel any ongoing refetches
      await queryClient.cancelQueries({ queryKey: ['incidents'] });

      // Snapshot the previous value
      const previousIncidents = queryClient.getQueryData(['incidents', 'list']);

      // Optimistically update the cache if we have previous data
      if (previousIncidents) {
        const optimisticIncident = {
          id: `temp-${Date.now()}`, // Temporary ID
          ...incidentData,
          createdAt: new Date().toISOString(),
          status: 'pending',
          // Add any other default fields
        };

        queryClient.setQueryData(['incidents', 'list'], (old) => ({
          ...old,
          incidents: [optimisticIncident, ...(old.incidents || [])],
          pagination: {
            ...old.pagination,
            totalItems: (old.pagination?.totalItems || 0) + 1,
          },
        }));
      }

      // Return context for rollback
      return { previousIncidents };
    },
    onError: (error, variables, context) => {
      // Rollback to previous value on error
      if (context?.previousIncidents) {
        queryClient.setQueryData(['incidents', 'list'], context.previousIncidents);
      }
      
      console.error('Failed to create incident:', error);
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch all incident-related queries
      invalidateAll();
      
      // Close the form and reset map state
      setIsFormOpen(false);
      
      // Optionally pan to the created incident location
      if (data.incident?.latitude && data.incident?.longitude) {
        useMapStore.getState().panTo(
          data.incident.latitude,
          data.incident.longitude,
          16
        );
      }

      console.log('Incident created successfully:', data);
    },
    onSettled: () => {
      // Always refetch after mutation completes (success or error)
      invalidateList();
    },
    ...options,
  });
};

/**
 * Hook for creating incidents with optimistic updates
 * @param {object} [options] - Mutation options
 * @returns {object} Enhanced mutation result
 */
export const useCreateIncidentOptimistic = (options = {}) => {
  const queryClient = useQueryClient();
  const { invalidateAll } = useInvalidateIncidents();
  const { setIsFormOpen, getQueryFilters } = useMapStore();

  return useMutation({
    mutationFn: ({ incidentData, imageFile = null }) => {
      return createIncident(incidentData, imageFile);
    },
    onMutate: async ({ incidentData }) => {
      // Cancel any ongoing refetches
      await queryClient.cancelQueries({ queryKey: ['incidents'] });

      // Get current filters
      const currentFilters = getQueryFilters();

      // Snapshot the previous value
      const previousIncidents = queryClient.getQueryData(['incidents', 'list', currentFilters]);

      // Create optimistic incident
      const optimisticIncident = {
        id: `optimistic-${Date.now()}`,
        ...incidentData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'pending',
        user: {
          id: 'current-user',
          firstName: 'Vous',
          lastName: '',
        },
        _optimistic: true, // Flag for optimistic updates
      };

      // Optimistically update the cache
      queryClient.setQueryData(['incidents', 'list', currentFilters], (old) => {
        if (!old) return old;

        return {
          ...old,
          incidents: [optimisticIncident, ...(old.incidents || [])],
          pagination: {
            ...old.pagination,
            totalItems: (old.pagination?.totalItems || 0) + 1,
          },
        };
      });

      return { previousIncidents, optimisticIncident, currentFilters };
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousIncidents) {
        queryClient.setQueryData(
          ['incidents', 'list', context.currentFilters],
          context.previousIncidents
        );
      }

      console.error('Failed to create incident:', error);
    },
    onSuccess: (data, variables, context) => {
      // Remove optimistic update and add real data
      const { optimisticIncident, currentFilters } = context || {};

      queryClient.setQueryData(['incidents', 'list', currentFilters], (old) => {
        if (!old) return old;

        // Remove optimistic incident
        const filteredIncidents = (old.incidents || []).filter(
          incident => !incident._optimistic
        );

        // Add the real incident
        return {
          ...old,
          incidents: [data.incident || data, ...filteredIncidents],
          pagination: {
            ...old.pagination,
            totalItems: Math.max((old.pagination?.totalItems || 0), filteredIncidents.length + 1),
          },
        };
      });

      // Invalidate other queries
      invalidateAll();

      // Close form
      setIsFormOpen(false);

      console.log('Incident created successfully:', data);
    },
    onSettled: () => {
      // Ensure data is fresh
      queryClient.invalidateQueries({ queryKey: ['incidents', 'list'] });
    },
    ...options,
  });
};

/**
 * Hook for incident form handling
 * @param {object} [options] - Form options
 * @returns {object} Form handling methods and state
 */
export const useIncidentForm = (options = {}) => {
  const createMutation = useCreateIncident(options);
  const { setIsFormOpen } = useMapStore();

  /**
   * Handle incident form submission
   * @param {object} formData - Form data
   * @param {File|null} [imageFile] - Optional image file
   * @returns {Promise} Form submission result
   */
  const handleSubmit = async (formData, imageFile = null) => {
    try {
      const result = await createMutation.mutateAsync({
        incidentData: formData,
        imageFile,
      });
      
      return { success: true, data: result };
    } catch (error) {
      return { 
        success: false, 
        error: error.message || 'Échec de la création de l\'incident' 
      };
    }
  };

  /**
   * Cancel form and close it
   */
  const handleCancel = () => {
    setIsFormOpen(false);
  };

  return {
    handleSubmit,
    handleCancel,
    isCreating: createMutation.isPending,
    error: createMutation.error,
    reset: createMutation.reset,
  };
};

/**
 * Hook for quick incident creation (with minimal data)
 * @param {object} [options] - Mutation options
 * @returns {object} Quick creation methods
 */
export const useQuickCreateIncident = (options = {}) => {
  const mutation = useCreateIncident(options);

  /**
   * Create incident with minimal required data
   * @param {object} quickData - Quick incident data
   * @param {string} quickData.title - Incident title
   * @param {string} quickData.type - Incident type
   * @param {number} quickData.latitude - Latitude
   * @param {number} quickData.longitude - Longitude
   * @param {File|null} [imageFile] - Optional image file
   * @returns {Promise} Creation result
   */
  const quickCreate = async (quickData, imageFile = null) => {
    const minimalData = {
      title: quickData.title,
      type: quickData.type,
      severity: quickData.severity || 'medium',
      description: quickData.description || '',
      latitude: quickData.latitude,
      longitude: quickData.longitude,
      locationName: quickData.locationName || null,
    };

    return mutation.mutateAsync({
      incidentData: minimalData,
      imageFile,
    });
  };

  return {
    quickCreate,
    isCreating: mutation.isPending,
    error: mutation.error,
    reset: mutation.reset,
  };
};

export default useCreateIncident;
