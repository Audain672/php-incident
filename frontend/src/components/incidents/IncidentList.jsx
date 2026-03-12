/**
 * Incident List Component
 * SMART component displaying paginated list of incidents with filtering
 * @component
 */

import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import L from 'leaflet';
import { useIncidents, useInvalidateIncidents } from '../../hooks/useIncidents.js';
import { useFlyToIncident } from '../../hooks/index.js';
import useMapStore from '../../store/useMapStore.js';
import IncidentCard from './IncidentCard.jsx';
import IncidentFilter from './IncidentFilter.jsx';
import Pagination from '../common/Pagination.jsx';
import { CardSpinner } from '../common/Spinner.jsx';
import { INCIDENT_TYPES, SEVERITY_LEVELS, INCIDENT_STATUS } from '../../utils/constants.js';

/**
 * Incident list component
 * @param {object} props - Component props
 * @param {function} [props.onIncidentSelect] - Callback when incident is selected
 * @param {function} [props.onIncidentEdit] - Callback when incident is edited
 * @param {function} [props.onIncidentDelete] - Callback when incident is deleted
 * @param {boolean} [props.showFilters=true] - Whether to show filters
 * @param {boolean} [props.compact=false] - Whether to show compact cards
 * @param {string} [props.className=''] - Additional CSS classes
 * @returns {JSX.Element} Incident list
 */
