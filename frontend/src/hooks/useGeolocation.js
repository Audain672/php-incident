/**
 * Geolocation Hook
 * Wrapper for browser geolocation API with error handling
 * @module useGeolocation
 */

import { useState, useEffect, useCallback } from 'react';
import useMapStore from '../store/useMapStore.js';

/**
 * Geolocation hook options
 * @typedef {object} GeolocationOptions
 * @property {boolean} [enableHighAccuracy=true] - Enable high accuracy
 * @property {number} [timeout=10000] - Timeout in milliseconds
 * @property {number} [maximumAge=300000] - Maximum age of cached position
 */

/**
 * Geolocation result
 * @typedef {object} GeolocationResult
 * @property {GeolocationPosition|null} position - Current position
 * @property {boolean} loading - Whether geolocation is loading
 * @property {GeolocationPositionError|null} error - Geolocation error
 * @property {Function} getCurrentPosition - Get current position
 * @property {Function} watchPosition - Watch position changes
 * @property {Function} stopWatching - Stop watching position
 * @property {boolean} isSupported - Whether geolocation is supported
 * @property {boolean} isWatching - Whether currently watching position
 */

/**
 * Hook for browser geolocation
 * @param {GeolocationOptions} [options={}] - Geolocation options
 * @returns {GeolocationResult} Geolocation result and methods
 */
export const useGeolocation = (options = {}) => {
  const {
    enableHighAccuracy = true,
    timeout = 10000,
    maximumAge = 5 * 60 * 1000, // 5 minutes
  } = options;

  const [position, setPosition] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [watchId, setWatchId] = useState(null);

  const { setUserLocation, setIsLocating } = useMapStore();

  /**
   * Check if geolocation is supported
   */
  const isSupported = 'geolocation' in navigator;

  /**
   * Handle geolocation success
   * @param {GeolocationPosition} pos - Geolocation position
   */
  const handleSuccess = useCallback((pos) => {
    const newPosition = {
      latitude: pos.coords.latitude,
      longitude: pos.coords.longitude,
      accuracy: pos.coords.accuracy,
      altitude: pos.coords.altitude,
      altitudeAccuracy: pos.coords.altitudeAccuracy,
      heading: pos.coords.heading,
      speed: pos.coords.speed,
      timestamp: pos.timestamp,
    };

    setPosition(newPosition);
    setError(null);
    setLoading(false);
    setIsLocating(false);

    // Update map store with user location
    setUserLocation({
      lat: newPosition.latitude,
      lng: newPosition.longitude,
    });

    return newPosition;
  }, [setUserLocation, setIsLocating]);

  /**
   * Handle geolocation error
   * @param {GeolocationPositionError} err - Geolocation error
   */
  const handleError = useCallback((err) => {
    let errorMessage = 'Erreur de géolocalisation';

    switch (err.code) {
      case err.PERMISSION_DENIED:
        errorMessage = 'L\'utilisateur a refusé la demande de géolocalisation';
        break;
      case err.POSITION_UNAVAILABLE:
        errorMessage = 'Les informations de localisation ne sont pas disponibles';
        break;
      case err.TIMEOUT:
        errorMessage = 'La demande de localisation a expiré';
        break;
      default:
        errorMessage = 'Une erreur inconnue est survenue';
        break;
    }

    const newError = {
      code: err.code,
      message: errorMessage,
      originalMessage: err.message,
    };

    setError(newError);
    setPosition(null);
    setLoading(false);
    setIsLocating(false);

    return newError;
  }, [setIsLocating]);

  /**
   * Get current position
   * @param {GeolocationOptions} [customOptions] - Custom options for this call
   * @returns {Promise<GeolocationPosition>} Promise that resolves with position
   */
  const getCurrentPosition = useCallback((customOptions = {}) => {
    if (!isSupported) {
      const error = new Error('La géolocalisation n\'est pas supportée par ce navigateur');
      return Promise.reject(error);
    }

    setLoading(true);
    setIsLocating(true);
    setError(null);

    const finalOptions = {
      enableHighAccuracy,
      timeout,
      maximumAge,
      ...customOptions,
    };

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newPosition = handleSuccess(pos);
          resolve(newPosition);
        },
        (err) => {
          const newError = handleError(err);
          reject(newError);
        },
        finalOptions
      );
    });
  }, [isSupported, enableHighAccuracy, timeout, maximumAge, handleSuccess, handleError, setIsLocating]);

  /**
   * Watch position changes
   * @param {GeolocationOptions} [customOptions] - Custom options for watching
   * @returns {Promise<number>} Promise that resolves with watch ID
   */
  const watchPosition = useCallback((customOptions = {}) => {
    if (!isSupported) {
      const error = new Error('La géolocalisation n\'est pas supportée par ce navigateur');
      return Promise.reject(error);
    }

    // Stop existing watch if any
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
    }

    const finalOptions = {
      enableHighAccuracy,
      timeout,
      maximumAge: 0, // Don't use cached position for watching
      ...customOptions,
    };

    return new Promise((resolve, reject) => {
      const id = navigator.geolocation.watchPosition(
        (pos) => {
          handleSuccess(pos);
        },
        (err) => {
          const newError = handleError(err);
          reject(newError);
        },
        finalOptions
      );

      setWatchId(id);
      resolve(id);
    });
  }, [isSupported, enableHighAccuracy, timeout, handleSuccess, handleError, watchId]);

  /**
   * Stop watching position
   */
  const stopWatching = useCallback(() => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
  }, [watchId]);

  /**
   * Calculate distance between two points (Haversine formula)
   * @param {number} lat1 - Latitude of first point
   * @param {number} lon1 - Longitude of first point
   * @param {number} lat2 - Latitude of second point
   * @param {number} lon2 - Longitude of second point
   * @returns {number} Distance in kilometers
   */
  const calculateDistance = useCallback((lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }, []);

  /**
   * Get distance from current position to a point
   * @param {number} lat - Latitude of target point
   * @param {number} lon - Longitude of target point
   * @returns {number|null} Distance in kilometers or null if no position
   */
  const getDistanceFromCurrent = useCallback((lat, lon) => {
    if (!position) return null;
    return calculateDistance(position.latitude, position.longitude, lat, lon);
  }, [position, calculateDistance]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [watchId]);

  return {
    position,
    loading,
    error,
    getCurrentPosition,
    watchPosition,
    stopWatching,
    isSupported,
    isWatching: watchId !== null,
    calculateDistance,
    getDistanceFromCurrent,
  };
};

