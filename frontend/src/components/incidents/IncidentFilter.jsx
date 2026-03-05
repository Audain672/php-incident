/**
 * Incident Filter Component
 * DUMB component for filtering incidents with various criteria
 * @component
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { INCIDENT_TYPES, SEVERITY_LEVELS, INCIDENT_STATUS } from '../../utils/constants.js';
import Input from '../common/Input.jsx';
import Button from '../common/Button.jsx';

/**
 * Incident filter component
 * @param {object} props - Component props
 * @param {object} props.filters - Current filter values
 * @param {function} props.onFiltersChange - Callback when filters change
 * @param {function} props.onReset - Callback to reset filters
 * @param {boolean} [props.compact=false] - Whether to show compact version
 * @param {string} [props.className=''] - Additional CSS classes
 * @returns {JSX.Element} Filter component
 */
const IncidentFilter = ({
  filters,
  onFiltersChange,
  onReset,
  compact = false,
  className = '',
}) => {
  const [isExpanded, setIsExpanded] = useState(!compact);

  /**
   * Handle filter change
   * @param {string} name - Filter name
   * @param {any} value - Filter value
   */
  const handleFilterChange = (name, value) => {
    onFiltersChange({
      ...filters,
      [name]: value,
    });
  };

  /**
   * Handle date range change
   * @param {string} type - 'from' or 'to'
   * @param {string} value - Date value
   */
  const handleDateChange = (type, value) => {
    onFiltersChange({
      ...filters,
      [`date${type.charAt(0).toUpperCase() + type.slice(1)}`]: value,
    });
  };

  /**
   * Handle reset
   */
  const handleReset = () => {
    onReset();
    setIsExpanded(!compact);
  };

  /**
   * Get active filters count
   * @returns {number} Number of active filters
   */
  const getActiveFiltersCount = () => {
    let count = 0;
    Object.keys(filters).forEach(key => {
      if (filters[key] && filters[key] !== '') {
        count++;
      }
    });
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  if (compact) {
    return (
      <div className={`bg-white border border-neutral-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Search */}
            <Input
              name="search"
              type="text"
              placeholder="Rechercher un incident..."
              value={filters.search || ''}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-64"
              size="sm"
            />

            {/* Quick filters */}
            <select
              value={filters.type || ''}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="px-3 py-1.5 text-sm border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Tous les types</option>
              {Object.values(INCIDENT_TYPES).map(type => (
                <option key={type.id} value={type.id}>
                  {type.icon} {type.label}
                </option>
              ))}
            </select>

            <select
              value={filters.severity || ''}
              onChange={(e) => handleFilterChange('severity', e.target.value)}
              className="px-3 py-1.5 text-sm border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Toutes les gravités</option>
              {Object.values(SEVERITY_LEVELS).map(level => (
                <option key={level.id} value={level.id}>
                  {level.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            {activeFiltersCount > 0 && (
              <span className="text-sm text-neutral-600">
                {activeFiltersCount} filtre{activeFiltersCount > 1 ? 's' : ''} actif{activeFiltersCount > 1 ? 's' : ''}
              </span>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? 'Moins' : 'Plus'} de filtres
            </Button>
          </div>
        </div>

        {/* Expanded filters */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-neutral-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Status filter */}
              <select
                value={filters.status || ''}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Tous les statuts</option>
                {Object.values(INCIDENT_STATUS).map(status => (
                  <option key={status.id} value={status.id}>
                    {status.label}
                  </option>
                ))}
              </select>

              {/* Date from */}
              <Input
                name="dateFrom"
                type="date"
                label="Date de début"
                value={filters.dateFrom || ''}
                onChange={(e) => handleDateChange('from', e.target.value)}
                size="sm"
              />

              {/* Date to */}
              <Input
                name="dateTo"
                type="date"
                label="Date de fin"
                value={filters.dateTo || ''}
                onChange={(e) => handleDateChange('to', e.target.value)}
                size="sm"
              />
            </div>

            <div className="mt-4 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
              >
                Réinitialiser
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`bg-white border border-neutral-200 rounded-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-neutral-900">
          Filtres
        </h3>
        
        {activeFiltersCount > 0 && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-neutral-600">
              {activeFiltersCount} filtre{activeFiltersCount > 1 ? 's' : ''} actif{activeFiltersCount > 1 ? 's' : ''}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
            >
              Réinitialiser
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Search */}
        <Input
          name="search"
          type="text"
          label="Recherche"
          placeholder="Rechercher par titre ou description..."
          value={filters.search || ''}
          onChange={(e) => handleFilterChange('search', e.target.value)}
        />

        {/* Type filter */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Type d'incident
          </label>
          <select
            value={filters.type || ''}
            onChange={(e) => handleFilterChange('type', e.target.value)}
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">Tous les types</option>
            {Object.values(INCIDENT_TYPES).map(type => (
              <option key={type.id} value={type.id}>
                {type.icon} {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Severity filter */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Niveau de gravité
          </label>
          <select
            value={filters.severity || ''}
            onChange={(e) => handleFilterChange('severity', e.target.value)}
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">Toutes les gravités</option>
            {Object.values(SEVERITY_LEVELS).map(level => (
              <option key={level.id} value={level.id}>
                {level.label}
              </option>
            ))}
          </select>
        </div>

        {/* Status filter */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Statut
          </label>
          <select
            value={filters.status || ''}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">Tous les statuts</option>
            {Object.values(INCIDENT_STATUS).map(status => (
              <option key={status.id} value={status.id}>
                {status.label}
              </option>
            ))}
          </select>
        </div>

        {/* Date from */}
        <Input
          name="dateFrom"
          type="date"
          label="Date de début"
          value={filters.dateFrom || ''}
          onChange={(e) => handleDateChange('from', e.target.value)}
        />

        {/* Date to */}
        <Input
          name="dateTo"
          type="date"
          label="Date de fin"
          value={filters.dateTo || ''}
          onChange={(e) => handleDateChange('to', e.target.value)}
        />
      </div>
    </div>
  );
};

IncidentFilter.propTypes = {
  filters: PropTypes.shape({
    search: PropTypes.string,
    type: PropTypes.string,
    severity: PropTypes.string,
    status: PropTypes.string,
    dateFrom: PropTypes.string,
    dateTo: PropTypes.string,
  }).isRequired,
  onFiltersChange: PropTypes.func.isRequired,
  onReset: PropTypes.func.isRequired,
  compact: PropTypes.bool,
  className: PropTypes.string,
};

export default IncidentFilter;
