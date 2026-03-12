/**
 * API Mode Indicator Component
 * Displays current API mode (local/api) for development
 * @component
 */

import React from 'react';
import { useApiConfig } from '../../hooks/index.js';

/**
 * API Mode Indicator component
 * @returns {JSX.Element} API mode indicator
 */
const ApiModeIndicator = () => {
  const { isLocalMode, isApiMode, config } = useApiConfig();

  if (config.debug === false) {
    return null; // Don't show in production
  }

  const modeColor = isLocalMode ? 'bg-green-500' : 'bg-blue-500';
  const modeText = isLocalMode ? 'LOCAL' : 'API';
  const modeDescription = isLocalMode 
    ? 'Mode localStorage (développement)' 
    : `Mode API: ${config.baseUrl}`;

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="flex items-center space-x-2 bg-white rounded-lg shadow-lg p-2 border border-gray-200">
        <div className={`w-3 h-3 rounded-full ${modeColor} animate-pulse`}></div>
        <div className="text-xs font-medium text-gray-700">
          <span className="font-bold">{modeText}</span>
          <div className="text-gray-500 hidden sm:block">
            {modeDescription}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiModeIndicator;
