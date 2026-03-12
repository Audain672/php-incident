/**
 * @file useFlyToIncident.js
 * @description Anime la carte Leaflet vers un incident et le sélectionne.
 */
import { useCallback } from 'react';
import useMapStore from '../store/useMapStore.js';

export const useFlyToIncident = () => {
  const { mapRef, selectIncident, setDetailPanelOpen } = useMapStore();

  const flyTo = useCallback((incident, options = {}) => {
    if (!mapRef || !incident) return;

    // Décalage pour compenser le panneau latéral desktop (w-96 = 384px)
    const isDesktop = window.innerWidth >= 768;
    
    // Coordonnées de l'incident
    const lat = incident.latitude ?? incident.lat;
    const lng = incident.longitude ?? incident.lng;
    
    if (lat == null || lng == null) return;

    mapRef.flyTo(
      [lat, lng],
      options.zoom ?? 16,
      { duration: 1.0, easeLinearity: 0.25 }
    );

    const uuid = incident.uuid ?? incident.id;
    selectIncident(uuid);
    setDetailPanelOpen(true);
  }, [mapRef, selectIncident, setDetailPanelOpen]);

  return { flyTo };
};

export default useFlyToIncident;
