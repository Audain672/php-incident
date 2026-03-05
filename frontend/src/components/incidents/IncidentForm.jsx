/**
 * Incident Form Component
 * DUMB component for creating/editing incidents with React Hook Form and file upload
 * @component
 */

import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { incidentSchema } from '../../utils/validators.js';
import { INCIDENT_TYPES, SEVERITY_LEVELS } from '../../utils/constants.js';
import Input from '../common/Input.jsx';
import Button from '../common/Button.jsx';

/**
 * Incident form component
 * @param {object} props - Component props
 * @param {object} [props.initialValues] - Initial form values
 * @param {function} props.onSubmit - Form submission handler
 * @param {boolean} props.isLoading - Whether form is submitting
 * @param {string} [props.error] - Form submission error
 * @param {function} [props.onCancel] - Cancel handler
 * @param {boolean} [props.showLocationPicker=false] - Whether to show location picker
 * @param {object} [props.defaultLocation] - Default location coordinates
 * @param {string} [props.className=''] - Additional CSS classes
 * @returns {JSX.Element} Incident form
 */
const IncidentForm = ({
  initialValues = {},
  onSubmit,
  isLoading,
  error,
  onCancel,
  showLocationPicker = false,
  defaultLocation = null,
  className = '',
}) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isDirty },
    setValue,
    watch,
    reset: resetForm,
  } = useForm({
    resolver: zodResolver(incidentSchema),
    mode: 'onChange',
    defaultValues: {
      title: '',
      description: '',
      type: '',
      severity: 'medium',
      latitude: defaultLocation?.lat || '',
      longitude: defaultLocation?.lng || '',
      locationName: '',
      ...initialValues,
    },
  });

  // Watch form values for location picker
  const latitude = watch('latitude');
  const longitude = watch('longitude');

  /**
   * Handle file selection
   * @param {Event} event - File input change event
   */
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Le fichier est trop volumineux. La taille maximale est de 5MB.');
      return;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      alert('Type de fichier non autorisé. Formats acceptés: JPG, PNG, GIF, PDF.');
      return;
    }

    setSelectedFile(file);

    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
    }
  };

  /**
   * Handle file removal
   */
  const handleFileRemove = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  /**
   * Handle form submission
   * @param {object} data - Form data
   */
  const handleFormSubmit = (data) => {
    onSubmit(data, selectedFile);
  };

  /**
   * Handle form reset
   */
  const handleReset = () => {
    resetForm();
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  /**
   * Handle location pick from map
   * @param {object} location - Location coordinates
   */
  const handleLocationPick = (location) => {
    setValue('latitude', location.lat);
    setValue('longitude', location.lng);
  };

  return (
    <div className={`w-full max-w-2xl mx-auto ${className}`}>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Title */}
        <Input
          label="Titre de l'incident"
          name="title"
          type="text"
          placeholder="Décrivez brièvement l'incident..."
          register={register}
          error={errors.title}
          required
          disabled={isLoading}
        />

        {/* Type and Severity */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Type d'incident *
            </label>
            <select
              {...register('type')}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50"
              disabled={isLoading}
            >
              <option value="">Sélectionnez un type</option>
              {Object.values(INCIDENT_TYPES).map(type => (
                <option key={type.id} value={type.id}>
                  {type.icon} {type.label}
                </option>
              ))}
            </select>
            {errors.type && (
              <p className="mt-1 text-sm text-danger-600">
                {errors.type.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Niveau de gravité *
            </label>
            <select
              {...register('severity')}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50"
              disabled={isLoading}
            >
              {Object.values(SEVERITY_LEVELS).map(level => (
                <option key={level.id} value={level.id}>
                  {level.label}
                </option>
              ))}
            </select>
            {errors.severity && (
              <p className="mt-1 text-sm text-danger-600">
                {errors.severity.message}
              </p>
            )}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Description *
          </label>
          <textarea
            {...register('description')}
            rows={4}
            placeholder="Décrivez l'incident en détail..."
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50 resize-none"
            disabled={isLoading}
          />
          {errors.description && (
            <p className="mt-1 text-sm text-danger-600">
              {errors.description.message}
            </p>
          )}
        </div>

        {/* Location */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-neutral-900">Localisation</h3>
          
          {showLocationPicker && (
            <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4">
              <p className="text-sm text-neutral-600 mb-2">
                Cliquez sur la carte pour définir la localisation
              </p>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Latitude"
                  name="latitude"
                  type="number"
                  step="any"
                  placeholder="48.8566"
                  register={register}
                  error={errors.latitude}
                  required
                  disabled={isLoading}
                />
                <Input
                  label="Longitude"
                  name="longitude"
                  type="number"
                  step="any"
                  placeholder="2.3522"
                  register={register}
                  error={errors.longitude}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>
          )}

          <Input
            label="Nom du lieu (optionnel)"
            name="locationName"
            type="text"
            placeholder="Ex: Place de la Concorde, Paris"
            register={register}
            error={errors.locationName}
            disabled={isLoading}
          />
        </div>

        {/* Image upload */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Photo (optionnel)
          </label>
          
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-neutral-300 border-dashed rounded-lg hover:border-neutral-400 transition-colors duration-200">
            <div className="space-y-1 text-center">
              {previewUrl ? (
                <div className="space-y-4">
                  <img
                    src={previewUrl}
                    alt="Aperçu"
                    className="mx-auto h-32 w-32 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={handleFileRemove}
                    className="text-danger-600 hover:text-danger-500 text-sm font-medium"
                  >
                    Supprimer l'image
                  </button>
                </div>
              ) : (
                <div>
                  <svg
                    className="mx-auto h-12 w-12 text-neutral-400"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div className="flex text-sm text-neutral-600">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
                    >
                      <span>Télécharger un fichier</span>
                      <input
                        id="file-upload"
                        ref={fileInputRef}
                        name="file-upload"
                        type="file"
                        className="sr-only"
                        accept="image/jpeg,image/png,image/gif,application/pdf"
                        onChange={handleFileSelect}
                        disabled={isLoading}
                      />
                    </label>
                    <p className="pl-1">ou glisser-déposer</p>
                  </div>
                  <p className="text-xs text-neutral-500">
                    PNG, JPG, GIF, PDF jusqu'à 5MB
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

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
                  Erreur de soumission
                </h3>
                <div className="mt-2 text-sm text-danger-700">
                  {error}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Form actions */}
        <div className="flex justify-end space-x-4">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              Annuler
            </Button>
          )}
          
          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
            disabled={!isValid || !isDirty || isLoading}
          >
            {isLoading ? 'Envoi en cours...' : 'Signaler l\'incident'}
          </Button>
        </div>
      </form>
    </div>
  );
};

IncidentForm.propTypes = {
  initialValues: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
  error: PropTypes.string,
  onCancel: PropTypes.func,
  showLocationPicker: PropTypes.bool,
  defaultLocation: PropTypes.shape({
    lat: PropTypes.number,
    lng: PropTypes.number,
  }),
  className: PropTypes.string,
};

export default IncidentForm;
