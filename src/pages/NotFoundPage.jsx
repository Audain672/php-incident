/**
 * Not Found Page Component
 * 404 error page with navigation options
 * @component
 */

import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Button from '../components/common/Button.jsx';

/**
 * Not found page component
 * @returns {JSX.Element} 404 page
 */
const NotFoundPage = () => {
  const navigate = useNavigate();

  /**
   * Handle go back navigation
   */
  const handleGoBack = () => {
    navigate(-1);
  };

  /**
   * Handle go home navigation
   */
  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        {/* 404 Icon */}
        <div className="mx-auto h-24 w-24 flex items-center justify-center rounded-full bg-neutral-100 mb-8">
          <div className="text-4xl font-bold text-neutral-400">404</div>
        </div>

        {/* Error message */}
        <h1 className="text-3xl font-bold text-neutral-900 mb-4">
          Page non trouvée
        </h1>
        
        <p className="text-neutral-600 mb-8">
          Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
        </p>

        {/* Action buttons */}
        <div className="space-y-4">
          <Button
            variant="primary"
            size="lg"
            onClick={handleGoHome}
            className="w-full"
          >
            Retour à l'accueil
          </Button>
          
          <Button
            variant="ghost"
            size="md"
            onClick={handleGoBack}
            className="w-full"
          >
            Retour en arrière
          </Button>
        </div>

        {/* Helpful links */}
        <div className="mt-12 pt-8 border-t border-neutral-200">
          <h2 className="text-lg font-medium text-neutral-900 mb-4">
            Vous cherchiez peut-être :
          </h2>
          
          <div className="grid grid-cols-1 gap-3">
            <Link
              to="/"
              className="block text-left px-4 py-3 text-sm text-neutral-700 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-50 hover:border-primary-300 transition-colors duration-200"
            >
              <div className="font-medium">Page d'accueil</div>
              <div className="text-neutral-500 text-xs">Retourner à la page principale</div>
            </Link>
            
            <Link
              to="/login"
              className="block text-left px-4 py-3 text-sm text-neutral-700 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-50 hover:border-primary-300 transition-colors duration-200"
            >
              <div className="font-medium">Connexion</div>
              <div className="text-neutral-500 text-xs">Accéder à votre compte</div>
            </Link>
            
            <Link
              to="/register"
              className="block text-left px-4 py-3 text-sm text-neutral-700 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-50 hover:border-primary-300 transition-colors duration-200"
            >
              <div className="font-medium">Inscription</div>
              <div className="text-neutral-500 text-xs">Créer un nouveau compte</div>
            </Link>
            
            <Link
              to="/map"
              className="block text-left px-4 py-3 text-sm text-neutral-700 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-50 hover:border-primary-300 transition-colors duration-200"
            >
              <div className="font-medium">Carte des incidents</div>
              <div className="text-neutral-500 text-xs">Voir les incidents sur la carte</div>
            </Link>
          </div>
        </div>

        {/* Contact support */}
        <div className="mt-12 pt-8 border-t border-neutral-200">
          <h3 className="text-sm font-medium text-neutral-900 mb-2">
            Besoin d'aide ?
          </h3>
          <p className="text-sm text-neutral-600 mb-4">
            Si vous pensez qu'il s'agit d'une erreur, contactez notre support.
          </p>
          <div className="flex justify-center space-x-4">
            <a
              href="mailto:support@incidentreporter.com"
              className="text-primary-600 hover:text-primary-500 text-sm font-medium"
            >
              Support par email
            </a>
            <span className="text-neutral-400">•</span>
            <a
              href="/help"
              className="text-primary-600 hover:text-primary-500 text-sm font-medium"
            >
              Centre d'aide
            </a>
          </div>
        </div>

        {/* Fun illustration */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-neutral-100 rounded-full">
            <svg
              className="w-8 h-8 text-neutral-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <p className="mt-2 text-xs text-neutral-500">
            Même les meilleurs explorateurs se perdent parfois
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
