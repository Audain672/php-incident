/**
 * Delete Incident Hook
 * React Query mutation hook for deleting incidents with cache invalidation
 * @module useDeleteIncident
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteIncident } from '../api/localIncidentApi.js';
import { useInvalidateIncidents } from './useIncidents.js';
import useMapStore from '../store/useMapStore.js';

/**
 * Hook for deleting incidents
 * @param {object} [options] - Mutation options
 * @returns {object} Mutation result with delete methods
 */
export const useDeleteIncident = (options = {}) => {
  const queryClient = useQueryClient();
  const { invalidateAll, invalidateList, invalidateStats } = useInvalidateIncidents();
  const { setSelectedIncident } = useMapStore();

  return useMutation({
    mutationFn: (incidentId) => {
      return deleteIncident(incidentId);
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

      console.error('Failed to delete incident:', error);
    },
    onSuccess: (data, incidentId) => {
      // Invalidate all incident-related queries
      invalidateAll();
      
      // Clear selected incident if it was the deleted one
      setSelectedIncident(null);

      console.log('Incident deleted successfully:', incidentId);
    },
    onSettled: () => {
      // Always refetch after mutation completes (success or error)
      invalidateList();
    },
    ...options,
  });
};

/**
 * Hook for deleting incidents with confirmation
 * @param {object} [options] - Mutation options
 * @returns {object} Enhanced mutation result with confirmation
 */
export const useDeleteIncidentWithConfirmation = (options = {}) => {
  const deleteMutation = useDeleteIncident(options);
  const { setSelectedIncident } = useMapStore();

  /**
   * Delete incident with confirmation
   * @param {string|number} incidentId - Incident ID to delete
   * @param {string} [confirmationMessage] - Custom confirmation message
   * @returns {Promise} Deletion result
   */
  const deleteWithConfirmation = async (incidentId, confirmationMessage = null) => {
    const message = confirmationMessage || 
      'Êtes-vous sûr de vouloir supprimer cet incident ? Cette action est irréversible.';

    // Show confirmation dialog
    const confirmed = window.confirm(message);
    
    if (!confirmed) {
      return { success: false, cancelled: true };
    }

    try {
      const result = await deleteMutation.mutateAsync(incidentId);
      return { success: true, data: result };
    } catch (error) {
      return { 
        success: false, 
        error: error.message || 'Échec de la suppression de l\'incident' 
      };
    }
  };

  return {
    deleteWithConfirmation,
    isDeleting: deleteMutation.isPending,
    error: deleteMutation.error,
    reset: deleteMutation.reset,
  };
};

/**
 * Hook for batch deleting incidents
 * @param {object} [options] - Mutation options
 * @returns {object} Batch deletion methods
 */
export const useBatchDeleteIncidents = (options = {}) => {
  const queryClient = useQueryClient();
  const { invalidateAll } = useInvalidateIncidents();
  const { setSelectedIncident } = useMapStore();

  return useMutation({
    mutationFn: async (incidentIds) => {
      // Delete incidents one by one (or implement batch delete API)
      const deletePromises = incidentIds.map(id => deleteIncident(id));
      return Promise.all(deletePromises);
    },
    onMutate: async (incidentIds) => {
      // Cancel any ongoing refetches
      await queryClient.cancelQueries({ queryKey: ['incidents'] });

      // Snapshot the previous value
      const previousIncidents = queryClient.getQueryData(['incidents', 'list']);

      // Optimistically remove incidents from the list
      if (previousIncidents) {
        queryClient.setQueryData(['incidents', 'list'], (old) => {
          if (!old) return old;

          return {
            ...old,
            incidents: (old.incidents || []).filter(incident => 
              !incidentIds.includes(incident.id)
            ),
            pagination: {
              ...old.pagination,
              totalItems: Math.max(0, (old.pagination?.totalItems || 0) - incidentIds.length),
            },
          };
        });
      }

      // Clear selected incident if it was in the deleted list
      const selectedIncident = useMapStore.getState().selectedIncident;
      if (selectedIncident && incidentIds.includes(selectedIncident.id)) {
        setSelectedIncident(null);
      }

      return { previousIncidents, incidentIds };
    },
    onError: (error, incidentIds, context) => {
      // Rollback on error
      if (context?.previousIncidents) {
        queryClient.setQueryData(['incidents', 'list'], context.previousIncidents);
      }

      console.error('Failed to batch delete incidents:', error);
    },
    onSuccess: (data, incidentIds) => {
      // Invalidate all incident-related queries
      invalidateAll();

      console.log(`Successfully deleted ${incidentIds.length} incidents`);
    },
    onSettled: () => {
      // Ensure data is fresh
      queryClient.invalidateQueries({ queryKey: ['incidents', 'list'] });
    },
    ...options,
  });
};

/**
 * Hook for incident deletion management
 * @param {object} [options] - Management options
 * @returns {object} Complete deletion management
 */
export const useIncidentDeletion = (options = {}) => {
  const singleDelete = useDeleteIncident(options);
  const confirmationDelete = useDeleteIncidentWithConfirmation(options);
  const batchDelete = useBatchDeleteIncidents(options);

  /**
   * Delete a single incident
   * @param {string|number} incidentId - Incident ID
   * @param {boolean} [requireConfirmation=true] - Whether to show confirmation
   * @param {string} [customMessage] - Custom confirmation message
   * @returns {Promise} Deletion result
   */
  const deleteIncident = async (incidentId, requireConfirmation = true, customMessage = null) => {
    if (requireConfirmation) {
      return confirmationDelete.deleteWithConfirmation(incidentId, customMessage);
    } else {
      try {
        const result = await singleDelete.mutateAsync(incidentId);
        return { success: true, data: result };
      } catch (error) {
        return { 
          success: false, 
          error: error.message || 'Échec de la suppression de l\'incident' 
        };
      }
    }
  };

  /**
   * Delete multiple incidents
   * @param {string[]|number[]} incidentIds - Array of incident IDs
   * @param {boolean} [requireConfirmation=true] - Whether to show confirmation
   * @returns {Promise} Batch deletion result
   */
  const deleteMultipleIncidents = async (incidentIds, requireConfirmation = true) => {
    if (requireConfirmation) {
      const message = `Êtes-vous sûr de vouloir supprimer ${incidentIds.length} incident(s) ? Cette action est irréversible.`;
      const confirmed = window.confirm(message);
      
      if (!confirmed) {
        return { success: false, cancelled: true };
      }
    }

    try {
      const result = await batchDelete.mutateAsync(incidentIds);
      return { success: true, data: result };
    } catch (error) {
      return { 
        success: false, 
        error: error.message || 'Échec de la suppression des incidents' 
      };
    }
  };

  return {
    // Single deletion
    deleteIncident,
    isDeleting: singleDelete.isPending || confirmationDelete.isDeleting,
    error: singleDelete.error || confirmationDelete.error,

    // Batch deletion
    deleteMultipleIncidents,
    isBatchDeleting: batchDelete.isPending,
    batchError: batchDelete.error,

    // Reset methods
    reset: () => {
      singleDelete.reset();
      confirmationDelete.reset();
      batchDelete.reset();
    },
  };
};

export default useDeleteIncident;
