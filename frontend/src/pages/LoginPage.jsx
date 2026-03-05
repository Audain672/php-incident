/**
 * Login Page Component
 * SMART page component that handles login logic and user redirection
 * @component
 */

import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import LoginForm from '../components/auth/LoginForm.jsx';
import { FullPageSpinner } from '../components/common/Spinner.jsx';

/**
 * Login page component
 * @returns {JSX.Element} Login page
 */
const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, isLoading: authLoading, error: authError } = useAuth();

  // Get redirect path from location state or default to /map
  const from = location.state?.from?.pathname || '/map';

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate, from]);

  /**
   * Handle login form submission
   * @param {object} credentials - Login credentials
   * @param {string} credentials.email - User email
   * @param {string} credentials.password - User password
   */
  const handleLogin = async (credentials) => {
    try {
      await login(credentials);
      // Navigation will be handled by the useEffect above
    } catch (error) {
      // Error is handled by the useAuth hook
      console.error('Login failed:', error);
    }
  };

  // Show loading spinner while checking authentication
  if (authLoading) {
    return <FullPageSpinner message="Vérification de l'authentification..." />;
  }

  // Don't render if already authenticated (redirecting)
  if (isAuthenticated) {
    return <FullPageSpinner message="Redirection..." />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-primary-100">
            <svg
              className="h-8 w-8 text-primary-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-neutral-900">
            Incident Reporter
          </h2>
          <p className="mt-2 text-sm text-neutral-600">
            Connectez-vous pour signaler et suivre les incidents
          </p>
        </div>

        {/* Login form */}
        <div className="bg-white py-8 px-6 shadow-lg rounded-lg">
          <LoginForm
            onSubmit={handleLogin}
            isLoading={authLoading}
            error={authError?.message}
          />
        </div>

        {/* Additional links */}
        <div className="text-center space-y-2">
          <p className="text-sm text-neutral-600">
            Pas encore de compte ?{' '}
            <a
              href="/register"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              Créer un compte
            </a>
          </p>
          
          <div className="text-xs text-neutral-500">
            En vous connectant, vous acceptez nos{' '}
            <a href="/terms" className="text-primary-600 hover:text-primary-500">
              conditions d'utilisation
            </a>{' '}
            et notre{' '}
            <a href="/privacy" className="text-primary-600 hover:text-primary-500">
              politique de confidentialité
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
