/**
 * @file DraftIncidentMarker.jsx
 * @description Marqueur draggable représentant la position du futur incident.
 * Visible quand des coordonnées sont définies dans le formulaire.
 * DUMB — props : position {lat, lng}, onPositionChange (lat, lng) => void
 */
import React, { useMemo } from 'react';
import { Marker } from 'react-leaflet';
import L from 'leaflet';

const DraftIncidentMarker = ({ position, onPositionChange }) => {
  const icon = useMemo(() => {
    return L.divIcon({
      html: `<div style="
        font-size: 24px;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #3B82F6;
        border: 2px solid white;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        box-shadow: 2px 2px 5px rgba(0,0,0,0.3);
      ">
        <span style="transform: rotate(45deg);">📍</span>
      </div>`,
      className: 'draft-marker-icon',
      iconSize: [40, 40],
      iconAnchor: [20, 40],
    });
  }, []);

  if (!position?.lat || !position?.lng) return null;

  return (
    <Marker
      position={[position.lat, position.lng]}
      icon={icon}
      draggable={true}
      eventHandlers={{
        dragend: (e) => {
          const marker = e.target;
          onPositionChange(marker.getLatLng());
        },
      }}
      zIndexOffset={2000} // Toujours au-dessus du reste
    />
  );
};

export default DraftIncidentMarker;
