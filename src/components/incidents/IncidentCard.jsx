/**
 * Incident Card Component
 * DUMB component displaying incident information in card format
 * @component
 */

import React from 'react';
import PropTypes from 'prop-types';
import { INCIDENT_TYPES, SEVERITY_LEVELS, INCIDENT_STATUS } from '../../utils/constants.js';

/**
 * Incident card component
 * @param {object} props - Component props
 * @param {boolean} [props.isSelected] - Whether card is selected
 * @param {function} props.onClick - Callback for viewing details
 * @param {function} [props.onMouseEnter] - Callback for hover enter
 * @param {function} [props.onMouseLeave] - Callback for hover leave
 * @param {function} [props.onEdit] - Callback for editing
 * @param {function} [props.onDelete] - Callback for deleting
 * @param {boolean} [props.isAdmin] - Whether user is admin
 * @param {boolean} [props.compact=false] - Whether to show compact version
 * @param {string} [props.className=''] - Additional CSS classes
 * @param {object} [props.cardRef] - Ref for scrolling
 * @returns {JSX.Element} Incident card
 */
const IncidentCard = ({
  incident,
  isSelected,
  onClick,
  onMouseEnter,
  onMouseLeave,
  onEdit,
  onDelete,
  isAdmin,
  cardRef,
  compact = false,
  className = '',
}) => {
  const incidentType = INCIDENT_TYPES[incident.type?.toUpperCase()] || INCIDENT_TYPES.OTHER;
  const severity = SEVERITY_LEVELS[incident.severity?.toUpperCase()] || SEVERITY_LEVELS.MEDIUM;
  const status = INCIDENT_STATUS[incident.status?.toUpperCase()] || INCIDENT_STATUS.PENDING;

  /**
   * Format date for display
   * @param {string} dateString - Date string
   * @returns {string} Formatted date
   */
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

  /**
   * Truncate text to specified length
   * @param {string} text - Text to truncate
   * @param {number} maxLength - Maximum length
   * @returns {string} Truncated text
   */
  const truncateText = (text, maxLength = 100) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  const cardClasses = `cursor-pointer rounded-xl p-3 mb-2 border-2 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${isSelected ? 'border-primary-500 bg-primary-50 shadow-md' : 'border-transparent bg-white hover:border-neutral-200'} ${className}`;

  if (compact) {
    return (
      <div 
        ref={cardRef}
        className={cardClasses}
        onClick={() => onClick?.(incident)}
        onMouseEnter={() => onMouseEnter?.(incident)}
        onMouseLeave={() => onMouseLeave?.(incident)}
      >
        <div className="flex items-start space-x-3">
          {/* Icon */}
          <div className="flex-shrink-0">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
              style={{ backgroundColor: `${incidentType.color}20` }}
            >
              <span style={{ color: incidentType.color }}>
                {incidentType.icon}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-neutral-900 truncate">
                {incident.title}
              </h3>
              <span 
                className="px-2 py-1 text-xs font-medium rounded-full text-white"
                style={{ backgroundColor: severity.color }}
              >
                {severity.label}
              </span>
            </div>
            
            <p className="text-xs text-neutral-600 mt-1">
              {incidentType.label} • {formatDate(incident.createdAt)}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={cardRef}
      className={`${cardClasses} p-1`} // Extra padding to simulate difference from compact wrapper
      onClick={() => onClick?.(incident)}
      onMouseEnter={() => onMouseEnter?.(incident)}
      onMouseLeave={() => onMouseLeave?.(incident)}
    >
      {/* Header */}
      <div className="p-4 border-b border-neutral-200">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            {/* Type icon */}
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center text-xl"
              style={{ backgroundColor: `${incidentType.color}20` }}
            >
              <span style={{ color: incidentType.color }}>
                {incidentType.icon}
              </span>
            </div>
            
            {/* Title and type */}
            <div>
              <h3 className="text-lg font-semibold text-neutral-900">
                {incident.title}
              </h3>
              <p className="text-sm text-neutral-600">
                {incidentType.label}
              </p>
            </div>
          </div>

          {/* Severity badge */}
          <span 
            className="px-3 py-1 text-sm font-medium rounded-full text-white"
            style={{ backgroundColor: severity.color }}
          >
            {severity.label}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Description */}
        {incident.description && (
          <p className="text-neutral-700 mb-4">
            {truncateText(incident.description, 150)}
          </p>
        )}

        {/* Image */}
        {incident.image && (
          <div className="mb-4">
            <img 
              src={incident.image} 
              alt={incident.title}
              className="w-full h-48 object-cover rounded-lg"
              loading="lazy"
            />
          </div>
        )}

        {/* Meta information */}
        <div className="space-y-2 text-sm text-neutral-600 mb-4">
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>
              {formatDate(incident.createdAt)}
            </span>
          </div>

          {incident.user && (
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>
                {incident.user.firstName} {incident.user.lastName}
              </span>
            </div>
          )}
        </div>

        {/* Status badge */}
        <div className="flex items-center justify-between mb-4">
          <span 
            className="px-3 py-1 text-sm font-medium rounded-lg text-white"
            style={{ backgroundColor: status.color }}
          >
            {status.label}
          </span>
        </div>

        {/* Actions */}
        <div className="flex space-x-2">
          {onClick && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClick(incident);
              }}
              className="flex-1 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors duration-200"
            >
              Voir les détails
            </button>
          )}
          
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(incident);
              }}
              className="px-4 py-2 bg-neutral-100 text-neutral-700 text-sm font-medium rounded-lg hover:bg-neutral-200 transition-colors duration-200"
            >
              Modifier
            </button>
          )}
          
          {(onDelete && isAdmin) && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(incident);
              }}
              className="px-4 py-2 bg-danger-100 text-danger-700 text-sm font-medium rounded-lg hover:bg-danger-200 transition-colors duration-200"
            >
              Supprimer
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

IncidentCard.propTypes = {
  incident: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    type: PropTypes.string,
    severity: PropTypes.string,
    status: PropTypes.string,
    latitude: PropTypes.number.isRequired,
    longitude: PropTypes.number.isRequired,
    locationName: PropTypes.string,
    image: PropTypes.string,
    createdAt: PropTypes.string,
    user: PropTypes.shape({
      firstName: PropTypes.string,
      lastName: PropTypes.string,
    }),
  }).isRequired,
  isSelected: PropTypes.bool,
  onClick: PropTypes.func.isRequired,
  onMouseEnter: PropTypes.func,
  onMouseLeave: PropTypes.func,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  isAdmin: PropTypes.bool,
  cardRef: PropTypes.oneOfType([
    PropTypes.func, 
    PropTypes.shape({ current: PropTypes.instanceOf(Element) })
  ]),
  compact: PropTypes.bool,
  className: PropTypes.string,
};

export default IncidentCard;
