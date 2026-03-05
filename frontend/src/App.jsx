/**
 * Main App Component
 * Root component with providers and error handling
 * @component
 */

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ErrorBoundary } from './components/common/ErrorBoundary.jsx';
import AppRouter from './routes/AppRouter.jsx';

/**
 * Create React Query client with default configuration
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Global query configuration
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors except 408/429
        if (error.response?.status >= 400 && error.response?.status < 500) {
          const status = error.response.status;
          if (status === 408 || status === 429) return true;
          return false;
        }
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      // Global mutation configuration
      retry: 1,
      retryDelay: 1000,
    },
  },
});

/**
 * Error fallback for the entire app
 * @param {Error} error - The error that occurred
 * @param {object} errorInfo - Additional error information
 * @param {function} resetError - Function to reset error boundary
 * @returns {JSX.Element} Error fallback UI
 */
const AppErrorFallback = ({ error, errorInfo, resetError }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-danger-100 mb-4">
          <svg
            className="h-6 w-6 text-danger-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-neutral-900 mb-2">
          Une erreur critique est survenue
        </h1>
        
        <p className="text-neutral-600 mb-6">
          L'application a rencontré une erreur inattendue. 
          Veuillez recharger la page ou contacter le support si le problème persiste.
        </p>

        <div className="space-y-3">
          <button
            onClick={resetError}
            className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
          >
            Réessayer
          </button>
          
          <button
            onClick={() => window.location.reload()}
            className="w-full inline-flex justify-center items-center px-4 py-2 border border-neutral-300 text-sm font-medium rounded-lg text-neutral-700 bg-white hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
          >
            Recharger la page
          </button>
        </div>

        {/* Error details in development */}
        {process.env.NODE_ENV === 'development' && (
          <details className="mt-6 text-left">
            <summary className="cursor-pointer text-sm font-medium text-neutral-700 hover:text-neutral-900">
              Détails techniques (développement)
            </summary>
            <div className="mt-2 p-3 bg-neutral-100 rounded text-xs font-mono text-neutral-800 overflow-auto max-h-40">
              <div className="font-bold mb-2">Error:</div>
              <pre className="whitespace-pre-wrap">{error?.toString()}</pre>
              
              {errorInfo && (
                <>
                  <div className="font-bold mt-3 mb-2">Component Stack:</div>
                  <pre className="whitespace-pre-wrap">{errorInfo.componentStack}</pre>
                </>
              )}
            </div>
          </details>
        )}
      </div>
    </div>
  );
};

/**
 * Main App component
 * @returns {JSX.Element} App with providers
 */
const App = () => {
  return (
    <ErrorBoundary
      fallback={AppErrorFallback}
      onError={(error, errorInfo) => {
        // Log error to external service in production
        console.error('App Error Boundary caught an error:', error, errorInfo);
        
        // Here you could send error to logging service
        // logErrorToService(error, errorInfo);
      }}
    >
      <QueryClientProvider client={queryClient}>
        <div className="App">
          <AppRouter />
          
          {/* React Query DevTools - only in development */}
          {process.env.NODE_ENV === 'development' && (
            <ReactQueryDevtools
              initialIsOpen={false}
              position="bottom-right"
              buttonPosition="bottom-right"
            />
          )}
        </div>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
