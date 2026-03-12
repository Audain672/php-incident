/**
 * Debug Panel Component
 * Development tool for testing localStorage and API functionality
 * @component
 */

import React, { useState, useEffect } from 'react';
import { useApiConfig } from '../../hooks/index.js';
import { authStorage } from '../../utils/localStorage.js';

/**
 * Debug Panel component
 * @returns {JSX.Element} Debug panel
 */
const DebugPanel = () => {
  const { isLocalMode, config } = useApiConfig();
  const [testResults, setTestResults] = useState({});
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (config.debug && isExpanded) {
      runTests();
    }
  }, [config.debug, isExpanded]);

  const runTests = () => {
    const results = {};

    // Test localStorage availability
    try {
      localStorage.setItem('test', 'value');
      const value = localStorage.getItem('test');
      localStorage.removeItem('test');
      results.localStorage = { success: true, message: '✅ localStorage available' };
    } catch (error) {
      results.localStorage = { success: false, message: `❌ ${error.message}` };
    }

    // Test auth storage
    try {
      const testUser = {
        id: 'test-1',
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        role: 'user'
      };
      
      authStorage.setUser(testUser);
      authStorage.setToken('test-token-' + Date.now());
      
      const storedUser = authStorage.getUser();
      const storedToken = authStorage.getToken();
      
      if (storedUser?.email === testUser.email && storedToken) {
        results.authStorage = { success: true, message: '✅ Auth storage works' };
      } else {
        results.authStorage = { success: false, message: '❌ Auth storage failed' };
      }
      
      // Cleanup
      authStorage.clearAuth();
    } catch (error) {
      results.authStorage = { success: false, message: `❌ ${error.message}` };
    }

    // Test incident storage
    try {
      const testIncident = {
        id: 'test-incident-' + Date.now(),
        title: 'Test Incident',
        description: 'Debug test incident',
        severity: 'medium',
        status: 'open',
        location: { lat: 48.8566, lng: 2.3522 },
        createdAt: new Date().toISOString()
      };
      
      const incidents = JSON.parse(localStorage.getItem('incidents') || '[]');
      incidents.push(testIncident);
      localStorage.setItem('incidents', JSON.stringify(incidents));
      
      const storedIncidents = JSON.parse(localStorage.getItem('incidents') || '[]');
      const foundIncident = storedIncidents.find(inc => inc.id === testIncident.id);
      
      if (foundIncident) {
        results.incidentStorage = { success: true, message: '✅ Incident storage works' };
      } else {
        results.incidentStorage = { success: false, message: '❌ Incident storage failed' };
      }
      
      // Cleanup
      const updatedIncidents = storedIncidents.filter(inc => inc.id !== testIncident.id);
      localStorage.setItem('incidents', JSON.stringify(updatedIncidents));
    } catch (error) {
      results.incidentStorage = { success: false, message: `❌ ${error.message}` };
    }

    // Check mock data
    try {
      const mockUsers = JSON.parse(localStorage.getItem('mock_users') || '[]');
      const mockIncidents = JSON.parse(localStorage.getItem('mock_incidents') || '[]');
      
      results.mockData = { 
        success: true, 
        message: `✅ ${mockUsers.length} users, ${mockIncidents.length} incidents` 
      };
    } catch (error) {
      results.mockData = { success: false, message: `❌ ${error.message}` };
    }

    setTestResults(results);
  };

  const clearAllData = () => {
    if (confirm('Êtes-vous sûr de vouloir effacer toutes les données localStorage ?')) {
      localStorage.clear();
      setTestResults({});
      alert('Toutes les données ont été effacées');
    }
  };

  const loadMockData = () => {
    // This would trigger the mock data loading in localAuthApi
    window.location.reload();
  };

  if (!config.debug) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 max-w-sm">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-4 py-2 text-left font-medium text-gray-700 hover:bg-gray-50 rounded-t-lg flex items-center justify-between"
        >
          <span>🔧 Debug Panel</span>
          <span className="text-gray-400">{isExpanded ? '▼' : '▶'}</span>
        </button>
        
        {isExpanded && (
          <div className="p-4 border-t border-gray-200">
            <div className="space-y-2 text-xs">
              <div className="font-medium text-gray-700">Mode: {isLocalMode ? '🟢 LOCAL' : '🔵 API'}</div>
              <div className="text-gray-600">Environment: {config.mode}</div>
              <div className="text-gray-600">Mock Delay: {config.mockDelay ? 'ON' : 'OFF'}</div>
              
              <div className="pt-2 border-t border-gray-200">
                <button
                  onClick={runTests}
                  className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs"
                >
                  Run Tests
                </button>
                <button
                  onClick={loadMockData}
                  className="ml-2 px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-xs"
                >
                  Load Mock Data
                </button>
                <button
                  onClick={clearAllData}
                  className="ml-2 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs"
                >
                  Clear All
                </button>
              </div>
              
              {Object.keys(testResults).length > 0 && (
                <div className="pt-2 border-t border-gray-200 space-y-1">
                  {Object.entries(testResults).map(([key, result]) => (
                    <div key={key} className={result.success ? 'text-green-600' : 'text-red-600'}>
                      {result.message}
                    </div>
                  ))}
                </div>
              )}
              
              <div className="pt-2 border-t border-gray-200 text-gray-500">
                <div>Test Accounts:</div>
                <div>admin@example.com / admin123</div>
                <div>demo@example.com / demo123</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DebugPanel;
