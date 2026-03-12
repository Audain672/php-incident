// AUDIT ÉTAPE 1
// ──────────────────────────────────────────────────────────────────
// CE QUE FAIT CE FICHIER (état actuel) :
//   - Composant SMART qui initialise la carte Leaflet (LeafletMapContainer)
//   - Corrige le bug d'icônes par défaut de Leaflet (fixLeafletIcons)
//   - MapController : synchronise le store Zustand (mapCenter, mapZoom, mapBounds)
//     avec les événements Leaflet (moveend)
//   - Passe un callback onMapReady au parent (MapPage) pour exposer l'instance map
//
// CE QUI DOIT CHANGER AUX ÉTAPES SUIVANTES :
//   - MapController doit appeler setMapRef(map) pour stocker la référence Leaflet
//     dans le store (actuellement le store n'a pas ce champ)
//   - Ajouter l'écoute d'un clic vide sur la carte pour fermer le panneau de détail
//     (clearSelection depuis le store)
//   - Ajouter l'overlay de chargement natif (isMapLoading depuis le store)
//   - Intégrer le cluster de marqueurs (MarkerClusterGroup de leaflet.markercluster)
//
// DÉPENDANCES :
//   - useMapStore (store Zustand) — lit mapCenter, mapZoom ; écrit setMapCenter,
//     setMapZoom, setMapBounds (+ setMapRef à ajouter)
//   - react-leaflet : MapContainer, TileLayer, useMap
// ──────────────────────────────────────────────────────────────────

/**
 * Map Container Component
 * SMART component initializing Leaflet map with proper icon configuration
 * @component
 */

import React, { useEffect, useRef, useState } from 'react';
import { MapContainer as LeafletMapContainer, TileLayer, useMap, Marker, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './markers.css';
import MapLoadingOverlay from './MapLoadingOverlay.jsx';
import MapControls from './MapControls.jsx';
import MapEmptyState from './MapEmptyState.jsx';
import GeolocateButton from './GeolocateButton.jsx';
import useMapStore from '../../store/useMapStore.js';
import { DEFAULT_COORDINATES } from '../../utils/constants.js';
import MapClickHandler from './MapClickHandler.jsx';
import DraftIncidentMarker from './DraftIncidentMarker.jsx';

/**
 * Fix for default Leaflet icon issue
 * This must be called before using any Leaflet components
 */
const fixLeafletIcons = () => {
  delete L.Icon.Default.prototype._getIconUrl;
  
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });
};

/**
 * Custom icon for user location (blue dot)
 */
