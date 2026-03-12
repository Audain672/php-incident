/**
 * @file MapLoadingOverlay.jsx
 * @description Overlay semi-transparent au-dessus de la carte Leaflet.
 * Affiche un spinner et un texte informatif pendant le chargement (isMapLoading).
 */

import React from 'react';
import useMapStore from '../../store/useMapStore.js';
import Spinner from '../common/Spinner.jsx';

const MapLoadingOverlay = () => {
  const isMapLoading = useMapStore((s) => s.isMapLoading);

  if (!isMapLoading) return null;

  return (
    <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] z-[500] flex flex-col items-center justify-center pointer-events-none rounded-[inherit]">
      <div className="bg-white px-6 py-4 rounded-2xl shadow-lg flex flex-col items-center gap-3">
        <Spinner size="lg" color="primary" />
        <span className="text-sm font-semibold text-neutral-700">
          Chargement des incidents...
        </span>
      </div>
    </div>
  );
};

export default MapLoadingOverlay;
