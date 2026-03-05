/**
 * Input Component
 * Reusable input component with React Hook Form integration and error handling
 * @component
 */

import React from 'react';
import PropTypes from 'prop-types';

/**
 * Input component with form integration and validation
 * @param {object} props - Component props
 * @param {string} props.label - Input label
 * @param {string} props.name - Input name (required for form integration)
 * @param {string} [props.type='text'] - Input type
 * @param {string} [props.placeholder=''] - Input placeholder
 * @param {string} [props.value] - Controlled input value
 * @param {function} [props.onChange] - Change handler
 * @param {function} [props.onBlur] - Blur handler
 * @param {object} [props.register] - React Hook Form register function
 * @param {object} [props.error] - Error object from form validation
 * @param {string} [props.className=''] - Additional CSS classes
 * @param {boolean} [props.required=false] - Whether input is required
 * @param {boolean} [props.disabled=false] - Whether input is disabled
 * @param {boolean} [props.readOnly=false] - Whether input is read-only
 * @param {string} [props.helperText=''] - Helper text displayed below input
 * @param {('sm'|'md'|'lg')} [props.size='md'] - Input size
 * @param {object} props.rest - Additional input attributes
 * @returns {JSX.Element} Input component
 */
const Input = ({
  label,
  name,
  type = 'text',
  placeholder = '',
  value,
  onChange,
  onBlur,
  register,
  error,
  className = '',
  required = false,
  disabled = false,
  readOnly = false,
  helperText = '',
  size = 'md',
  ...rest
}) => {
  // Generate input props based on whether using React Hook Form
  const inputProps = register 
    ? register(name, {
        required: required ? 'Ce champ est requis' : false,
        onChange,
        onBlur,
        ...rest,
      })
    : {
        name,
        value,
        onChange,
        onBlur,
        ...rest,
      };

  // Base classes for all inputs
  const baseClasses = 'block w-full rounded-lg border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:opacity-50 disabled:cursor-not-allowed';

  // Size classes
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-3 py-2 text-base',
    lg: 'px-4 py-3 text-lg',
  };

  // State classes
  const stateClasses = error
    ? 'border-danger-300 bg-danger-50 text-danger-900 placeholder-danger-400 focus:border-danger-500 focus:ring-danger-500'
    : 'border-neutral-300 bg-white text-neutral-900 placeholder-neutral-500 focus:border-primary-500 focus:ring-primary-500 hover:border-neutral-400';

  // Combine all classes
  const inputClasses = [
    baseClasses,
    sizeClasses[size],
    stateClasses,
    className,
  ].filter(Boolean).join(' ');

  // Error message component
  const ErrorMessage = () => {
    if (!error) return null;

    return (
      <p className="mt-1 text-sm text-danger-600" role="alert">
        {typeof error === 'string' ? error : error.message}
      </p>
    );
  };

  // Helper text component
  const HelperText = () => {
    if (!helperText && !required) return null;

    return (
      <p className="mt-1 text-sm text-neutral-500">
        {helperText}
        {required && !helperText && (
          <span className="text-danger-500"> *</span>
        )}
      </p>
    );
  };

  return (
    <div className="w-full">
      {label && (
        <label 
          htmlFor={name}
          className="block text-sm font-medium text-neutral-700 mb-1"
        >
          {label}
          {required && <span className="text-danger-500 ml-1">*</span>}
        </label>
      )}
      
      <input
        id={name}
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readOnly}
        className={inputClasses}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${name}-error` : helperText ? `${name}-helper` : undefined}
        {...inputProps}
      />

      <ErrorMessage />
      <HelperText />
    </div>
  );
};

Input.propTypes = {
  label: PropTypes.string,
  name: PropTypes.string.isRequired,
  type: PropTypes.oneOf([
    'text',
    'email',
    'password',
    'number',
    'tel',
    'url',
    'date',
    'datetime-local',
    'time',
    'month',
    'week',
    'search',
  ]),
  placeholder: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  register: PropTypes.func,
  error: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({
      message: PropTypes.string,
      type: PropTypes.string,
    }),
  ]),
  className: PropTypes.string,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  readOnly: PropTypes.bool,
  helperText: PropTypes.string,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
};

export default Input;
