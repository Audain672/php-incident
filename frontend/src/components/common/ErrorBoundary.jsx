/**
 * Error Boundary Component
 * Classic React class component to catch JavaScript errors in child component tree
 * @component
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';

/**
 * Error boundary component
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console and state
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });

    // Optional: Send error to logging service
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  /**
   * Reset the error boundary state
   */
  resetErrorBoundary = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return typeof this.props.fallback === 'function' 
          ? this.props.fallback(this.state.error, this.state.errorInfo, this.resetErrorBoundary)
          : this.props.fallback;
      }

      // Default fallback UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
            <div className="text-center">
              {/* Error icon */}
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
                Oops! Une erreur est survenue
              </h1>
              
              <p className="text-neutral-600 mb-6">
                {this.props.message || 
                 "Désolé, quelque chose s'est mal passé. L'équipe technique a été notifiée."}
              </p>

              {/* Action buttons */}
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={this.resetErrorBoundary}
                  className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
                >
                  Réessayer
                </button>
                
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="w-full inline-flex justify-center items-center px-4 py-2 border border-neutral-300 text-sm font-medium rounded-lg text-neutral-700 bg-white hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
                >
                  Recharger la page
                </button>
              </div>

              {/* Error details (only in development) */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-6 text-left">
                  <summary className="cursor-pointer text-sm font-medium text-neutral-700 hover:text-neutral-900">
                    Détails de l'erreur (développement)
                  </summary>
                  <div className="mt-2 p-3 bg-neutral-100 rounded text-xs font-mono text-neutral-800 overflow-auto max-h-40">
                    <div className="font-bold mb-2">Error:</div>
                    <pre className="whitespace-pre-wrap">{this.state.error.toString()}</pre>
                    
                    {this.state.errorInfo && (
                      <>
                        <div className="font-bold mt-3 mb-2">Component Stack:</div>
                        <pre className="whitespace-pre-wrap">{this.state.errorInfo.componentStack}</pre>
                      </>
                    )}
                  </div>
                </details>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  fallback: PropTypes.oneOfType([
    PropTypes.node,
    PropTypes.func,
  ]),
  message: PropTypes.string,
  onError: PropTypes.func,
};

/**
 * HOC to wrap components with ErrorBoundary
 * @param {React.Component} Component - Component to wrap
 * @param {object} [errorBoundaryProps] - Props for ErrorBoundary
 * @returns {React.Component} Wrapped component
 */
export const withErrorBoundary = (Component, errorBoundaryProps = {}) => {
  const WrappedComponent = (props) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
};

/**
 * Simple error fallback component
 */
export const SimpleErrorFallback = ({ error, resetErrorBoundary }) => (
  <div className="p-4 bg-danger-50 border border-danger-200 rounded-lg">
    <div className="flex items-center">
      <div className="flex-shrink-0">
        <svg
          className="h-5 w-5 text-danger-400"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clipRule="evenodd"
          />
        </svg>
      </div>
      <div className="ml-3">
        <h3 className="text-sm font-medium text-danger-800">
          Une erreur est survenue
        </h3>
        <div className="mt-2 text-sm text-danger-700">
          {error?.message || 'Une erreur inattendue est survenue.'}
        </div>
        <div className="mt-3">
          <button
            type="button"
            onClick={resetErrorBoundary}
            className="text-sm font-medium text-danger-600 hover:text-danger-500 underline"
          >
            Réessayer
          </button>
        </div>
      </div>
    </div>
  </div>
);

SimpleErrorFallback.propTypes = {
  error: PropTypes.object,
  resetErrorBoundary: PropTypes.func,
};

export default ErrorBoundary;
