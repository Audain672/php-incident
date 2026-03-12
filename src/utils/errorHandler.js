/**
 * Error Handler Utility
 * Processes various error types and converts them to user-friendly messages
 * @module errorHandler
 */

/**
 * Error types for better error categorization
 */
export const ERROR_TYPES = {
  NETWORK: 'network',
  VALIDATION: 'validation',
  AUTHENTICATION: 'authentication',
  AUTHORIZATION: 'authorization',
  NOT_FOUND: 'not_found',
  SERVER: 'server',
  FILE_UPLOAD: 'file_upload',
  UNKNOWN: 'unknown',
};

/**
 * Default error messages in French
 */
const DEFAULT_MESSAGES = {
  [ERROR_TYPES.NETWORK]: 'Erreur de connexion. Veuillez vérifier votre connexion internet.',
  [ERROR_TYPES.VALIDATION]: 'Les données fournies sont invalides.',
  [ERROR_TYPES.AUTHENTICATION]: 'Erreur d\'authentification. Veuillez vous reconnecter.',
  [ERROR_TYPES.AUTHORIZATION]: 'Vous n\'avez pas les permissions nécessaires pour cette action.',
  [ERROR_TYPES.NOT_FOUND]: 'La ressource demandée n\'existe pas.',
  [ERROR_TYPES.SERVER]: 'Une erreur serveur est survenue. Veuillez réessayer plus tard.',
  [ERROR_TYPES.FILE_UPLOAD]: 'Erreur lors du téléchargement du fichier.',
  [ERROR_TYPES.UNKNOWN]: 'Une erreur inattendue est survenue.',
};

/**
 * HTTP status code to error type mapping
 */
const STATUS_CODE_MAPPING = {
  400: ERROR_TYPES.VALIDATION,
  401: ERROR_TYPES.AUTHENTICATION,
  403: ERROR_TYPES.AUTHORIZATION,
  404: ERROR_TYPES.NOT_FOUND,
  413: ERROR_TYPES.FILE_UPLOAD,
  422: ERROR_TYPES.VALIDATION,
  429: ERROR_TYPES.SERVER,
  500: ERROR_TYPES.SERVER,
  502: ERROR_TYPES.SERVER,
  503: ERROR_TYPES.SERVER,
  504: ERROR_TYPES.SERVER,
};

/**
 * Parse Axios error and extract relevant information
 * @param {Error} error - The error object (usually from Axios)
 * @returns {object} Parsed error information
 */
export const parseAxiosError = (error) => {
  const result = {
    type: ERROR_TYPES.UNKNOWN,
    message: DEFAULT_MESSAGES[ERROR_TYPES.UNKNOWN],
    statusCode: null,
    details: null,
    originalError: error,
  };

  // Network error (no response received)
  if (!error.response && error.request) {
    result.type = ERROR_TYPES.NETWORK;
    result.message = DEFAULT_MESSAGES[ERROR_TYPES.NETWORK];
    
    // Check for specific network conditions
    if (error.code === 'ECONNABORTED') {
      result.message = 'La requête a expiré. Veuillez réessayer.';
    } else if (error.code === 'ERR_NETWORK') {
      result.message = 'Impossible de se connecter au serveur. Veuillez vérifier votre connexion.';
    }
    
    return result;
  }

  // Error without request (probably a configuration error)
  if (!error.request) {
    result.message = 'Erreur de configuration de la requête.';
    return result;
  }

  // Server responded with error
  const { response } = error;
  result.statusCode = response.status;
  result.type = STATUS_CODE_MAPPING[response.status] || ERROR_TYPES.UNKNOWN;

  // Extract error details from response
  const responseData = response.data;

  // Handle different response formats
  if (responseData) {
    // Laravel/Joi validation errors format
    if (responseData.errors) {
      result.type = ERROR_TYPES.VALIDATION;
      result.details = responseData.errors;
      result.message = formatValidationErrors(responseData.errors);
    }
    // Symfony/Express error format
    else if (responseData.message) {
      result.message = responseData.message;
      
      // Check for specific error patterns
      if (responseData.message.toLowerCase().includes('unauthorized')) {
        result.type = ERROR_TYPES.AUTHENTICATION;
      } else if (responseData.message.toLowerCase().includes('forbidden')) {
        result.type = ERROR_TYPES.AUTHORIZATION;
      } else if (responseData.message.toLowerCase().includes('not found')) {
        result.type = ERROR_TYPES.NOT_FOUND;
      }
    }
    // Array of errors (some APIs return this)
    else if (Array.isArray(responseData)) {
      result.details = responseData;
      result.message = responseData.join(', ');
    }
    // String response
    else if (typeof responseData === 'string') {
      result.message = responseData;
    }
  }

  // Use default message if no specific message found
  if (!result.message || result.message === DEFAULT_MESSAGES[ERROR_TYPES.UNKNOWN]) {
    result.message = DEFAULT_MESSAGES[result.type] || DEFAULT_MESSAGES[ERROR_TYPES.UNKNOWN];
  }

  return result;
};

/**
 * Format validation errors into a user-friendly message
 * @param {object} errors - Validation errors object
 * @returns {string} Formatted error message
 */
