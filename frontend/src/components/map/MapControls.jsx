/**
 * @file MapControls.jsx
 * @description Contrôles de zoom et de navigation personnalisés.
 * Positionnés en bas à droite. SMART — lit mapRef depuis useMapStore.
 */

import React from 'react';
import useMapStore from '../../store/useMapStore.js';
import { useGeolocationWithMap } from '../../hooks/useGeolocation.js';

/**
 * Map Controls component
 * @returns {JSX.Element} Custom map controls
 */
const MapControls = () => {
  const { mapRef, setSelectedType } = useMapStore();
  const { getLocationAndPan, loading: isLocating } = useGeolocationWithMap();

  /**
   * Handle zoom in
   */
  const handleZoomIn = (e) => {
    e.stopPropagation();
    if (mapRef) mapRef.zoomIn();
  };

  /**
   * Handle zoom out
   */
  const handleZoomOut = (e) => {
    e.stopPropagation();
    if (mapRef) mapRef.zoomOut();
  };

  /**
   * Handle geolocation
   */
  const handleLocate = async (e) => {
    e.stopPropagation();
    try {
      await getLocationAndPan(15);
    } catch (error) {
      console.error('Geolocation error:', error);
    }
  };

  /**
   * Handle fit bounds to all visible markers
   */
  const handleFitBounds = (e) => {
    e.stopPropagation();
    if (!mapRef) return;

    const markers = [];
    mapRef.eachLayer((layer) => {
      if (layer instanceof L.Marker || (layer.getBounds && layer.getLatLngs)) {
        // Simple check to identify our markers vs tiles/others
        if (layer.options?.icon?.options?.className?.includes('incident') || 
            layer.options?.icon?.options?.className?.includes('marker')) {
          markers.push(layer.getLatLng());
        }
      }
    });

    if (markers.length > 0) {
      const bounds = L.latLngBounds(markers);
      mapRef.flyToBounds(bounds, { padding: [50, 50], duration: 1 });
    }
  };

  return (
    <div className="absolute bottom-6 right-4 z-[500] flex flex-col gap-1 no-print">
      {/* Zoom controls */}
      <div className="flex flex-col shadow-md rounded-lg overflow-hidden border border-neutral-200">
        <button
          onClick={handleZoomIn}
          className="bg-white w-9 h-9 flex items-center justify-center text-neutral-700 hover:bg-neutral-50 transition-colors border-b border-neutral-100"
          title="Zoom avant"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
        <button
          onClick={handleZoomOut}
          className="bg-white w-9 h-9 flex items-center justify-center text-neutral-700 hover:bg-neutral-50 transition-colors"
          title="Zoom arrière"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        </button>
      </div>

      {/* Location control */}
      <button
        onClick={handleLocate}
        disabled={isLocating}
        className={`bg-white shadow-md rounded-lg w-9 h-9 flex items-center justify-center text-neutral-700 hover:bg-neutral-50 border border-neutral-200 transition-colors ${isLocating ? 'opacity-50' : ''}`}
        title="Ma position"
      >
        {isLocating ? (
          <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        ) : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        )}
      </button>

      {/* Fit bounds control */}
      <button
        onClick={handleFitBounds}
        className="bg-white shadow-md rounded-lg w-9 h-9 flex items-center justify-center text-neutral-700 hover:bg-neutral-50 border border-neutral-200 transition-colors"
        title="Tout voir"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
        </svg>
      </button>
    </div>
  );
};

export default MapControls;
