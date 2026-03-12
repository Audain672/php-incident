/**
 * Spinner Component
 * Reusable loading spinner component with various sizes and colors
 * @component
 */

import React from 'react';
import PropTypes from 'prop-types';

/**
 * Spinner component for loading states
 * @param {object} props - Component props
 * @param {('sm'|'md'|'lg'|'xl')} [props.size='md'] - Spinner size
 * @param {('primary'|'white'|'neutral'|'success'|'danger'|'warning')} [props.color='primary'] - Spinner color
 * @param {string} [props.className=''] - Additional CSS classes
 * @param {boolean} [props.overlay=false] - Whether to show with overlay
 * @param {string} [props.label='Chargement...'] - Accessibility label
 * @returns {JSX.Element} Spinner component
 */
const Spinner = ({
  size = 'md',
  color = 'primary',
  className = '',
  overlay = false,
  label = 'Chargement...',
}) => {
  // Size configurations
  const sizeConfig = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  // Color configurations
  const colorConfig = {
    primary: 'text-primary-600',
    white: 'text-white',
    neutral: 'text-neutral-600',
    success: 'text-success-600',
    danger: 'text-danger-600',
    warning: 'text-warning-600',
  };

  const spinnerClasses = `
    animate-spin rounded-full border-2 border-current border-t-transparent
    ${sizeConfig[size]}
    ${colorConfig[color]}
    ${className}
  `.trim();

  const SpinnerElement = () => (
    <div
      className={spinnerClasses}
      role="status"
      aria-label={label}
      aria-live="polite"
    >
      <span className="sr-only">{label}</span>
    </div>
  );

  if (overlay) {
    return (
      <div className="flex items-center justify-center">
        <SpinnerElement />
      </div>
    );
  }

  return <SpinnerElement />;
};

Spinner.propTypes = {
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl']),
  color: PropTypes.oneOf(['primary', 'white', 'neutral', 'success', 'danger', 'warning']),
  className: PropTypes.string,
  overlay: PropTypes.bool,
  label: PropTypes.string,
};

/**
 * Full page spinner component
 */
export const FullPageSpinner = ({ 
  message = 'Chargement...', 
  size = 'xl',
  color = 'primary' 
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-90">
      <div className="text-center">
        <Spinner size={size} color={color} />
        {message && (
          <p className="mt-4 text-neutral-600 font-medium">{message}</p>
        )}
      </div>
    </div>
  );
};

FullPageSpinner.propTypes = {
  message: PropTypes.string,
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl']),
  color: PropTypes.oneOf(['primary', 'white', 'neutral', 'success', 'danger', 'warning']),
};

/**
 * Inline spinner component for buttons and forms
 */
export const InlineSpinner = ({ 
  size = 'sm', 
  color = 'white',
  className = '' 
}) => {
  return (
    <Spinner 
      size={size} 
      color={color} 
      className={`inline-block mr-2 ${className}`}
    />
  );
};

InlineSpinner.propTypes = {
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl']),
  color: PropTypes.oneOf(['primary', 'white', 'neutral', 'success', 'danger', 'warning']),
  className: PropTypes.string,
};

/**
 * Card spinner component for content areas
 */
export const CardSpinner = ({ 
  message = 'Chargement...', 
  height = 'h-64' 
}) => {
  return (
    <div className={`flex items-center justify-center ${height} bg-neutral-50 rounded-lg border border-neutral-200`}>
      <div className="text-center">
        <Spinner size="lg" color="primary" />
        {message && (
          <p className="mt-3 text-neutral-600 text-sm">{message}</p>
        )}
      </div>
    </div>
  );
};

CardSpinner.propTypes = {
  message: PropTypes.string,
  height: PropTypes.string,
};

/**
 * Dots spinner component (alternative style)
 */
export const DotsSpinner = ({ 
  size = 'md', 
  color = 'primary',
  className = '' 
}) => {
  const sizeConfig = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
    xl: 'w-6 h-6',
  };

  const colorConfig = {
    primary: 'bg-primary-600',
    white: 'bg-white',
    neutral: 'bg-neutral-600',
    success: 'bg-success-600',
    danger: 'bg-danger-600',
    warning: 'bg-warning-600',
  };

  return (
    <div className={`flex space-x-1 ${className}`}>
      <div 
        className={`
          ${sizeConfig[size]} 
          ${colorConfig[color]} 
          rounded-full animate-bounce
        `}
        style={{ animationDelay: '0ms' }}
      />
      <div 
        className={`
          ${sizeConfig[size]} 
          ${colorConfig[color]} 
          rounded-full animate-bounce
        `}
        style={{ animationDelay: '150ms' }}
      />
      <div 
        className={`
          ${sizeConfig[size]} 
          ${colorConfig[color]} 
          rounded-full animate-bounce
        `}
        style={{ animationDelay: '300ms' }}
      />
    </div>
  );
};

DotsSpinner.propTypes = {
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl']),
  color: PropTypes.oneOf(['primary', 'white', 'neutral', 'success', 'danger', 'warning']),
  className: PropTypes.string,
};

export default Spinner;
