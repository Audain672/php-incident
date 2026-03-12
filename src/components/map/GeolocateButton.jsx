// AUDIT ÉTAPE 1
// ──────────────────────────────────────────────────────────────────
// CE QUE FAIT CE FICHIER (état actuel) :
//   - Composant DUMB qui affiche un bouton de géolocalisation sur la carte
//   - Géolocalise l'utilisateur via useGeolocationWithMap (hook existant)
//   - Affiche un cercle de précision optionnel sur la carte
//   - Centre la carte sur la position trouvée (map.setView)
//   - GeolocateControl : version intégrée dans le système de contrôles
//     Leaflet (L.Control) — actuellement incomplète (L non importé ici)
//
// CE QUI DOIT CHANGER AUX ÉTAPES SUIVANTES :
//   - Appeler setIsLocating(true/false) depuis le store pour synchro visuelle
//     de l'état de chargement dans toute l'interface (pas seulement le bouton)
//   - Appeler setUserLocation(location) dans le store pour persistence
//     de la position trouvée
//   - Corriger GeolocateControl : L n'est pas importé dans ce fichier
//
// DÉPENDANCES :
//   - useGeolocationWithMap (hook) — gère l'API Geolocation du navigateur
//   - useMap (react-leaflet) — accès à l'instance Leaflet courante
//   - Button (composant common) — composant bouton réutilisable
//   - useMapStore (prochainement) : setIsLocating, setUserLocation
// ──────────────────────────────────────────────────────────────────

/**
 * Geolocate Button Component
 * DUMB component for user geolocation with visual feedback
 * @component
 */
import React from 'react';
import { useMap } from 'react-leaflet';
import { useGeolocationWithMap } from '../../hooks/useGeolocation.js';
import Button from '../common/Button.jsx';

/**
 * Geolocate button component
 * @param {object} props - Component props
 * @param {function} [props.onLocationFound] - Callback when location is found
 * @param {function} [props.onError] - Callback when location fails
 * @param {boolean} [props.showAccuracy=false] - Whether to show accuracy circle
 * @param {number} [props.zoom=15] - Zoom level when location is found
 * @param {string} [props.className=''] - Additional CSS classes
 * @returns {JSX.Element} Geolocate button
 */
const GeolocateButton = ({
  onLocationFound,
  onError,
  showAccuracy = false,
  zoom = 15,
  className = '',
}) => {
  const map = useMap();
  const {
    getCurrentPosition,
    position,
    loading,
    error,
    isSupported,
  } = useGeolocationWithMap();

  const accuracyCircleRef = React.useRef(null);

  /**
   * Handle geolocation request
   */
  const handleGeolocate = async () => {
    if (!isSupported) {
      if (onError) {
        onError(new Error('La géolocalisation n\'est pas supportée par ce navigateur'));
      }
      return;
    }

    try {
      const location = await getCurrentPosition();
      
      // Clear previous accuracy circle
      if (accuracyCircleRef.current) {
        map.removeLayer(accuracyCircleRef.current);
        accuracyCircleRef.current = null;
      }

      // Add accuracy circle if requested
      if (showAccuracy && location.accuracy) {
        const L = await import('leaflet');
        accuracyCircleRef.current = L.default.circle(
          [location.latitude, location.longitude],
          {
            radius: location.accuracy,
            fillColor: '#3b82f6',
            fillOpacity: 0.1,
            color: '#3b82f6',
            weight: 2,
            opacity: 0.3,
          }
        ).addTo(map);
      }

      // Pan to location with specified zoom
      map.setView([location.latitude, location.longitude], zoom);

      if (onLocationFound) {
        onLocationFound(location);
      }
    } catch (err) {
      // Clear accuracy circle on error
      if (accuracyCircleRef.current) {
        map.removeLayer(accuracyCircleRef.current);
        accuracyCircleRef.current = null;
      }

      if (onError) {
        onError(err);
      }
    }
  };

  /**
   * Get button text based on state
   */
  const getButtonText = () => {
    if (loading) return 'Géolocalisation...';
    if (position) return 'Ma position';
    return 'Me localiser';
  };

  /**
   * Get button variant based on state
   */
  const getButtonVariant = () => {
    if (error) return 'danger';
    if (position) return 'primary';
    return 'outline';
  };

  /**
   * Get button icon based on state
   */
  const getButtonIcon = () => {
    if (loading) {
      return null; // Spinner will be shown by Button component
    }

    if (error) {
      return (
        <svg
          className="w-4 h-4 mr-2"
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
      );
    }

    if (position) {
      return (
        <svg
          className="w-4 h-4 mr-2"
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
      );
    }

    return (
      <svg
        className="w-4 h-4 mr-2"
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
    );
  };

  // Don't render if geolocation is not supported
  if (!isSupported) {
    return null;
  }

  return (
    <div className={`leaflet-control-container ${className}`}>
      <div className="leaflet-control">
        <Button
          variant={getButtonVariant()}
          size="sm"
          onClick={handleGeolocate}
          isLoading={loading}
          disabled={loading}
          className="shadow-lg"
          title={error ? error.message : 'Me localiser'}
        >
          {getButtonIcon()}
          {getButtonText()}
        </Button>
      </div>
    </div>
  );
};

/**
 * Geolocate control component for Leaflet
 * Integrates with Leaflet's control system
 */
export const GeolocateControl = React.forwardRef((props, ref) => {
  const map = useMap();

  React.useEffect(() => {
    // Create control container
    const Control = L.Control.extend({
      options: {
        position: 'topleft',
      },

      onAdd: function (map) {
        const div = L.DomUtil.create('div', 'leaflet-bar');
        L.DomEvent.disableClickPropagation(div);
        return div;
      },
    });

    const control = new Control();
    control.addTo(map);

    // Store control reference
    if (ref) {
      ref.current = control;
    }

    return () => {
      map.removeControl(control);
    };
  }, [map, ref]);

  return <GeolocateButton {...props} />;
});

GeolocateControl.displayName = 'GeolocateControl';

export default GeolocateButton;