export const formatValidationErrors = (errors) => {
  if (typeof errors === 'string') {
    return errors;
  }

  if (Array.isArray(errors)) {
    return errors.join(', ');
  }

  if (typeof errors === 'object') {
    const errorMessages = [];
    
    // Handle nested error objects
    Object.keys(errors).forEach(key => {
      const fieldErrors = errors[key];
      
      if (Array.isArray(fieldErrors)) {
        errorMessages.push(`${key}: ${fieldErrors.join(', ')}`);
      } else if (typeof fieldErrors === 'string') {
        errorMessages.push(`${key}: ${fieldErrors}`);
      } else if (typeof fieldErrors === 'object') {
        // Recursively format nested errors
        errorMessages.push(formatValidationErrors(fieldErrors));
      }
    });
    
    return errorMessages.join('. ');
  }

  return DEFAULT_MESSAGES[ERROR_TYPES.VALIDATION];
};

/**
 * Handle file upload errors specifically
 * @param {Error} error - The error object
 * @returns {object} Parsed file upload error
 */
export const parseFileUploadError = (error) => {
  const result = parseAxiosError(error);
  result.type = ERROR_TYPES.FILE_UPLOAD;

  // Check for specific file upload error patterns
  if (error.message && error.message.includes('File too large')) {
    result.message = 'Le fichier est trop volumineux. La taille maximale autorisée est de 5MB.';
  } else if (error.message && error.message.includes('Invalid file type')) {
    result.message = 'Type de fichier non autorisé. Formats acceptés: JPG, PNG, GIF, PDF.';
  } else if (error.message && error.message.includes('Upload failed')) {
    result.message = 'Échec du téléchargement. Veuillez réessayer.';
  }

  return result;
};

/**
 * Create a user-friendly error notification object
 * @param {Error} error - The error object
 * @param {string} [context] - Additional context for the error
 * @returns {object} Error notification object
 */
export const createErrorNotification = (error, context = null) => {
  const parsedError = parseAxiosError(error);
  
  return {
    type: 'error',
    title: getErrorTitle(parsedError.type),
    message: parsedError.message,
    context: context,
    details: parsedError.details,
    statusCode: parsedError.statusCode,
    errorType: parsedError.type,
    timestamp: new Date().toISOString(),
  };
};

/**
 * Get a user-friendly title for the error type
 * @param {string} errorType - The error type
 * @returns {string} User-friendly error title
 */
export const getErrorTitle = (errorType) => {
  const titles = {
    [ERROR_TYPES.NETWORK]: 'Erreur de connexion',
    [ERROR_TYPES.VALIDATION]: 'Erreur de validation',
    [ERROR_TYPES.AUTHENTICATION]: 'Erreur d\'authentification',
    [ERROR_TYPES.AUTHORIZATION]: 'Erreur d\'autorisation',
    [ERROR_TYPES.NOT_FOUND]: 'Ressource introuvable',
    [ERROR_TYPES.SERVER]: 'Erreur serveur',
    [ERROR_TYPES.FILE_UPLOAD]: 'Erreur de fichier',
    [ERROR_TYPES.UNKNOWN]: 'Erreur inattendue',
  };

  return titles[errorType] || titles[ERROR_TYPES.UNKNOWN];
};

/**
 * Check if error is authentication-related and should trigger logout
 * @param {Error} error - The error object
 * @returns {boolean} True if error requires logout
 */
export const shouldLogout = (error) => {
  const parsedError = parseAxiosError(error);
  return parsedError.type === ERROR_TYPES.AUTHENTICATION;
};

/**
 * Main error handler function - processes any error and returns user-friendly format
 * @param {Error} error - The error to handle
 * @param {string} [context] - Additional context
 * @returns {object} Processed error information
 */
export const handleError = (error, context = null) => {
  // Handle different error types
  if (error.isAxiosError) {
    return createErrorNotification(error, context);
  }
  
  // Handle file upload errors
  if (error.name === 'FileUploadError' || error.message?.includes('upload')) {
    const parsedError = parseFileUploadError(error);
    return createErrorNotification(parsedError, context);
  }
  
  // Handle validation errors (from form validation libraries)
  if (error.name === 'ValidationError' || error.errors) {
    return {
      type: 'error',
      title: 'Erreur de validation',
      message: formatValidationErrors(error.errors || error.message),
      context: context,
      details: error.errors,
      errorType: ERROR_TYPES.VALIDATION,
      timestamp: new Date().toISOString(),
    };
  }
  
  // Handle generic errors
  return {
    type: 'error',
    title: 'Erreur inattendue',
    message: error.message || DEFAULT_MESSAGES[ERROR_TYPES.UNKNOWN],
    context: context,
    errorType: ERROR_TYPES.UNKNOWN,
    timestamp: new Date().toISOString(),
  };
};

/**
 * Export all error handling utilities
 */
export default {
  parseAxiosError,
  formatValidationErrors,
  parseFileUploadError,
  createErrorNotification,
  getErrorTitle,
  shouldLogout,
  handleError,
  ERROR_TYPES,
  DEFAULT_MESSAGES,
};
