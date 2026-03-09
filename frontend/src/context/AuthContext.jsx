/**
 * Authentication Context Provider
 * Provides authentication state and methods to the entire application
 * @module AuthContext
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getCurrentUser } from '../api/localAuthApi.js';
import { authStorage } from '../utils/localStorage.js';
import { validateToken } from '../utils/helpers.js';

/**
 * Authentication context
 */
const AuthContext = createContext(null);

/**
 * Authentication Provider component
 * @param {object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {JSX.Element} Authentication provider
 */
export const AuthProvider = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const queryClient = useQueryClient();

  // Query to get current user data
  const {
    data: user,
    isLoading,
    error,
    refetch: refetchUser,
  } = useQuery({
    queryKey: ['auth', 'user'],
    queryFn: getCurrentUser,
    enabled: authStorage.isAuthenticated(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry on 401/403 errors
      if (error.response?.status === 401 || error.response?.status === 403) {
        return false;
      }
      return failureCount < 2;
    },
  });

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = () => {
      // Check if we have a valid token in localStorage
      if (authStorage.isAuthenticated()) {
        // Try to get user data from localStorage first (faster)
        const storedUser = authStorage.getUser();
        if (storedUser) {
          // We'll still fetch fresh data from server, but this gives us immediate state
        }
      }
      setIsInitialized(true);
    };

    initializeAuth();
  }, []);

  // Handle logout event
  useEffect(() => {
    const handleLogout = () => {
      authStorage.clearAuth();
      queryClient.clear(); // Clear all query cache
      queryClient.invalidateQueries({ queryKey: ['auth'] });
    };

    window.addEventListener('auth:logout', handleLogout);
    return () => window.removeEventListener('auth:logout', handleLogout);
  }, [queryClient]);

  // Handle auth errors
  useEffect(() => {
    if (error) {
      // If we get a 401/403, clear tokens and trigger logout
      if (error.response?.status === 401 || error.response?.status === 403) {
        authStorage.clearAuth();
        queryClient.clear();
        window.dispatchEvent(new CustomEvent('auth:logout'));
      }
    }
  }, [error, queryClient]);

  /**
   * Login function - should be called after successful API login
   * @param {object} userData - User data from login response
   * @param {string} userData.token - JWT token
   * @param {object} userData.user - User information
   */
  const login = (userData) => {
    // Auth data is already set by the login API call
    // Just invalidate and refetch user data
    queryClient.invalidateQueries({ queryKey: ['auth'] });
    refetchUser();
  };

  /**
   * Logout function
   */
  const logout = () => {
    authStorage.clearAuth();
    queryClient.clear();
    window.dispatchEvent(new CustomEvent('auth:logout'));
  };

  /**
   * Check if user is authenticated
   * @returns {boolean} Authentication status
   */
  const checkAuth = () => {
    return authStorage.isAuthenticated();
  };

  /**
   * Get user role
   * @returns {string|null} User role or null
   */
  const getUserRole = () => {
    return user?.role || authStorage.getUser()?.role || null;
  };

  /**
   * Check if user has specific role
   * @param {string|string[]} roles - Role(s) to check
   * @returns {boolean} True if user has the role(s)
   */
  const hasRole = (roles) => {
    const userRole = getUserRole();
    if (!userRole) return false;
    
    if (Array.isArray(roles)) {
      return roles.includes(userRole);
    }
    
    return userRole === roles;
  };

  /**
   * Check if user is admin
   * @returns {boolean} True if user is admin
   */
  const isAdmin = () => {
    return hasRole('admin');
  };

  /**
   * Check if user is moderator or higher
   * @returns {boolean} True if user is moderator or admin
   */
  const isModerator = () => {
    return hasRole(['moderator', 'admin']);
  };

  // Context value
  const value = {
    // State
    user: user || null,
    isLoading: isLoading || !isInitialized,
    isAuthenticated: authStorage.isAuthenticated(),
    error,

    // Methods
    login,
    logout,
    refetchUser,
    checkAuth,
    getUserRole,
    hasRole,
    isAdmin,
    isModerator,
  };

  // Don't render children until auth is initialized
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-neutral-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook to use authentication context
 * @returns {object} Authentication context value
 * @throws {Error} If used outside AuthProvider
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

/**
 * Hook to require authentication
 * @returns {object} Authentication context value
 * @throws {Error} If user is not authenticated
 */
export const useRequireAuth = () => {
  const auth = useAuth();
  
  if (!auth.isAuthenticated) {
    throw new Error('Authentication required');
  }
  
  return auth;
};

/**
 * Hook to require specific role
 * @param {string|string[]} roles - Required role(s)
 * @returns {object} Authentication context value
 * @throws {Error} If user doesn't have required role
 */
export const useRequireRole = (roles) => {
  const auth = useAuth();
  
  if (!auth.isAuthenticated) {
    throw new Error('Authentication required');
  }
  
  if (!auth.hasRole(roles)) {
    throw new Error(`Required role(s) not found: ${Array.isArray(roles) ? roles.join(', ') : roles}`);
  }
  
  return auth;
};

export default AuthContext;
