/**
 * Login Form Component
 * DUMB component for user login using React Hook Form and Zod validation
 * @component
 */

import React from 'react';
import { useForm } from 'react-hook-form';
import PropTypes from 'prop-types';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '../../utils/validators.js';
import Input from '../common/Input.jsx';
import Button from '../common/Button.jsx';

/**
 * Login form component
 * @param {object} props - Component props
 * @param {function} props.onSubmit - Form submission handler
 * @param {boolean} props.isLoading - Whether form is submitting
 * @param {string} [props.error] - Form submission error
 * @param {string} [props.className=''] - Additional CSS classes
 * @returns {JSX.Element} Login form component
 */
const LoginForm = ({ onSubmit, isLoading, error, className = '' }) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isDirty },
    reset: resetForm,
  } = useForm({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
    },
  });

  /**
   * Handle form submission
   * @param {object} data - Form data
   */
  const handleFormSubmit = (data) => {
    onSubmit(data);
  };

  /**
   * Handle form reset
   */
  const handleReset = () => {
    resetForm();
  };

  return (
    <div className={`w-full max-w-md mx-auto ${className}`}>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Email field */}
        <Input
          label="Adresse email"
          name="email"
          type="email"
          placeholder="exemple@email.com"
          register={register}
          error={errors.email}
          required
          disabled={isLoading}
          autoComplete="email"
        />

        {/* Password field */}
        <Input
          label="Mot de passe"
          name="password"
          type="password"
          placeholder="••••••••"
          register={register}
          error={errors.password}
          required
          disabled={isLoading}
          autoComplete="current-password"
        />

        {/* Form error */}
        {error && (
          <div className="rounded-md bg-danger-50 p-4">
            <div className="flex">
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
                  Erreur de connexion
                </h3>
                <div className="mt-2 text-sm text-danger-700">
                  {error}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Submit button */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isLoading}
          disabled={!isValid || !isDirty || isLoading}
          className="w-full"
        >
          {isLoading ? 'Connexion en cours...' : 'Se connecter'}
        </Button>

        {/* Form actions */}
        <div className="flex items-center justify-between text-sm">
          <button
            type="button"
            onClick={handleReset}
            disabled={isLoading}
            className="text-neutral-600 hover:text-neutral-900 disabled:opacity-50"
          >
            Réinitialiser
          </button>
          
          <a
            href="/forgot-password"
            className="text-primary-600 hover:text-primary-500 font-medium"
          >
            Mot de passe oublié ?
          </a>
        </div>
      </form>
    </div>
  );
};

LoginForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
  error: PropTypes.string,
  className: PropTypes.string,
};

export default LoginForm;
