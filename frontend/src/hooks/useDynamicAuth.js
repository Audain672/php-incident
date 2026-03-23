/**
 * Dynamic Authentication Hook
 * Automatically switches between localStorage and real API based on configuration
 * @module useDynamicAuth
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getAuthApi, isLocalMode, debugLog } from '../config/apiConfig.js';
import { authStorage } from '../utils/localStorage.js';
import { useAuth as useAuthContext } from '../context/AuthContext.jsx';

/**
 * Custom hook for authentication operations with dynamic API switching
 * @returns {object} Authentication methods and state
 */
export const useDynamicAuth = () => {
  const queryClient = useQueryClient();
  const authContext = useAuthContext();

  /**
   * Login mutation
   */
  const loginMutation = useMutation({
    mutationFn: async (credentials) => {
      const authApi = await getAuthApi();
      debugLog('Login attempt', { email: credentials.email, mode: isLocalMode() ? 'local' : 'api' });
      return authApi.login(credentials);
    },
    onSuccess: (data) => {
      debugLog('Login success', data);

      // Store auth data
      if (data.token) {
        authStorage.setToken(data.token);
      }
      if (data.user) {
        authStorage.setUser(data.user);
      }

      // Update auth context
      authContext.login(data);

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['auth'] });
    },
    onError: (error) => {
      debugLog('Login failed', error);
      console.error('Login failed:', error);
    },
  });

  /**
   * Register mutation
   */
  const registerMutation = useMutation({
    mutationFn: async (userData) => {
      const authApi = await getAuthApi();
      debugLog('Register attempt', { email: userData.email, mode: isLocalMode() ? 'local' : 'api' });
      return authApi.register(userData);
    },
    onSuccess: (data) => {
      debugLog('Register success', data);

      // Store auth data if registration returns them
      if (data.token) {
        authStorage.setToken(data.token);
      }
      if (data.user) {
        authStorage.setUser(data.user);
      }

      // Update auth context
      authContext.login(data);

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['auth'] });
    },
    onError: (error) => {
      debugLog('Register failed', error);
      console.error('Registration failed:', error);
    },
  });

  /**
   * Logout mutation
   */
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const authApi = await getAuthApi();
      debugLog('Logout attempt', { mode: isLocalMode() ? 'local' : 'api' });

      try {
        return await authApi.logout();
      } catch (error) {
        // Continue with local logout even if API fails
        debugLog('Logout API failed, continuing with local logout', error);
        return { success: true };
      }
    },
    onMutate: async () => {
      // Cancel any ongoing auth queries
      await queryClient.cancelQueries({ queryKey: ['auth'] });
    },
    onSuccess: () => {
      debugLog('Logout success');
      // Clear auth data and state
      authStorage.clearAuth();
      authContext.logout();
      queryClient.clear();
    },
    onError: (error) => {
      debugLog('Logout error', error);
      // Even if logout API fails, clear local state
      authStorage.clearAuth();
      authContext.logout();
      queryClient.clear();
      console.error('Logout API failed:', error);
    },
  });

  /**
   * Perform login
   * @param {object} credentials - Login credentials
   * @returns {Promise} Login mutation promise
   */
  const login = (credentials) => {
    return loginMutation.mutateAsync(credentials);
  };

  /**
   * Perform registration
   * @param {object} userData - User registration data
   * @returns {Promise} Register mutation promise
   */
  const register = (userData) => {
    return registerMutation.mutateAsync(userData);
  };

  /**
   * Perform logout
   * @returns {Promise} Logout mutation promise
   */
  const logout = () => {
    return logoutMutation.mutateAsync();
  };

  /**
   * Manual logout without API call
   */
  const logoutLocal = () => {
    debugLog('Manual local logout');
    authStorage.clearAuth();
    authContext.logout();
    queryClient.clear();
  };

  return {
    // State from context
    user: authContext.user,
    isAuthenticated: authContext.isAuthenticated,
    isLoading: authContext.isLoading || loginMutation.isPending || registerMutation.isPending,
    error: authContext.error || loginMutation.error || registerMutation.error,

    // Methods
    login,
    register,
    logout,
    logoutLocal,

    // Context methods
    refetchUser: authContext.refetchUser,
    checkAuth: authContext.checkAuth,
    getUserRole: authContext.getUserRole,
    hasRole: authContext.hasRole,
    isAdmin: authContext.isAdmin,
    isModerator: authContext.isModerator,

    // Mutation states
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
    isLoggingOut: logoutMutation.isPending,

    // Configuration info
    isLocalMode: isLocalMode(),
  };
};

/**
 * Hook for login form handling
 * @returns {object} Login form methods and state
 */
export const useDynamicLoginForm = () => {
  const { login, isLoggingIn, isLocalMode } = useDynamicAuth();

  /**
   * Handle login form submission
   * @param {object} formData - Form data
   * @returns {Promise} Login result
   */
  const handleLogin = async (formData) => {
    try {
      const result = await login(formData);
      return { success: true, data: result };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Échec de la connexion',
        isLocalMode
      };
    }
  };

  return {
    handleLogin,
    isLoggingIn,
    isLocalMode,
  };
};

/**
 * Hook for registration form handling
 * @returns {object} Registration form methods and state
 */
export const useDynamicRegisterForm = () => {
  const { register, isRegistering, isLocalMode } = useDynamicAuth();

  /**
   * Handle registration form submission
   * @param {object} formData - Form data
   * @returns {Promise} Registration result
   */
  const handleRegister = async (formData) => {
    try {
      const result = await register(formData);
      return { success: true, data: result };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Échec de l\'inscription',
        isLocalMode
      };
    }
  };

  return {
    handleRegister,
    isRegistering,
    isLocalMode,
  };
};

export default useDynamicAuth;