const createUserLocationIcon = () => {
  return L.divIcon({
    className: 'user-location-marker',
    html: '<div class="user-location-dot"></div><div class="user-location-pulse"></div>',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
};

const userIcon = createUserLocationIcon();

// Call the fix immediately
fixLeafletIcons();

/**
 * Map controller component to handle map events and store synchronization
 * @param {object} props - Component props
 * @param {function} props.onMapReady - Callback when map is ready
 * @returns {null} This component doesn't render anything
 */
const MapController = ({ onMapReady }) => {
  const map = useMap();
  const {
    mapCenter,
    mapZoom,
    setMapCenter,
    setMapZoom,
    setMapBounds,
    setMapRef,
  } = useMapStore();

  const mapRef = useRef(map);
  const isInitialized = useRef(false);

  // Update map ref
  useEffect(() => {
    mapRef.current = map;
  }, [map]);

  // Initialize map position from store
  useEffect(() => {
    if (!isInitialized.current) {
      map.setView([mapCenter.lat, mapCenter.lng], mapZoom);
      isInitialized.current = true;
      
      // Stocker la référence de la carte dans le store
      setMapRef(map);

      if (onMapReady) {
        onMapReady(map);
      }
    }
  }, [map, mapCenter, mapZoom, onMapReady, setMapRef]);

  // Update store when map moves
  useEffect(() => {
    const handleMoveEnd = () => {
      const center = map.getCenter();
      const zoom = map.getZoom();
      
      setMapCenter({
        lat: center.lat,
        lng: center.lng,
      });
      setMapZoom(zoom);
    };

    const handleMoveEndThrottled = () => {
      // Throttle updates to avoid excessive store updates
      clearTimeout(handleMoveEndThrottled.timer);
      handleMoveEndThrottled.timer = setTimeout(handleMoveEnd, 100);
    };

    map.on('moveend', handleMoveEndThrottled);

    return () => {
      map.off('moveend', handleMoveEndThrottled);
      if (handleMoveEndThrottled.timer) {
        clearTimeout(handleMoveEndThrottled.timer);
      }
    };
  }, [map, setMapCenter, setMapZoom]);

  // Update map bounds in store
  useEffect(() => {
    const handleBoundsChange = () => {
      const bounds = map.getBounds();
      setMapBounds({
        north: bounds.getNorth(),
        south: bounds.getSouth(),
        east: bounds.getEast(),
        west: bounds.getWest(),
      });
    };

    const handleBoundsChangeThrottled = () => {
      clearTimeout(handleBoundsChangeThrottled.timer);
      handleBoundsChangeThrottled.timer = setTimeout(handleBoundsChange, 200);
    };

    map.on('moveend', handleBoundsChangeThrottled);

    return () => {
      map.off('moveend', handleBoundsChangeThrottled);
      if (handleBoundsChangeThrottled.timer) {
        clearTimeout(handleBoundsChangeThrottled.timer);
      }
    };
  }, [map, setMapBounds]);

  return null;
};

/**
 * Map Container component
 * @param {object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render on map
 * @param {function} props.onMapReady - Callback when map is ready
 * @param {string} [props.className=''] - Additional CSS classes
 * @param {object} [props.style] - Additional CSS styles
 * @returns {JSX.Element} Map container
 */
const MapContainer = ({
  children,
  onMapReady,
  className = '',
  style = {},
}) => {
  const [isClient, setIsClient] = useState(false);
  const {
    mapCenter,
    mapZoom,
    isFormOpen,
    draftLocation,
    setDraftLocation,
    userLocation,
  } = useMapStore();

  // Ensure we're on client side before rendering Leaflet
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Fermer le panneau de détail avec la touche Escape
  const { clearSelection, isDetailPanelOpen } = useMapStore();
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isDetailPanelOpen) {
        clearSelection();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isDetailPanelOpen, clearSelection]);

  // Vérification si aucun incident (pour MapEmptyState)
  const childrenArray = React.Children.toArray(children);
  const hasNoMarkers = childrenArray.length === 0 || 
    (childrenArray.length === 1 && childrenArray[0]?.props?.incidents?.length === 0);
  const { selectedType } = useMapStore();
  const showEmptyState = hasNoMarkers && !!selectedType;

  // Don't render on server side
  if (!isClient) {
    return (
      <div 
        className={`bg-neutral-100 flex items-center justify-center ${className}`}
        style={{ height: '400px', ...style }}
      >
        <div className="text-neutral-500">Chargement de la carte...</div>
      </div>
    );
  }

  return (
    <div className={className} style={{ ...style, cursor: isFormOpen ? 'crosshair' : 'default' }}>
      <LeafletMapContainer
        center={[mapCenter.lat, mapCenter.lng]}
        zoom={mapZoom}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
        attributionControl={true}
      >
        {/* Tile layer */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Map controller for store synchronization */}
        <MapController onMapReady={onMapReady} />

        {/* Clic sur la carte pour définir les coordonnées d'un nouveau signalement (Étape 7) */}
        <MapClickHandler 
          isActive={isFormOpen} 
          onCoordinatesSelected={setDraftLocation} 
        />
        
        {/* Marqueur brouillon pour le futur incident */}
        {isFormOpen && draftLocation && (
          <DraftIncidentMarker
            position={draftLocation}
            onPositionChange={setDraftLocation}
          />
        )}

        {/* Map controls (Zoom, Location, Fit) */}
        <MapControls />

        {/* Empty state overlay */}
        {showEmptyState && <MapEmptyState />}

        {/* User Location Marker & Accuracy Circle */}
        {userLocation && (
          <>
            <Marker 
              position={[userLocation.lat, userLocation.lng]} 
              icon={userIcon}
              zIndexOffset={1000}
            />
            {userLocation.accuracy && (
              <Circle
                center={[userLocation.lat, userLocation.lng]}
                radius={userLocation.accuracy}
                pathOptions={{
                  fillColor: '#3b82f6',
                  fillOpacity: 0.15,
                  color: '#3b82f6',
                  weight: 1,
                  dashArray: '5, 5'
                }}
              />
            )}
          </>
        )}

        {/* Child components (markers, etc.) */}
        {children}
      </LeafletMapContainer>
    </div>
  );
};

export default MapContainer;
