/**
 * @file MapEmptyState.jsx
 * @description Affiché au centre de la carte quand aucun incident ne correspond aux filtres.
 */

import React from 'react';
import useMapStore from '../../store/useMapStore.js';

/**
 * Map Empty State component
 * @returns {JSX.Element} Empty state overlay for map
 */
const MapEmptyState = () => {
  const { clearFilters } = useMapStore();

  return (
    <div className="absolute inset-0 flex items-center justify-center z-[450] pointer-events-none">
      <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-neutral-200 flex flex-col items-center text-center max-w-xs animate-fade-in pointer-events-auto">
        <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A2 2 0 013 15.382V5.618a2 2 0 011.447-1.817l7-3.5a2 2 0 011.106 0l7 3.5A2 2 0 0121 5.618v9.764a2 2 0 01-1.447 1.817L15 20l-3 1.5-3-1.5z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-neutral-900 mb-1">Aucun incident trouvé</h3>
        <p className="text-sm text-neutral-600 mb-6">
          Aucun incident de ce type ne correspond à vos critères dans cette zone.
        </p>
        <button
          onClick={clearFilters}
          className="w-full py-2 px-4 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors shadow-sm"
        >
          Réinitialiser les filtres
        </button>
      </div>
    </div>
  );
};

export default MapEmptyState;
