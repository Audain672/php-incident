/**
 * Authentication Hook
 * Provides authentication methods and state management
 * @module useAuth
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { login as loginApi, logout as logoutApi, register as registerApi } from '../api/localAuthApi.js';
import { authStorage } from '../utils/localStorage.js';
import { validateToken } from '../utils/helpers.js';
import { useAuth as useAuthContext } from '../context/AuthContext.jsx';

/**
 * Custom hook for authentication operations
 * @returns {object} Authentication methods and state
 */
export const useAuth = () => {
  const queryClient = useQueryClient();
  const authContext = useAuthContext();

  /**
   * Login mutation
   */
  const loginMutation = useMutation({
    mutationFn: loginApi,
    onSuccess: (data) => {
      // Store auth data in localStorage
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
      console.error('Login failed:', error);
      // Tokens are automatically cleared by apiClient on 401
    },
  });

  /**
   * Register mutation
   */
  const registerMutation = useMutation({
    mutationFn: registerApi,
    onSuccess: (data) => {
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
      console.error('Registration failed:', error);
    },
  });

  /**
   * Logout mutation
   */
  const logoutMutation = useMutation({
    mutationFn: logoutApi,
    onMutate: async () => {
      // Cancel any ongoing auth queries
      await queryClient.cancelQueries({ queryKey: ['auth'] });
    },
    onSuccess: () => {
      // Clear auth data and state
      authStorage.clearAuth();
      authContext.logout();
      queryClient.clear();
    },
    onError: (error) => {
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
   * @param {string} credentials.email - User email
   * @param {string} credentials.password - User password
   * @returns {Promise} Login mutation promise
   */
  const login = (credentials) => {
    return loginMutation.mutateAsync(credentials);
  };

  /**
   * Perform registration
   * @param {object} userData - User registration data
   * @param {string} userData.firstName - First name
   * @param {string} userData.lastName - Last name
   * @param {string} userData.email - Email
   * @param {string} userData.password - Password
   * @returns {Promise} Register mutation promise
   */
  const register = (userData) => {
    return registerMutation.mutateAsync(userData);
  };

  /**
   * Perform logout
   * @param {string} [refreshToken] - Optional refresh token
   * @returns {Promise} Logout mutation promise
   */
  const logout = (refreshToken = null) => {
    return logoutMutation.mutateAsync(refreshToken);
  };

  /**
   * Manual logout without API call
   */
  const logoutLocal = () => {
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
  };
};

/**
 * Hook for login form handling
 * @returns {object} Login form methods and state
 */
export const useLoginForm = () => {
  const { login, isLoggingIn } = useAuth();

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
        error: error.message || 'Échec de la connexion' 
      };
    }
  };

  return {
    handleLogin,
    isLoggingIn,
  };
};

/**
 * Hook for registration form handling
 * @returns {object} Registration form methods and state
 */
export const useRegisterForm = () => {
  const { register, isRegistering } = useAuth();

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
        error: error.message || 'Échec de l\'inscription' 
      };
    }
  };

  return {
    handleRegister,
    isRegistering,
  };
};

export default useAuth;
