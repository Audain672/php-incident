/**
 * Toast Component
 * Reusable toast notification component with auto-dismiss
 * @component
 */

import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

/**
 * Toast notification component
 * @param {object} props - Component props
 * @param {('success'|'error'|'warning'|'info')} props.type - Toast type
 * @param {string} props.title - Toast title
 * @param {string} [props.message] - Toast message
 * @param {boolean} props.isVisible - Whether toast is visible
 * @param {function} props.onClose - Function to call when toast should close
 * @param {number} [props.autoCloseDuration=5000] - Auto-close duration in ms (0 to disable)
 * @param {string} [props.className=''] - Additional CSS classes
 * @param {boolean} [props.showCloseButton=true] - Whether to show close button
 * @returns {JSX.Element|null} Toast component or null if not visible
 */
const Toast = ({
  type,
  title,
  message,
  isVisible,
  onClose,
  autoCloseDuration = 5000,
  className = '',
  showCloseButton = true,
}) => {
  const [progress, setProgress] = useState(100);

  // Auto-close functionality
  useEffect(() => {
    if (!isVisible || autoCloseDuration === 0) return;

    const interval = 100; // Update progress every 100ms
    const decrement = (100 / autoCloseDuration) * interval;

    const timer = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev - decrement;
        if (newProgress <= 0) {
          onClose();
          return 0;
        }
        return newProgress;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [isVisible, autoCloseDuration, onClose]);

  // Reset progress when toast becomes visible
  useEffect(() => {
    if (isVisible) {
      setProgress(100);
    }
  }, [isVisible]);

  // Type configurations
  const typeConfig = {
    success: {
      bgColor: 'bg-success-50',
      borderColor: 'border-success-200',
      textColor: 'text-success-800',
      iconColor: 'text-success-600',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
    error: {
      bgColor: 'bg-danger-50',
      borderColor: 'border-danger-200',
      textColor: 'text-danger-800',
      iconColor: 'text-danger-600',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
    warning: {
      bgColor: 'bg-warning-50',
      borderColor: 'border-warning-200',
      textColor: 'text-warning-800',
      iconColor: 'text-warning-600',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
    info: {
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-800',
      iconColor: 'text-blue-600',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
  };

  const config = typeConfig[type] || typeConfig.info;

  if (!isVisible) return null;

  return (
    <div
      className={`
        fixed top-4 right-4 z-50 max-w-sm w-full rounded-lg border shadow-lg transform transition-all duration-300 ease-in-out
        ${config.bgColor} ${config.borderColor} ${config.textColor}
        ${className}
      `}
      role="alert"
      aria-live="polite"
    >
      <div className="p-4">
        <div className="flex items-start">
          {/* Icon */}
          <div className={`flex-shrink-0 ${config.iconColor}`}>
            {config.icon}
          </div>

          {/* Content */}
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium">{title}</h3>
            {message && (
              <p className="mt-1 text-sm opacity-90">{message}</p>
            )}
          </div>

          {/* Close button */}
          {showCloseButton && (
            <div className="ml-4 flex-shrink-0">
              <button
                type="button"
                className={`inline-flex rounded-md p-1.5 hover:bg-black hover:bg-opacity-10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-${type === 'success' ? 'success' : type === 'error' ? 'danger' : 'blue'}-500`}
                onClick={onClose}
                aria-label="Fermer la notification"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Progress bar */}
        {autoCloseDuration > 0 && (
          <div className="mt-3">
            <div className="w-full bg-black bg-opacity-10 rounded-full h-1">
              <div
                className="bg-current h-1 rounded-full transition-all duration-100 ease-linear"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

Toast.propTypes = {
  type: PropTypes.oneOf(['success', 'error', 'warning', 'info']).isRequired,
  title: PropTypes.string.isRequired,
  message: PropTypes.string,
  isVisible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  autoCloseDuration: PropTypes.number,
  className: PropTypes.string,
  showCloseButton: PropTypes.bool,
};

/**
 * Toast Container Component
 * Manages multiple toasts
 */
export const ToastContainer = ({ toasts, onRemove }) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          {...toast}
          onClose={() => onRemove(toast.id)}
        />
      ))}
    </div>
  );
};

ToastContainer.propTypes = {
  toasts: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      type: PropTypes.oneOf(['success', 'error', 'warning', 'info']).isRequired,
      title: PropTypes.string.isRequired,
      message: PropTypes.string,
      isVisible: PropTypes.bool.isRequired,
    })
  ).isRequired,
  onRemove: PropTypes.func.isRequired,
};

export default Toast;
