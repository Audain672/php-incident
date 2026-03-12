// AUDIT ÉTAPE 1
// ──────────────────────────────────────────────────────────────────
// CE QUE FAIT CE FICHIER (état actuel) :
//   - Page principale SMART assemblant la carte + le panneau latéral
//   - Gère handleIncidentSelect : sélectionne un incident et centre la carte
//     via panTo (store) — mais sans animation fluide ni panneau de détail
//   - Gère handleMapClick : ouvre le formulaire de création d'incident
//   - Affiche les marqueurs (IncidentMarker) pour chaque incident chargé
//   - Panneau latéral : bascule entre IncidentList et IncidentForm
//
// PROBLÈMES IDENTIFIÉS :
//   - Aucune synchronisation carte ↔ liste : cliquer sur un marqueur n'est
//     pas relié au panneau ; cliquer dans la liste ne met pas en évidence
//     le marqueur correspondant
//   - Le marqueur sélectionné n'a aucun changement visuel
//   - Pas de panneau de détail style Google Maps (élément "bottom sheet"
//     ou panneau latéral avec les infos complètes)
//   - Expérience mobile dégradée : pas de toggle carte/liste
//   - L'overlay de chargement est codé en dur (div absolue) sans finesse
//   - mapInstance est stocké localement (useState) alors que le store a
//     besoin de setMapRef pour y accéder globalement
//
// CE QUI DOIT CHANGER AUX ÉTAPES SUIVANTES :
//   - Utiliser selectIncident (store) au lieu de setSelectedIncident local
//   - Ajouter le composant IncidentDetailPanel (nouveau) en bas/latéral
//   - Ajouter le toggle carte/liste mobile (prochaines étapes)
//   - Supprimer l'overlay de chargement codé en dur ; utiliser isMapLoading
//     depuis le store pour centraliser le feedback de chargement
//   - Passer mapRef au store via setMapRef via le callback onMapReady
//
// DÉPENDANCES :
//   - useMapStore : selectedIncident, isFormOpen, panTo, etc.
//   - useIncidents, useAuth, useCreateIncident, useDeleteIncident (hooks)
//   - MapContainer, IncidentMarker, GeolocateButton (composants map)
//   - IncidentList, IncidentForm (composants incidents)
// ──────────────────────────────────────────────────────────────────

/**
 * Map Page Component
 * SMART page component for incident map display and management
 * @component
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useIncidents, useIncidentDetail, useIncidentForm, useDeleteIncident } from '../hooks/index.js';
import useMapStore from '../store/useMapStore.js';
import MapContainer from '../components/map/MapContainer.jsx';
import MarkerClusterGroup from '../components/map/MarkerClusterGroup.jsx';
import MapLoadingOverlay from '../components/map/MapLoadingOverlay.jsx';
import GeolocateButton from '../components/map/GeolocateButton.jsx';
import IncidentList from '../components/incidents/IncidentList.jsx';
import IncidentForm from '../components/incidents/IncidentForm.jsx';
import IncidentDetailPanel from '../components/incidents/IncidentDetailPanel.jsx';
import BottomSheet from '../components/common/BottomSheet.jsx';
import FloatingActionButton from '../components/common/FloatingActionButton.jsx';
import Button from '../components/common/Button.jsx';
import { INCIDENT_TYPES } from '../utils/constants.js';

/**
 * Map page component
 * @returns {JSX.Element} Map page
 */
const MapPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { mutateAsync: deleteIncident } = useDeleteIncident();
  
  // Remplacement de useCreateIncident par useIncidentForm pour gérer the success state (Étape 7)
  const { handleSubmit: handleIncidentSubmit, isCreating: isCreatingIncident, isSuccess: isIncidentCreationSuccess } = useIncidentForm();
  
  const { data: incidentsData, isLoading: incidentsLoading, error: incidentsError } = useIncidents();

  // ÉTAPE 3 — Hook de détail (SMART)
  const {
    incident: selectedIncidentDetail,
    isOpen: isDetailPanelOpen,
    isDeleting,
    handleClose: handleDetailClose,
    handleCenterMap: handleDetailCenter,
    handleDelete: handleDetailDelete,
  } = useIncidentDetail();

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
    setMapRef,
  } = useMapStore();

  // Local state
  const [showList, setShowList] = useState(true);
  const [mapInstance, setMapInstance] = useState(null);
  
  // Étape 6 — Bottom Sheet
  const [bottomSheetSnap, setBottomSheetSnap] = useState(1); // 0: réduit, 1: mi-hauteur, 2: plein écran

  // Détection rôle admin (simplifié : à adapter selon votre système d'auth)
  const isAdmin = user?.role === 'admin' || user?.isAdmin === true;

  console.log('🗺️ MapPage - incidentsData:', incidentsData);
  console.log('🗺️ MapPage - incidentsLoading:', incidentsLoading);

  /**
   * Handle logout
   */
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  /**
   * Handle incident selection
   */
  const handleIncidentSelect = (incident) => {
    setSelectedIncident(incident);
    if (incident.latitude && incident.longitude) {
      panTo(incident.latitude, incident.longitude, 16);
    }
    // Mobile : On remonte le sheet à l'état intermédiaire ou plein écran si ce n'est pas le cas
    if (window.innerWidth < 768 && bottomSheetSnap === 0) {
      setBottomSheetSnap(1);
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
   */
  const handleIncidentDelete = async (incident) => {
    try {
      await deleteIncident(incident.id);
      setSelectedIncident(null);
      if (window.innerWidth < 768) {
        setBottomSheetSnap(1); // Remettre à mi-hauteur pour la liste après suppression
      }
    } catch (error) {
      console.error('Failed to delete incident:', error);
    }
  };

  /**
   * Handle incident creation using the hook
   * @param {object} incidentData - Incident data
   * @param {File} imageFile - Optional image file
   */
  const handleIncidentCreate = async (incidentData, imageFile) => {
    const result = await handleIncidentSubmit(incidentData, imageFile);
    if (!result.success) {
      console.error('Failed to create incident:', result.error);
    } else {
      setTimeout(() => {
        setIsFormOpen(false);
        setShowList(true);
        setSelectedIncident(null);
      }, 1500); // Attendre la fin de l'animation Signalisé
    }
  };

  /**
   * Handle map ready — stocke l'instance dans le store ET en local
   * @param {object} map - Leaflet map instance
   */
  const handleMapReady = (map) => {
    setMapInstance(map);
    setMapRef(map); // Étape 3 : permet à useIncidentDetail.handleCenterMap d'appeler flyTo
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
    
    // Fermer le sheet mobile quand on ouvre le formulaire de création
    if (window.innerWidth < 768) {
      setBottomSheetSnap(0);
    }
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
    <div className="relative h-screen w-screen overflow-hidden bg-neutral-50 flex flex-col">
      {/* Header fixe */}
      <header className="bg-white shadow-sm border-b border-neutral-200 z-40 shrink-0">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <span className="text-xl font-bold text-neutral-900 hidden sm:block">
                  Incident Reporter
                </span>
              </div>

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

              <div className="flex items-center space-x-4">
                <span className="text-sm text-neutral-700 hidden sm:block">
                  Bonjour, {user?.firstName || 'Utilisateur'}
                </span>
                
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
      </header>

      {/* Zone principale sous le header */}
      <div className="flex h-[calc(100vh-64px)] w-full">
        {/* Carte : plein écran sur mobile, flex-1 sur desktop */}
        <div className="flex-1 relative h-full w-full">
          <MapContainer
            onMapReady={handleMapReady}
            className="absolute inset-0 w-full h-full"
          >
            <GeolocateButton
              showAccuracy={true}
              zoom={15}
              className="leaflet-top-left mt-16 ml-4"
            />
            
            <MapLoadingOverlay />

            {incidentsError && (
              <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-red-100 text-red-700 px-3 py-2 rounded-lg shadow-lg z-[400]">
                Erreur: {incidentsError.message || 'Impossible de charger les incidents'}
              </div>
            )}
            
            {!incidentsLoading && !incidentsError && incidentsData?.incidents && (
              <MarkerClusterGroup incidents={incidentsData.incidents} />
            )}
          </MapContainer>
        </div>

        {/* Panneau latéral : caché sur mobile, visible sur desktop (w-96) */}
        <aside className="hidden md:flex md:w-96 flex-col bg-white shadow-xl border-l border-neutral-200 overflow-y-auto z-10">
          {isFormOpen ? (
             <div className="p-6">
               <div className="flex items-center justify-between mb-6">
                 <h2 className="text-xl font-semibold text-neutral-900">Signaler un incident</h2>
                 <button onClick={() => setIsFormOpen(false)} className="text-neutral-400 hover:text-neutral-600">✕</button>
               </div>
               <IncidentForm
                 onSubmit={handleIncidentCreate}
                 isLoading={isCreatingIncident}
                 isSuccess={isIncidentCreationSuccess}
                 onCancel={() => setIsFormOpen(false)}
                 showLocationPicker={true}
                 defaultLocation={mapCenter}
               />
             </div>
          ) : isDetailPanelOpen ? (
            <IncidentDetailPanel
              incident={selectedIncidentDetail}
              isOpen={isDetailPanelOpen}
              isAdmin={isAdmin}
              onClose={handleDetailClose}
              onDelete={handleDetailDelete}
              onCenterMap={handleDetailCenter}
              isDeleting={isDeleting}
            />
          ) : (
            <div className="p-4 h-full">
              <IncidentList
                onIncidentSelect={handleIncidentSelect}
                onIncidentEdit={handleIncidentEdit}
                onIncidentDelete={handleIncidentDelete}
                compact={true}
                className="h-full"
              />
            </div>
          )}
        </aside>
      </div>

      {/* Bottom Sheet : mobile uniquement */}
      <BottomSheet
        isOpen={!isFormOpen} // Caché si formulaire en plein écran (ouvert dans un modal/overlay séparé si besoin plus tard)
        snapIndex={bottomSheetSnap}
        onSnap={setBottomSheetSnap}
      >
        {isDetailPanelOpen ? (
          <IncidentDetailPanel
            incident={selectedIncidentDetail}
            isOpen={isDetailPanelOpen}
            isAdmin={isAdmin}
            onClose={handleDetailClose}
            onDelete={handleDetailDelete}
            onCenterMap={handleDetailCenter}
            isDeleting={isDeleting}
          />
        ) : (
          <div className="p-4 bg-white">
            <IncidentList
              onIncidentSelect={handleIncidentSelect}
              onIncidentEdit={handleIncidentEdit}
              onIncidentDelete={handleIncidentDelete}
              compact={true}
              showFilters={false} // Pas de place pour les filtres complexes en mobile
            />
          </div>
        )}
      </BottomSheet>

      {/* Formulaire Mobile complet (Overlay plein écran) */}
      {isFormOpen && (
        <div className="md:hidden fixed inset-0 z-[1000] bg-white overflow-y-auto">
          <div className="sticky top-0 bg-white border-b px-4 py-3 flex justify-between items-center z-10 shadow-sm">
            <h2 className="text-xl font-bold text-neutral-900">Signaler un incident</h2>
            <button onClick={() => setIsFormOpen(false)} className="text-neutral-500 p-2 text-xl font-bold">✕</button>
          </div>
          <div className="p-4 pb-24">
             <IncidentForm
               onSubmit={handleIncidentCreate}
               isLoading={isCreatingIncident}
               isSuccess={isIncidentCreationSuccess}
               onCancel={() => setIsFormOpen(false)}
               showLocationPicker={true}
               defaultLocation={mapCenter}
             />
          </div>
        </div>
      )}

      {/* FAB mobile - Visible si le bottom sheet n'est pas plein écran et pas de formulaire ouvert */}
      {user && !isFormOpen && bottomSheetSnap < 2 && (
        <FloatingActionButton
          onClick={() => {
            setIsFormOpen(true);
            setBottomSheetSnap(0);
          }}
          label="Signaler un incident"
        />
      )}
    </div>
  );
};

export default MapPage;
