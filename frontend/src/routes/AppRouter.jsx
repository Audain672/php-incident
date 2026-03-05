/**
 * App Router Component
 * Main routing configuration with authentication protection
 * @component
 */

import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext.jsx';
import { ErrorBoundary } from '../components/common/ErrorBoundary.jsx';
import { FullPageSpinner } from '../components/common/Spinner.jsx';
import PrivateRoute from '../components/common/PrivateRoute.jsx';

// Lazy load pages for better performance
const HomePage = React.lazy(() => import('../pages/HomePage.jsx'));
const LoginPage = React.lazy(() => import('../pages/LoginPage.jsx'));
const RegisterPage = React.lazy(() => import('../pages/RegisterPage.jsx'));
const MapPage = React.lazy(() => import('../pages/MapPage.jsx'));
const NotFoundPage = React.lazy(() => import('../pages/NotFoundPage.jsx'));

/**
 * Loading fallback component for lazy loaded pages
 */
const PageLoader = () => (
  <FullPageSpinner message="Chargement de la page..." />
);

/**
 * App router component with authentication and error handling
 * @returns {JSX.Element} Router component
 */
const AppRouter = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Public routes */}
              <Route 
                path="/" 
                element={<HomePage />} 
              />
              
              <Route 
                path="/login" 
                element={<LoginPage />} 
              />
              
              <Route 
                path="/register" 
                element={<RegisterPage />} 
              />

              {/* Protected routes */}
              <Route
                path="/map"
                element={
                  <PrivateRoute>
                    <MapPage />
                  </PrivateRoute>
                }
              />

              {/* Additional protected routes can be added here */}
              <Route
                path="/profile"
                element={
                  <PrivateRoute>
                    <Suspense fallback={<PageLoader />}>
                      {/* Future ProfilePage component */}
                      <div>Profile Page (Coming Soon)</div>
                    </Suspense>
                  </PrivateRoute>
                }
              />

              <Route
                path="/admin"
                element={
                  <PrivateRoute requiredRoles="admin">
                    <Suspense fallback={<PageLoader />}>
                      {/* Future AdminPage component */}
                      <div>Admin Page (Coming Soon)</div>
                    </Suspense>
                  </PrivateRoute>
                }
              />

              {/* Redirect old routes */}
              <Route 
                path="/home" 
                element={<Navigate to="/" replace />} 
              />
              
              <Route 
                path="/signin" 
                element={<Navigate to="/login" replace />} 
              />
              
              <Route 
                path="/signup" 
                element={<Navigate to="/register" replace />} 
              />

              {/* 404 Not Found */}
              <Route 
                path="*" 
                element={<NotFoundPage />} 
              />
            </Routes>
          </Suspense>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default AppRouter;
