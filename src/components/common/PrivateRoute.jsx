/**
 * Private Route Component
 * HOC to protect routes that require authentication
 * @component
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import { FullPageSpinner } from './Spinner.jsx';

/**
 * Private Route component that protects routes requiring authentication
 * @param {object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render if authenticated
 * @param {string|string[]} [props.requiredRoles] - Required role(s) to access the route
 * @param {string} [props.redirectTo='/login'] - Path to redirect to if not authenticated
 * @param {React.Component} [props.fallback] - Fallback component to show while loading
 * @returns {JSX.Element} Protected route component
 */
const PrivateRoute = ({
  children,
  requiredRoles = null,
  redirectTo = '/login',
  fallback = null,
}) => {
  const location = useLocation();
  const { isAuthenticated, isLoading, hasRole } = useAuth();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return fallback || <FullPageSpinner message="Vérification de l'authentification..." />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    // Save the attempted location for redirect after login
    const state = { from: location };
    return <Navigate to={redirectTo} state={state} replace />;
  }

  // Check role requirements if specified
  if (requiredRoles) {
    if (!hasRole(requiredRoles)) {
      // User is authenticated but doesn't have required roles
      return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-50">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-warning-100 mb-4">
              <svg
                className="h-6 w-6 text-warning-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-neutral-900 mb-2">
              Accès non autorisé
            </h1>
            <p className="text-neutral-600 mb-6">
              Vous n'avez pas les permissions nécessaires pour accéder à cette page.
            </p>
            <button
              type="button"
              onClick={() => window.history.back()}
              className="inline-flex items-center px-4 py-2 border border-neutral-300 text-sm font-medium rounded-lg text-neutral-700 bg-white hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Retour
            </button>
          </div>
        </div>
      );
    }
  }

  // User is authenticated and has required roles
  return children;
};

PrivateRoute.propTypes = {
  children: PropTypes.node.isRequired,
  requiredRoles: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string),
  ]),
  redirectTo: PropTypes.string,
  fallback: PropTypes.node,
};

/**
 * Higher-order component to wrap components with private route protection
 * @param {React.Component} Component - Component to protect
 * @param {object} [options] - Protection options
 * @param {string|string[]} [options.requiredRoles] - Required role(s)
 * @param {string} [options.redirectTo] - Redirect path
 * @returns {React.Component} Protected component
 */
export const withPrivateRoute = (Component, options = {}) => {
  const ProtectedComponent = (props) => (
    <PrivateRoute {...options}>
      <Component {...props} />
    </PrivateRoute>
  );

  ProtectedComponent.displayName = `withPrivateRoute(${Component.displayName || Component.name})`;

  return ProtectedComponent;
};

/**
 * Admin-only route component
 */
export const AdminRoute = ({ children, ...props }) => (
  <PrivateRoute requiredRoles="admin" {...props}>
    {children}
  </PrivateRoute>
);

AdminRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

/**
 * Moderator or admin route component
 */
export const ModeratorRoute = ({ children, ...props }) => (
  <PrivateRoute requiredRoles={['moderator', 'admin']} {...props}>
    {children}
  </PrivateRoute>
);

ModeratorRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

/**
 * Role-based route component
 */
export const RoleRoute = ({ roles, children, ...props }) => (
  <PrivateRoute requiredRoles={roles} {...props}>
    {children}
  </PrivateRoute>
);

RoleRoute.propTypes = {
  roles: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string),
  ]).isRequired,
  children: PropTypes.node.isRequired,
};

/**
 * Hook to check if current route requires authentication
 * @returns {object} Route protection info
 */
export const useRouteProtection = () => {
  const { isAuthenticated, isLoading, user, hasRole } = useAuth();
  const location = useLocation();

  return {
    isAuthenticated,
    isLoading,
    user,
    hasRole,
    location,
    canAccess: (requiredRoles) => {
      if (!isAuthenticated) return false;
      if (!requiredRoles) return true;
      return hasRole(requiredRoles);
    },
  };
};

export default PrivateRoute;
