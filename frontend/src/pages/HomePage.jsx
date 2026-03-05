/**
 * Home Page Component
 * Landing page with app introduction and navigation
 * @component
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import Button from '../components/common/Button.jsx';

/**
 * Home page component
 * @returns {JSX.Element} Home page
 */
const HomePage = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <svg
                    className="h-5 w-5 text-white"
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
                <span className="ml-3 text-xl font-bold text-neutral-900">
                  Incident Reporter
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <Link to="/map">
                  <Button variant="primary" size="sm">
                    Accéder à la carte
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/login">
                    <Button variant="ghost" size="sm">
                      Connexion
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button variant="primary" size="sm">
                      Inscription
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-neutral-900 sm:text-5xl md:text-6xl">
            Signalez les incidents
            <span className="block text-primary-600">en temps réel</span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-neutral-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Une plateforme collaborative pour signaler, suivre et résoudre les incidents dans votre quartier.
            Rejoignez la communauté et contribuez à la sécurité de tous.
          </p>
          <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
            <div className="rounded-md shadow">
              {isAuthenticated ? (
                <Link to="/map">
                  <Button variant="primary" size="lg" className="w-full">
                    Voir la carte des incidents
                  </Button>
                </Link>
              ) : (
                <Link to="/register">
                  <Button variant="primary" size="lg" className="w-full">
                    Commencer maintenant
                  </Button>
                </Link>
              )}
            </div>
            <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
              <Link to="/map">
                <Button variant="outline" size="lg" className="w-full">
                  Explorer la carte
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Features section */}
        <div className="mt-20">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-neutral-900">
              Pourquoi choisir Incident Reporter ?
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-neutral-500">
              Une solution simple et efficace pour améliorer la sécurité et la qualité de vie dans votre communauté.
            </p>
          </div>

          <div className="mt-12">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {/* Feature 1 */}
              <div className="pt-6">
                <div className="flow-root bg-white rounded-lg px-6 pb-8 shadow-lg">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-primary-500 rounded-md shadow-lg">
                        <svg
                          className="h-6 w-6 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-neutral-900 tracking-tight">
                      Signalement rapide
                    </h3>
                    <p className="mt-5 text-base text-neutral-500">
                      Signalez les incidents en quelques clics avec notre interface intuitive et mobile-friendly.
                    </p>
                  </div>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="pt-6">
                <div className="flow-root bg-white rounded-lg px-6 pb-8 shadow-lg">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-success-500 rounded-md shadow-lg">
                        <svg
                          className="h-6 w-6 text-white"
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
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-neutral-900 tracking-tight">
                      Suivi en temps réel
                    </h3>
                    <p className="mt-5 text-base text-neutral-500">
                      Suivez l'évolution des incidents et recevez des notifications sur leur résolution.
                    </p>
                  </div>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="pt-6">
                <div className="flow-root bg-white rounded-lg px-6 pb-8 shadow-lg">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-warning-500 rounded-md shadow-lg">
                        <svg
                          className="h-6 w-6 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                          />
                        </svg>
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-neutral-900 tracking-tight">
                      Communauté active
                    </h3>
                    <p className="mt-5 text-base text-neutral-500">
                      Rejoignez une communauté engagée dans l'amélioration de la sécurité locale.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA section */}
        <div className="mt-20 bg-primary-600 rounded-2xl p-8 text-center">
          <h2 className="text-3xl font-extrabold text-white">
            Prêt à contribuer ?
          </h2>
          <p className="mt-4 text-lg text-primary-100">
            Rejoignez des milliers d'utilisateurs qui signalent et suivent les incidents chaque jour.
          </p>
          <div className="mt-8">
            {isAuthenticated ? (
              <Link to="/map">
                <Button variant="primary" size="lg" className="bg-white text-primary-600 hover:bg-primary-50">
                  Accéder à la carte
                </Button>
              </Link>
            ) : (
              <Link to="/register">
                <Button variant="primary" size="lg" className="bg-white text-primary-600 hover:bg-primary-50">
                  Créer mon compte gratuit
                </Button>
              </Link>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-neutral-200 mt-20">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-base text-neutral-500">
              © 2024 Incident Reporter. Tous droits réservés.
            </p>
            <div className="mt-4 flex justify-center space-x-6">
              <a href="/terms" className="text-neutral-500 hover:text-neutral-700">
                Conditions d'utilisation
              </a>
              <a href="/privacy" className="text-neutral-500 hover:text-neutral-700">
                Politique de confidentialité
              </a>
              <a href="/contact" className="text-neutral-500 hover:text-neutral-700">
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