const IncidentList = ({
  onIncidentSelect,
  onIncidentEdit,
  onIncidentDelete,
  showFilters = true,
  compact = false,
  className = '',
}) => {
  // Store state
  const {
    filters: storeFilters,
    setFilters,
    clearFilters,
    setCurrentPage,
    getQueryFilters,
    selectedIncidentUuid,
    hoverIncident,
    mapRef,
  } = useMapStore();

  const { flyTo } = useFlyToIncident();
  const selectedCardRef = useRef(null);

  // Local state for filters (to avoid excessive store updates)
  const [localFilters, setLocalFilters] = useState(storeFilters);
  const [currentPage, setCurrentPageLocal] = useState(1);

  // Get incidents data
  const queryFilters = getQueryFilters();
  const {
    data: incidentsData,
    isLoading,
    error,
    refetch,
  } = useIncidents({
    enabled: true,
    staleTime: 60 * 1000, // 60 seconds
  });

  // Sync local filters with store
  useEffect(() => {
    setLocalFilters(storeFilters);
  }, [storeFilters]);

  // Sync current page with store
  useEffect(() => {
    setCurrentPageLocal(queryFilters.page || 1);
  }, [queryFilters.page]);

  // Étape 4 : Scroll automatique vers la carte sélectionnée
  useEffect(() => {
    if (selectedIncidentUuid && selectedCardRef.current) {
      selectedCardRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [selectedIncidentUuid]);

  // Étape 4 : Recadrage de la carte au chargement/changement de page
  useEffect(() => {
    if (incidentsData?.incidents?.length && mapRef) {
      const coords = incidentsData.incidents
        .map(i => [(i.latitude ?? i.lat), (i.longitude ?? i.lng)])
        .filter(c => c[0] != null && c[1] != null);
        
      if (coords.length > 0) {
        const bounds = L.latLngBounds(coords);
        mapRef.fitBounds(bounds, {
          padding: [50, 50],
          maxZoom: 15,
          animate: true,
          duration: 0.8,
        });
      }
    }
  }, [incidentsData, mapRef]);

  /**
   * Handle filters change with debouncing
   * @param {object} newFilters - New filter values
   */
  const handleFiltersChange = (newFilters) => {
    setLocalFilters(newFilters);
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  /**
   * Handle filters reset
   */
  const handleFiltersReset = () => {
    clearFilters();
    setCurrentPage(1);
  };

  /**
   * Handle page change
   * @param {number} page - New page number
   */
  const handlePageChange = (page) => {
    setCurrentPageLocal(page);
    setCurrentPage(page);
  };

  /**
   * Handle incident selection
   * @param {object} incident - Selected incident
   */
  const handleIncidentSelect = (incident) => {
    if (onIncidentSelect) {
      onIncidentSelect(incident);
    }
  };

  /**
   * Handle incident edit
   * @param {object} incident - Incident to edit
   */
  const handleIncidentEdit = (incident) => {
    if (onIncidentEdit) {
      onIncidentEdit(incident);
    }
  };

  /**
   * Handle incident delete
   * @param {object} incident - Incident to delete
   */
  const handleIncidentDelete = (incident) => {
    if (onIncidentDelete) {
      onIncidentDelete(incident);
    }
  };

  // Loading state
  if (isLoading && !incidentsData) {
    return (
      <CardSpinner 
        message="Chargement des incidents..." 
        className={className}
      />
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`bg-danger-50 border border-danger-200 rounded-lg p-6 text-center ${className}`}>
        <div className="text-danger-600">
          <svg
            className="mx-auto h-12 w-12 text-danger-400 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="text-lg font-medium text-danger-800 mb-2">
            Erreur de chargement
          </h3>
          <p className="text-danger-600 mb-4">
            {error.message || 'Impossible de charger les incidents.'}
          </p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-danger-600 text-white rounded-lg hover:bg-danger-700 transition-colors duration-200"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (!incidentsData?.incidents?.length) {
    return (
      <div className={`bg-white border border-neutral-200 rounded-lg p-8 text-center ${className}`}>
        <div className="text-neutral-400">
          <svg
            className="mx-auto h-12 w-12 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <h3 className="text-lg font-medium text-neutral-900 mb-2">
            Aucun incident trouvé
          </h3>
          <p className="text-neutral-600 mb-4">
            {Object.keys(localFilters).some(key => localFilters[key]) 
              ? 'Aucun incident ne correspond à vos critères de recherche.'
              : 'Aucun incident n\'a été signalé pour le moment.'
            }
          </p>
          {Object.keys(localFilters).some(key => localFilters[key]) && (
            <button
              onClick={handleFiltersReset}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200"
            >
              Réinitialiser les filtres
            </button>
          )}
        </div>
      </div>
    );
  }

  const { incidents, pagination } = incidentsData;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Filters */}
      {showFilters && (
        <IncidentFilter
          filters={localFilters}
          onFiltersChange={handleFiltersChange}
          onReset={handleFiltersReset}
          compact={compact}
        />
      )}

      {/* Results header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-neutral-900">
          Incidents ({pagination?.totalItems || 0})
        </h2>
        
        <div className="flex items-center space-x-4">
          <span className="text-sm text-neutral-600">
            Page {currentPage} sur {pagination?.totalPages || 1}
          </span>
        </div>
      </div>

      {/* Incident cards */}
      <div className={compact 
        ? 'space-y-3' 
        : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
      }>
        {incidents.map((incident) => {
          const uuid = incident.uuid ?? incident.id;
          const isSelected = selectedIncidentUuid === uuid;
          return (
            <IncidentCard
              key={uuid}
              incident={incident}
              compact={compact}
              isSelected={isSelected}
              cardRef={isSelected ? selectedCardRef : null}
              onClick={(inc) => {
                flyTo(inc);
                handleIncidentSelect(inc);
              }}
              onMouseEnter={(inc) => hoverIncident(inc.uuid ?? inc.id)}
              onMouseLeave={() => hoverIncident(null)}
              onEdit={onIncidentEdit}
              onDelete={onIncidentDelete}
            />
          );
        })}
      </div>

      {/* Loading overlay for refetch */}
      {isLoading && (
        <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
          <CardSpinner message="Mise à jour..." />
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={pagination.totalPages}
          totalItems={pagination.totalItems}
          itemsPerPage={pagination.itemsPerPage}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};

IncidentList.propTypes = {
  onIncidentSelect: PropTypes.func,
  onIncidentEdit: PropTypes.func,
  onIncidentDelete: PropTypes.func,
  showFilters: PropTypes.bool,
  compact: PropTypes.bool,
  className: PropTypes.string,
};

export default IncidentList;