/**
 * Hook for one-time geolocation with auto-request
 * @param {GeolocationOptions} [options={}] - Geolocation options
 * @returns {GeolocationResult} Geolocation result
 */
export const useOneTimeGeolocation = (options = {}) => {
  const geolocation = useGeolocation(options);

  // Auto-request location on mount if enabled
  useEffect(() => {
    if (options.autoRequest !== false && geolocation.isSupported && !geolocation.position) {
      geolocation.getCurrentPosition().catch(() => {
        // Silently ignore auto-request errors
      });
    }
  }, [options.autoRequest, geolocation]);

  return geolocation;
};

/**
 * Hook for continuous geolocation watching
 * @param {GeolocationOptions} [options={}] - Geolocation options
 * @returns {GeolocationResult} Geolocation result with auto-watch
 */
export const useContinuousGeolocation = (options = {}) => {
  const geolocation = useGeolocation(options);

  // Auto-start watching on mount
  useEffect(() => {
    if (options.autoWatch !== false && geolocation.isSupported && !geolocation.isWatching) {
      geolocation.watchPosition().catch(() => {
        // Silently ignore auto-watch errors
      });
    }
  }, [options.autoWatch, geolocation]);

  return geolocation;
};

/**
 * Hook for geolocation with map integration
 * @param {GeolocationOptions} [options={}] - Geolocation options
 * @returns {GeolocationResult & { panToUser: Function }} Geolocation with map methods
 */
export const useGeolocationWithMap = (options = {}) => {
  const geolocation = useGeolocation(options);
  const { panTo, setMapZoom } = useMapStore();

  /**
   * Pan map to user location
   * @param {number} [zoom=15] - Zoom level
   */
  const panToUser = useCallback((zoom = 15) => {
    if (geolocation.position) {
      panTo(geolocation.position.latitude, geolocation.position.longitude, zoom);
    }
  }, [geolocation.position, panTo]);

  /**
   * Get user location and pan to it
   * @param {number} [zoom=15] - Zoom level
   * @returns {Promise} Promise that resolves when location is obtained
   */
  const getLocationAndPan = useCallback(async (zoom = 15) => {
    try {
      const position = await geolocation.getCurrentPosition();
      panTo(position.latitude, position.longitude, zoom);
      return position;
    } catch (error) {
      throw error;
    }
  }, [geolocation.getCurrentPosition, panTo]);

  return {
    ...geolocation,
    panToUser,
    getLocationAndPan,
  };
};

export default useGeolocation;
