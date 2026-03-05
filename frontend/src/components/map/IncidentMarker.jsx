/**
 * Incident Marker Component
 * DUMB component displaying incident markers with custom icons and popups
 * @component
 */

import React, { useMemo } from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { INCIDENT_TYPES, SEVERITY_LEVELS } from '../../utils/constants.js';

/**
 * Create custom icon for incident marker
 * @param {object} incident - Incident data
 * @returns {L.DivIcon} Custom Leaflet icon
 */
const createIncidentIcon = (incident) => {
  const incidentType = INCIDENT_TYPES[incident.type?.toUpperCase()] || INCIDENT_TYPES.OTHER;
  const severity = SEVERITY_LEVELS[incident.severity?.toUpperCase()] || SEVERITY_LEVELS.MEDIUM;

  // Create icon HTML with Tailwind CSS classes
  const iconHtml = `
    <div class="relative flex items-center justify-center">
      <!-- Outer circle with severity color -->
      <div class="absolute inset-0 rounded-full opacity-30" 
           style="background-color: ${severity.color}; width: 32px; height: 32px;">
      </div>
      
      <!-- Inner circle with type color -->
      <div class="relative flex items-center justify-center rounded-full bg-white shadow-lg"
           style="width: 24px; height: 24px; border: 2px solid ${incidentType.color};">
        <!-- Incident icon -->
        <div class="text-xs" style="color: ${incidentType.color};">
          ${incidentType.icon}
        </div>
      </div>
      
      <!-- Severity indicator dot -->
      <div class="absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white"
           style="background-color: ${severity.color};">
      </div>
    </div>
  `;

  return L.divIcon({
    html: iconHtml,
    className: 'incident-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
    tooltipAnchor: [16, -8],
  });
};

/**
 * Incident popup content component
 * @param {object} incident - Incident data
 * @param {function} [onViewDetails] - Callback for viewing details
 * @returns {JSX.Element} Popup content
 */
const IncidentPopup = ({ incident, onViewDetails }) => {
  const incidentType = INCIDENT_TYPES[incident.type?.toUpperCase()] || INCIDENT_TYPES.OTHER;
  const severity = SEVERITY_LEVELS[incident.severity?.toUpperCase()] || SEVERITY_LEVELS.MEDIUM;

  const formatDate = (dateString) => {
    if (!dateString) return 'Date inconnue';
    return new Date(dateString).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="p-3 min-w-64 max-w-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <span className="text-lg">{incidentType.icon}</span>
          <h3 className="font-semibold text-neutral-900 text-sm">
            {incidentType.label}
          </h3>
        </div>
        <span 
          className="px-2 py-1 text-xs font-medium rounded-full text-white"
          style={{ backgroundColor: severity.color }}
        >
          {severity.label}
        </span>
      </div>

      {/* Title */}
      <h4 className="font-medium text-neutral-900 mb-2">
        {incident.title}
      </h4>

      {/* Description */}
      {incident.description && (
        <p className="text-sm text-neutral-600 mb-3 line-clamp-3">
          {incident.description}
        </p>
      )}

      {/* Meta information */}
      <div className="space-y-1 text-xs text-neutral-500 mb-3">
        <div className="flex items-center space-x-2">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>
            {incident.locationName || 'Position non spécifiée'}
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>
            {formatDate(incident.createdAt)}
          </span>
        </div>

        {incident.user && (
          <div className="flex items-center space-x-2">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span>
              Signalé par {incident.user.firstName} {incident.user.lastName}
            </span>
          </div>
        )}
      </div>

      {/* Image preview */}
      {incident.image && (
        <div className="mb-3">
          <img 
            src={incident.image} 
            alt={incident.title}
            className="w-full h-32 object-cover rounded-lg"
            loading="lazy"
          />
        </div>
      )}

      {/* Actions */}
      <div className="flex space-x-2">
        {onViewDetails && (
          <button
            onClick={() => onViewDetails(incident)}
            className="flex-1 px-3 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors duration-200"
          >
            Voir les détails
          </button>
        )}
        
        {incident.status && (
          <span 
            className="px-3 py-2 text-xs font-medium rounded-lg text-white"
            style={{ backgroundColor: incident.status.color || '#6b7280' }}
          >
            {incident.status.label || incident.status}
          </span>
        )}
      </div>
    </div>
  );
};

/**
 * Incident Marker component
 * @param {object} props - Component props
 * @param {object} props.incident - Incident data
 * @param {function} [props.onViewDetails] - Callback for viewing details
 * @param {boolean} [props.selected=false] - Whether this marker is selected
 * @param {function} [props.onClick] - Click handler
 * @returns {JSX.Element} Incident marker
 */
const IncidentMarker = ({
  incident,
  onViewDetails,
  selected = false,
  onClick,
}) => {
  // Memoize icon to prevent recreation on every render
  const icon = useMemo(() => createIncidentIcon(incident), [incident]);

  // Handle marker click
  const handleMarkerClick = () => {
    if (onClick) {
      onClick(incident);
    }
  };

  // Handle view details
  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails(incident);
    }
  };

  return (
    <Marker
      position={[incident.latitude, incident.longitude]}
      icon={icon}
      eventHandlers={{
        click: handleMarkerClick,
      }}
      zIndexOffset={selected ? 1000 : 0}
    >
      <Popup
        maxWidth={350}
        minWidth={250}
        className="incident-popup"
      >
        <IncidentPopup 
          incident={incident} 
          onViewDetails={handleViewDetails}
        />
      </Popup>
    </Marker>
  );
};

export default IncidentMarker;
