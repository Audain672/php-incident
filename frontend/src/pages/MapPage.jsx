/**
 * Map Page Component
 * SMART page component for incident map display and management
 * @component
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { useCreateIncident, useIncidentDeletion } from '../hooks/useIncidents.js';
import useMapStore from '../store/useMapStore.js';
import MapContainer from '../components/map/MapContainer.jsx';
import IncidentMarker from '../components/map/IncidentMarker.jsx';
import GeolocateButton from '../components/map/GeolocateButton.jsx';
import IncidentList from '../components/incidents/IncidentList.jsx';
import IncidentForm from '../components/incidents/IncidentForm.jsx';
import Button from '../components/common/Button.jsx';
import { INCIDENT_TYPES } from '../utils/constants.js';

/**
 * Map page component
 * @returns {JSX.Element} Map page
 */
const MapPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { deleteIncident } = useIncidentDeletion();
  const { isCreating: isCreatingIncident } = useCreateIncident();
  
  // Store state
  const {
    selectedIncident,
    setSelectedIncident,
    isFormOpen,
    setIsFormOpen,
    selectedType,
    setSelectedType,
    mapCenter,
    panTo,
    openFormAtLocation,
  } = useMapStore();

  // Local state
  const [showList, setShowList] = useState(true);
  const [mapInstance, setMapInstance] = useState(null);

  /**
   * Handle logout
   */
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  /**
   * Handle incident selection
   * @param {object} incident - Selected incident
   */
  const handleIncidentSelect = (incident) => {
    setSelectedIncident(incident);
    // Pan to incident location
    if (incident.latitude && incident.longitude) {
      panTo(incident.latitude, incident.longitude, 16);
    }
  };

  /**
   * Handle incident edit
   * @param {object} incident - Incident to edit
   */
  const handleIncidentEdit = (incident) => {
    setSelectedIncident(incident);
    setIsFormOpen(true);
    setShowList(false);
  };

  /**
   * Handle incident delete
   * @param {object} incident - Incident to delete
   */
  const handleIncidentDelete = async (incident) => {
    try {
      await deleteIncident(incident.id);
      setSelectedIncident(null);
    } catch (error) {
      console.error('Failed to delete incident:', error);
    }
  };

  /**
   * Handle incident creation
   * @param {object} incidentData - Incident data
   * @param {File} imageFile - Optional image file
   */
  const handleIncidentCreate = async (incidentData, imageFile) => {
    try {
      // The creation is handled by the hook
      setIsFormOpen(false);
      setShowList(true);
      setSelectedIncident(null);
    } catch (error) {
      console.error('Failed to create incident:', error);
    }
  };

  /**
   * Handle map ready
   * @param {object} map - Leaflet map instance
   */
  const handleMapReady = (map) => {
    setMapInstance(map);
  };

  /**
   * Handle location selection on map
   */
  const handleMapClick = (e) => {
    if (isFormOpen) return;
    
    const { lat, lng } = e.latlng;
    openFormAtLocation(lat, lng);
    setIsFormOpen(true);
    setShowList(false);
  };

  /**
   * Handle type filter change
   * @param {string} type - Selected incident type
   */
  const handleTypeFilter = (type) => {
    setSelectedType(type === selectedType ? null : type);
  };

  /**
   * Toggle between list and form
   */
  const toggleView = () => {
    if (isFormOpen) {
      setIsFormOpen(false);
      setShowList(true);
      setSelectedIncident(null);
    } else {
      setIsFormOpen(true);
      setShowList(false);
    }
  };

  // Add click handler to map when ready
  useEffect(() => {
    if (mapInstance) {
      const handleMapClickWrapper = (e) => {
        // Don't open form if clicking on marker
        if (e.originalEvent?.target?.closest('.leaflet-marker')) {
          return;
        }
        handleMapClick(e);
      };

      mapInstance.on('click', handleMapClickWrapper);

      return () => {
        mapInstance.off('click', handleMapClickWrapper);
      };
    }
  }, [mapInstance, isFormOpen]);

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-neutral-200 z-40">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and title */}
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <svg
                    className="h-5 w-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
                <span className="text-xl font-bold text-neutral-900 hidden sm:block">
                  Incident Reporter
                </span>
              </div>

              {/* Type filters */}
              <div className="hidden md:flex items-center space-x-2">
                <span className="text-sm text-neutral-600">Filtrer:</span>
                <div className="flex space-x-1">
                  {Object.values(INCIDENT_TYPES).map((type) => (
                    <button
                      key={type.id}
                      onClick={() => handleTypeFilter(type.id)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors duration-200 ${
                        selectedType === type.id
                          ? 'bg-primary-100 text-primary-700 border border-primary-300'
                          : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 border border-neutral-200'
                      }`}
                      title={type.label}
                    >
                      <span className="text-sm">{type.icon}</span>
                      <span className="hidden lg:inline ml-1">{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* User actions */}
              <div className="flex items-center space-x-4">
                <span className="text-sm text-neutral-700 hidden sm:block">
                  Bonjour, {user?.firstName || 'Utilisateur'}
                </span>
                
                <Button
                  variant="primary"
                  size="sm"
                  onClick={toggleView}
                  disabled={isCreatingIncident}
                >
                  {isFormOpen ? 'Liste' : 'Signaler'}
                </Button>
                
                <button
                  onClick={handleLogout}
                  className="text-sm text-neutral-500 hover:text-neutral-700 transition-colors duration-200"
                >
                  Déconnexion
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile type filters */}
        <div className="md:hidden px-4 py-2 border-t border-neutral-200">
          <div className="flex space-x-2 overflow-x-auto">
            {Object.values(INCIDENT_TYPES).map((type) => (
              <button
                key={type.id}
                onClick={() => handleTypeFilter(type.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors duration-200 whitespace-nowrap ${
                  selectedType === type.id
                    ? 'bg-primary-100 text-primary-700 border border-primary-300'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 border border-neutral-200'
                }`}
                title={type.label}
              >
                <span className="text-sm">{type.icon}</span>
                <span className="ml-1">{type.label}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex overflow-hidden">
        {/* Map section - 60% on desktop, full on mobile */}
        <div className="w-full lg:w-3/5 relative">
          <MapContainer
            onMapReady={handleMapReady}
            className="h-full"
            style={{ minHeight: '400px' }}
          >
            {/* Geolocate button */}
            <GeolocateButton
              showAccuracy={true}
              zoom={15}
              className="leaflet-top-left mt-16 ml-4"
            />

            {/* Incident markers would go here */}
            {/* This would be populated with actual incident data */}
          </MapContainer>

          {/* Mobile toggle button */}
          <div className="lg:hidden absolute bottom-4 right-4 z-30">
            <Button
              variant="primary"
              size="sm"
              onClick={toggleView}
              disabled={isCreatingIncident}
              className="shadow-lg"
            >
              {isFormOpen ? 'Liste' : 'Signaler'}
            </Button>
          </div>
        </div>

        {/* Side panel - 40% on desktop, overlay on mobile */}
        <div className={`w-full lg:w-2/5 bg-white border-l border-neutral-200 overflow-hidden ${
          isFormOpen ? 'block' : showList ? 'block' : 'hidden lg:block'
        }`}>
          {/* Mobile overlay backdrop */}
          {isFormOpen && (
            <div 
              className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-20"
              onClick={() => setIsFormOpen(false)}
            />
          )}

          {/* Content */}
          <div className={`h-full overflow-y-auto ${
            isFormOpen ? 'relative z-30 lg:z-auto' : ''
          }`}>
            {isFormOpen ? (
              <div className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-neutral-900">
                    Signaler un incident
                  </h2>
                  <button
                    onClick={() => setIsFormOpen(false)}
                    className="lg:hidden p-2 text-neutral-400 hover:text-neutral-600"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <IncidentForm
                  onSubmit={handleIncidentCreate}
                  isLoading={isCreatingIncident}
                  onCancel={() => setIsFormOpen(false)}
                  showLocationPicker={true}
                  defaultLocation={mapCenter}
                />
              </div>
            ) : (
              <IncidentList
                onIncidentSelect={handleIncidentSelect}
                onIncidentEdit={handleIncidentEdit}
                onIncidentDelete={handleIncidentDelete}
                compact={true}
                className="h-full"
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default MapPage;
