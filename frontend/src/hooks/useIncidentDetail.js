/**
 * @file useIncidentDetail.js
 * @description Hook SMART — connecte IncidentDetailPanel au store et aux mutations.
 *
 * Responsabilités :
 *   1. Lit selectedIncidentUuid + isDetailPanelOpen depuis useMapStore
 *   2. Cherche l'incident dans le cache React Query (useIncidents)
 *   3. Si absent du cache → requête individuelle via useDynamicIncident
 *   4. Expose handleClose, handleCenterMap (flyTo smooth), handleDelete
 *
 * DÉPENDANCES :
 *   - useMapStore : selectedIncidentUuid, isDetailPanelOpen, mapRef,
 *                   clearSelection, setIsMapLoading
 *   - useDynamicIncidents / useDynamicIncident (via hooks/index.js)
 *   - useDeleteIncident (via hooks/index.js)
 *   - useQueryClient (@tanstack/react-query)
 */

import { useMemo, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useIncidents, useIncident, useDeleteIncident } from './index.js';
import useMapStore from '../store/useMapStore.js';

/**
 * Hook SMART pour le panneau de détail d'incident.
 *
 * @returns {object} {
 *   incident,        // Données de l'incident sélectionné (ou null)
 *   isOpen,          // Panneau visible ?
 *   isLoading,       // Chargement en cours (fetch individuel) ?
 *   isDeleting,      // Suppression en cours ?
 *   handleClose,     // Ferme le panneau et efface la sélection
 *   handleCenterMap, // flyTo smooth vers l'incident sélectionné
 *   handleDelete,    // (uuid) => supprime + ferme + efface sélection
 * }
 */
const useIncidentDetail = () => {
  // ── Store ──────────────────────────────────────────────────────
  const selectedIncidentUuid = useMapStore((s) => s.selectedIncidentUuid);
  const isDetailPanelOpen    = useMapStore((s) => s.isDetailPanelOpen);
  const mapRef               = useMapStore((s) => s.mapRef);
  const clearSelection       = useMapStore((s) => s.clearSelection);

  // ── Cache React Query ─────────────────────────────────────────
  const queryClient = useQueryClient();

  // 1. Cherche dans le cache de la liste courante (accès le plus rapide)
  const { data: incidentsData } = useIncidents();

  const cachedIncident = useMemo(() => {
    if (!selectedIncidentUuid) return null;
    const list = incidentsData?.incidents ?? [];
    // Compatibilité uuid/id — selon le backend, l'identifiant peut être
    // stocké sous "uuid" ou "id" (dans le mock local c'est simplement "id")
    return list.find(
      (inc) => inc.uuid === selectedIncidentUuid || inc.id === selectedIncidentUuid,
    ) ?? null;
  }, [selectedIncidentUuid, incidentsData]);

  // 2. Si absent du cache de la liste → fetch individuel
  //    Enabled uniquement si on a un UUID sélectionné ET pas de résultat en cache
  const {
    data: fetchedIncident,
    isLoading: isFetching,
  } = useIncident(selectedIncidentUuid, {
    enabled: !!selectedIncidentUuid && !cachedIncident,
    staleTime: 5 * 60 * 1000,
  });

  // Incident final à afficher (cache prioritaire, fetch en fallback)
  const incident = cachedIncident ?? fetchedIncident ?? null;
  const isLoading = !cachedIncident && isFetching;

  // ── Mutation de suppression ───────────────────────────────────
  const deleteMutation = useDeleteIncident();
  const isDeleting = deleteMutation.isPending;

  // ── Handlers ──────────────────────────────────────────────────

  /**
   * Ferme le panneau et efface la sélection dans le store.
   */
  const handleClose = useCallback(() => {
    clearSelection();
  }, [clearSelection]);

  /**
   * Anime la carte vers l'incident sélectionné (flyTo Leaflet).
   * Utilise mapRef.flyTo pour une transition fluide de 1.2 s.
   */
  const handleCenterMap = useCallback(() => {
    if (!incident || !mapRef) return;
    const lat = incident.latitude ?? incident.lat;
    const lng = incident.longitude ?? incident.lng;
    if (lat == null || lng == null) return;

    mapRef.flyTo([lat, lng], 16, {
      animate: true,
      duration: 1.2,
    });
  }, [incident, mapRef]);

  /**
   * Supprime l'incident, ferme le panneau et efface la sélection.
   * @param {string} uuid - Identifiant de l'incident à supprimer
   */
  const handleDelete = useCallback(async (uuid) => {
    try {
      await deleteMutation.mutateAsync(uuid);
      // clearSelection est aussi appelé dans onSuccess du hook de suppression,
      // mais on le répète ici pour garantir la fermeture immédiate du panneau.
      clearSelection();
    } catch (err) {
      console.error('[useIncidentDetail] handleDelete error:', err);
    }
  }, [deleteMutation, clearSelection]);

  return {
    incident,
    isOpen:          isDetailPanelOpen,
    isLoading,
    isDeleting,
    handleClose,
    handleCenterMap,
    handleDelete,
  };
};

export default useIncidentDetail;
