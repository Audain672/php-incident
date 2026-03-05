/**
 * Register Page Component
 * SMART page component that handles registration logic and user redirection
 * @component
 */

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import RegisterForm from '../components/auth/RegisterForm.jsx';
import { FullPageSpinner } from '../components/common/Spinner.jsx';

/**
 * Register page component
 * @returns {JSX.Element} Register page
 */
const RegisterPage = () => {
  const navigate = useNavigate();
  const { register, isAuthenticated, isLoading: authLoading, error: authError } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      navigate('/map', { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate]);

  /**
   * Handle registration form submission
   * @param {object} userData - User registration data
   * @param {string} userData.firstName - User first name
   * @param {string} userData.lastName - User last name
   * @param {string} userData.email - User email
   * @param {string} userData.password - User password
   */
  const handleRegister = async (userData) => {
    try {
      await register(userData);
      // Navigation will be handled by the useEffect above
    } catch (error) {
      // Error is handled by the useAuth hook
      console.error('Registration failed:', error);
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
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-success-100">
            <svg
              className="h-8 w-8 text-success-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
              />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-neutral-900">
            Créer un compte
          </h2>
          <p className="mt-2 text-sm text-neutral-600">
            Rejoignez-nous pour signaler et suivre les incidents
          </p>
        </div>

        {/* Registration form */}
        <div className="bg-white py-8 px-6 shadow-lg rounded-lg">
          <RegisterForm
            onSubmit={handleRegister}
            isLoading={authLoading}
            error={authError?.message}
          />
        </div>

        {/* Additional links */}
        <div className="text-center space-y-2">
          <p className="text-sm text-neutral-600">
            Déjà un compte ?{' '}
            <a
              href="/login"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              Se connecter
            </a>
          </p>
          
          <div className="text-xs text-neutral-500">
            En créant un compte, vous acceptez nos{' '}
            <a href="/terms" className="text-primary-600 hover:text-primary-500">
              conditions d'utilisation
            </a>{' '}
            et notre{' '}
            <a href="/privacy" className="text-primary-600 hover:text-primary-500">
              politique de confidentialité
            </a>
          </div>
        </div>

        {/* Features preview */}
        <div className="mt-8">
          <div className="text-center">
            <h3 className="text-lg font-medium text-neutral-900 mb-4">
              Pourquoi nous rejoindre ?
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="text-center">
                <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-primary-100">
                  <svg
                    className="h-6 w-6 text-primary-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
                <h4 className="mt-2 text-sm font-medium text-neutral-900">
                  Signalement rapide
                </h4>
                <p className="mt-1 text-xs text-neutral-500">
                  Signalez les incidents en quelques clics
                </p>
              </div>
              
              <div className="text-center">
                <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-success-100">
                  <svg
                    className="h-6 w-6 text-success-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <h4 className="mt-2 text-sm font-medium text-neutral-900">
                  Suivi en temps réel
                </h4>
                <p className="mt-1 text-xs text-neutral-500">
                  Suivez l'évolution des incidents
                </p>
              </div>
              
              <div className="text-center">
                <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-warning-100">
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
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                    />
                  </svg>
                </div>
                <h4 className="mt-2 text-sm font-medium text-neutral-900">
                  Communauté active
                </h4>
                <p className="mt-1 text-xs text-neutral-500">
                  Rejoignez une communauté engagée
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
