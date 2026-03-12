/**
 * @file MarkerClusterGroup.jsx
 * @description Pont entre react-leaflet v4 et leaflet.markercluster.
 * Crée un cluster layer natif et le gère via un hook personnalisé.
 * Remplace la boucle de <Marker> par une insertion native groupée.
 */

import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import { createIncidentIcon } from '../../utils/markerFactory.js';
import useMapStore from '../../store/useMapStore.js';
import { useFlyToIncident } from '../../hooks/index.js';

const MarkerClusterGroup = ({ incidents }) => {
  const map = useMap();
  const clusterGroupRef = useRef(null);
  const markersMapRef = useRef(new Map()); // Pour garder une réf sur chaque L.marker

  // Zustand Store
  const selectedUuid = useMapStore((s) => s.selectedIncidentUuid);
  const hoveredUuid = useMapStore((s) => s.hoveredIncidentUuid);
  const hoverIncident = useMapStore((s) => s.hoverIncident);

  // Hook d'animation
  const { flyTo } = useFlyToIncident();

  // 1. Initialiser le MarkerClusterGroup (une seule fois)
  useEffect(() => {
    clusterGroupRef.current = L.markerClusterGroup({
      chunkedLoading: true,
      chunkInterval: 200,
      chunkDelay: 50,
      maxClusterRadius: 60,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      iconCreateFunction: (cluster) => {
        const count = cluster.getChildCount();
        const size = count < 10 ? 40 : count < 50 ? 50 : 60;
        return L.divIcon({
          html: `<div style="
            width: ${size}px; height: ${size}px;
            background: #1B4F72; border: 3px solid white;
            border-radius: 50%; display: flex; align-items: center; justify-content: center;
            color: white; font-weight: bold; font-size: ${size > 45 ? 16 : 14}px;
            box-shadow: 0 3px 10px rgba(0,0,0,0.4);
          ">${count}</div>`,
          className: 'cluster-icon-custom flex items-center justify-center',
          iconSize: [size, size],
          iconAnchor: [size / 2, size / 2],
        });
      },
    });

    map.addLayer(clusterGroupRef.current);

    return () => {
      if (clusterGroupRef.current) {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        map.removeLayer(clusterGroupRef.current);
      }
    };
  }, [map]);

  // 2. Mettre à jour les marqueurs quand les données (incidents) changent
  useEffect(() => {
    if (!clusterGroupRef.current || !incidents) return;

    clusterGroupRef.current.clearLayers();
    markersMapRef.current.clear();

    const markers = [];

    incidents.forEach((incident) => {
      const uuid = incident.uuid ?? incident.id;
      // Par défaut au montage, calcul de l'état (utile s'il y a déjà une sélection)
      const state = uuid === selectedUuid ? 'active' : uuid === hoveredUuid ? 'hovered' : 'normal';

      // Attention : l'API mock fournit type sous forme d'ID (ex: 'accident'), on l'utilise directement ou on fallback sur uppercase
      const typeCode = incident.type?.toUpperCase?.() ?? incident.type ?? 'OTHER';

      const icon = createIncidentIcon(typeCode, state);
      
      const lat = incident.latitude ?? incident.lat;
      const lng = incident.longitude ?? incident.lng;

      if (lat != null && lng != null) {
        const marker = L.marker([lat, lng], {
          icon,
          zIndexOffset: state === 'active' ? 1000 : state === 'hovered' ? 500 : 0
        });

        // Écouteurs d'événementsLeaflet natifs
        marker.on('click', () => {
          flyTo(incident);
        });

        marker.on('mouseover', () => {
          hoverIncident(uuid);
        });

        marker.on('mouseout', () => {
          hoverIncident(null);
        });

        markersMapRef.current.set(uuid, marker);
        markers.push(marker);
      }
    });

    clusterGroupRef.current.addLayers(markers);
  }, [incidents, flyTo, hoverIncident]); // Ne pas lier selectedUuid et hoveredUuid ici pour éviter des re-renders de tous les marqueurs

  // 3. Mettre à jour uniquement l'icône du/des marqueurs concernés par un changement d'état (hover/select)
  useEffect(() => {
    if (!markersMapRef.current.size || !incidents) return;

    markersMapRef.current.forEach((marker, uuid) => {
      const incident = incidents.find(i => (i.uuid ?? i.id) === uuid);
      if (!incident) return;

      const typeCode = incident.type?.toUpperCase?.() ?? incident.type ?? 'OTHER';
      const isSelected = selectedUuid === uuid;
      const isHovered = hoveredUuid === uuid;
      
      const nextState = isSelected ? 'active' : isHovered ? 'hovered' : 'normal';
      
      // Leaflet permet de mettre à jour l'icône à la volée !
      marker.setIcon(createIncidentIcon(typeCode, nextState));
      marker.setZIndexOffset(isSelected ? 1000 : isHovered ? 500 : 0);
    });
  }, [selectedUuid, hoveredUuid, incidents]); // Se déclenche uniquement au changement de sélection/survol

  return null; // Composant logique Leaflet natif, pas rendu DOM par React
};

export default MarkerClusterGroup;
