/**
 * @file MapClickHandler.jsx
 * @description Capture les clics sur la carte pour définir les coordonnées
 * d'un nouvel incident. Actif UNIQUEMENT quand isFormOpen === true.
 * Utilise useMapEvents de react-leaflet — retourne null (aucun rendu DOM).
 */
import { useMapEvents } from 'react-leaflet';

const MapClickHandler = ({ onCoordinatesSelected, isActive }) => {
  useMapEvents({
    click: (e) => {
      if (!isActive) return;
      const { lat, lng } = e.latlng;
      onCoordinatesSelected({ latitude: lat, longitude: lng });
    },
  });
  return null;
};

export default MapClickHandler;
