/**
 * Register Form Component
 * DUMB component for user registration using React Hook Form and Zod validation
 * @component
 */

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema } from '../../utils/validators.js';
import Input from '../common/Input.jsx';
import Button from '../common/Button.jsx';

/**
 * Register form component
 * @param {object} props - Component props
 * @param {function} props.onSubmit - Form submission handler
 * @param {boolean} props.isLoading - Whether form is submitting
 * @param {string} [props.error] - Form submission error
 * @param {string} [props.className=''] - Additional CSS classes
 * @returns {JSX.Element} Register form component
 */
const RegisterForm = ({ onSubmit, isLoading, error, className = '' }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isDirty },
    reset: resetForm,
    watch,
  } = useForm({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  // Watch password fields for validation
  const password = watch('password');
  const confirmPassword = watch('confirmPassword');

  /**
   * Handle form submission
   * @param {object} data - Form data
   */
  const handleFormSubmit = (data) => {
    // Remove confirmPassword before submitting
    const { confirmPassword: _, ...submitData } = data;
    onSubmit(submitData);
  };

  /**
   * Handle form reset
   */
  const handleReset = () => {
    resetForm();
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  /**
   * Toggle password visibility
   * @param {boolean} isConfirmPassword - Whether it's the confirm password field
   */
  const togglePasswordVisibility = (isConfirmPassword = false) => {
    if (isConfirmPassword) {
      setShowConfirmPassword(!showConfirmPassword);
    } else {
      setShowPassword(!showPassword);
    }
  };

  return (
    <div className={`w-full max-w-md mx-auto ${className}`}>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Name fields */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Prénom"
            name="firstName"
            type="text"
            placeholder="Jean"
            register={register}
            error={errors.firstName}
            required
            disabled={isLoading}
            autoComplete="given-name"
          />

          <Input
            label="Nom"
            name="lastName"
            type="text"
            placeholder="Dupont"
            register={register}
            error={errors.lastName}
            required
            disabled={isLoading}
            autoComplete="family-name"
          />
        </div>

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
        <div className="relative">
          <Input
            label="Mot de passe"
            name="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            register={register}
            error={errors.password}
            required
            disabled={isLoading}
            autoComplete="new-password"
            helperText="Minimum 8 caractères, 1 majuscule, 1 minuscule, 1 chiffre"
          />
          <button
            type="button"
            onClick={() => togglePasswordVisibility(false)}
            disabled={isLoading}
            className="absolute right-3 top-9 text-neutral-400 hover:text-neutral-600 disabled:opacity-50"
            aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
          >
            {showPassword ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        </div>

        {/* Confirm password field */}
        <div className="relative">
          <Input
            label="Confirmer le mot de passe"
            name="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="••••••••"
            register={register}
            error={errors.confirmPassword}
            required
            disabled={isLoading}
            autoComplete="new-password"
          />
          <button
            type="button"
            onClick={() => togglePasswordVisibility(true)}
            disabled={isLoading}
            className="absolute right-3 top-9 text-neutral-400 hover:text-neutral-600 disabled:opacity-50"
            aria-label={showConfirmPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
          >
            {showConfirmPassword ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        </div>

        {/* Password strength indicator */}
        {password && (
          <div className="space-y-2">
            <div className="text-sm text-neutral-600">Force du mot de passe:</div>
            <div className="flex space-x-1">
              {[1, 2, 3, 4].map((level) => (
                <div
                  key={level}
                  className={`h-2 flex-1 rounded-full ${
                    password.length >= 8 * level
                      ? password.match(/[A-Z]/) && password.match(/[a-z]/) && password.match(/\d/)
                        ? 'bg-success-500'
                        : password.length >= 12
                        ? 'bg-warning-500'
                        : 'bg-danger-500'
                      : 'bg-neutral-200'
                  }`}
                />
              ))}
            </div>
          </div>
        )}

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
                  Erreur d'inscription
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
          {isLoading ? 'Inscription en cours...' : 'Créer un compte'}
        </Button>

        {/* Form actions */}
        <div className="flex items-center justify-center text-sm">
          <button
            type="button"
            onClick={handleReset}
            disabled={isLoading}
            className="text-neutral-600 hover:text-neutral-900 disabled:opacity-50 mr-4"
          >
            Réinitialiser
          </button>
          
          <span className="text-neutral-500">
            Déjà un compte ?{' '}
            <a
              href="/login"
              className="text-primary-600 hover:text-primary-500 font-medium"
            >
              Se connecter
            </a>
          </span>
        </div>
      </form>
    </div>
  );
};

RegisterForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
  error: PropTypes.string,
  className: PropTypes.string,
};

export default RegisterForm;
