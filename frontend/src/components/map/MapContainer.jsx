/**
 * Map Container Component
 * SMART component initializing Leaflet map with proper icon configuration
 * @component
 */

import React, { useEffect, useRef, useState } from 'react';
import { MapContainer as LeafletMapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import useMapStore from '../../store/useMapStore.js';
import { DEFAULT_COORDINATES } from '../../utils/constants.js';

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
      
      if (onMapReady) {
        onMapReady(map);
      }
    }
  }, [map, mapCenter, mapZoom, onMapReady]);

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
  } = useMapStore();

  // Ensure we're on client side before rendering Leaflet
  useEffect(() => {
    setIsClient(true);
  }, []);

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
    <div className={className} style={style}>
      <LeafletMapContainer
        center={[mapCenter.lat, mapCenter.lng]}
        zoom={mapZoom}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
        attributionControl={true}
      >
        {/* Tile layer */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Map controller for store synchronization */}
        <MapController onMapReady={onMapReady} />

        {/* Child components (markers, etc.) */}
        {children}
      </LeafletMapContainer>
    </div>
  );
};

export default MapContainer;
