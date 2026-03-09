/**
 * Local Authentication API
 * Mock authentication API using localStorage for development/demo purposes
 * @module localAuthApi
 */

import { authStorage } from '../utils/localStorage.js';
import { generateToken, validateToken } from '../utils/helpers.js';

/**
 * Mock user database
 */
const mockUsers = [
  {
    id: '1',
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@example.com',
    password: 'Admin123!', // In production, this would be hashed
    role: 'admin',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    firstName: 'Demo',
    lastName: 'User',
    email: 'demo@example.com',
    password: 'Demo123!', // In production, this would be hashed
    role: 'user',
    createdAt: new Date().toISOString(),
  },
];

/**
 * Local authentication API functions
 */
export const localAuthApi = {
  /**
   * Simulate user login
   * @param {object} credentials - Login credentials
   * @param {string} credentials.email - User email
   * @param {string} credentials.password - User password
   * @returns {Promise<object>} Login response
   */
  login: async (credentials) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const { email, password } = credentials;
    
    // Find user in mock database
    const user = mockUsers.find(u => u.email === email && u.password === password);
    
    if (!user) {
      throw new Error('Email ou mot de passe incorrect');
    }

    // Generate mock token
    const token = generateToken(user);
    
    // Store auth data
    authStorage.setToken(token);
    authStorage.setUser({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
    });

    return {
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
      token,
      expiresIn: '24h',
    };
  },

  /**
   * Simulate user registration
   * @param {object} userData - User registration data
   * @returns {Promise<object>} Registration response
   */
  register: async (userData) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const { firstName, lastName, email, password } = userData;
    
    // Check if user already exists
    const existingUser = mockUsers.find(u => u.email === email);
    if (existingUser) {
      throw new Error('Un compte avec cet email existe déjà');
    }

    // Create new user
    const newUser = {
      id: (mockUsers.length + 1).toString(),
      firstName,
      lastName,
      email,
      password, // In production, this would be hashed
      role: 'user',
      createdAt: new Date().toISOString(),
    };

    // Add to mock database
    mockUsers.push(newUser);

    // Auto-login after registration
    return localAuthApi.login({ email, password });
  },

  /**
   * Simulate user logout
   * @returns {Promise<void>}
   */
  logout: async () => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));

    // Clear auth data
    authStorage.clearAuth();
  },

  /**
   * Get current user profile
   * @returns {Promise<object>} User profile
   */
  getProfile: async () => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 200));

    const user = authStorage.getUser();
    if (!user) {
      throw new Error('Utilisateur non authentifié');
    }

    return user;
  },

  /**
   * Update user profile
   * @param {object} updates - Profile updates
   * @returns {Promise<object>} Updated profile
   */
  updateProfile: async (updates) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const currentUser = authStorage.getUser();
    if (!currentUser) {
      throw new Error('Utilisateur non authentifié');
    }

    const updatedUser = { ...currentUser, ...updates };
    authStorage.setUser(updatedUser);

    return updatedUser;
  },

  /**
   * Change password
   * @param {object} passwordData - Password change data
   * @returns {Promise<void>}
   */
  changePassword: async (passwordData) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const { currentPassword, newPassword } = passwordData;
    const currentUser = authStorage.getUser();
    
    if (!currentUser) {
      throw new Error('Utilisateur non authentifié');
    }

    // Find user in mock database
    const user = mockUsers.find(u => u.email === currentUser.email);
    if (!user || user.password !== currentPassword) {
      throw new Error('Mot de passe actuel incorrect');
    }

    // Update password (in production, this would be hashed)
    user.password = newPassword;
  },

  /**
   * Request password reset
   * @param {string} email - User email
   * @returns {Promise<void>}
   */
  requestPasswordReset: async (email) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const user = mockUsers.find(u => u.email === email);
    if (!user) {
      // For security, don't reveal if email exists
      return;
    }

    // In production, this would send an email
    console.log(`Password reset requested for: ${email}`);
  },

  /**
   * Reset password with token
   * @param {string} token - Reset token
   * @param {string} newPassword - New password
   * @returns {Promise<void>}
   */
  resetPassword: async (token, newPassword) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // In production, this would validate the token
    // For demo purposes, we'll just simulate success
    console.log(`Password reset with token: ${token}`);
  },

  /**
   * Get current authenticated user
   * @returns {Promise<object|null>} User data or null if not authenticated
   */
  getCurrentUser: async () => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 200));

    const token = authStorage.getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    // Validate token
    const decoded = validateToken(token);
    if (!decoded) {
      authStorage.clearAuth();
      throw new Error('Invalid token');
    }

    // Get user from localStorage or mock data
    let user = authStorage.getUser();
    if (!user) {
      // Fallback to mock users
      user = mockUsers.find(u => u.id === decoded.userId);
      if (user) {
        // Don't include password in response
        const { password, ...userWithoutPassword } = user;
        user = userWithoutPassword;
        authStorage.setUser(user);
      }
    }

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  },
};

// Named exports for compatibility with existing hooks
export const login = localAuthApi.login;
export const register = localAuthApi.register;
export const logout = localAuthApi.logout;
export const getCurrentUser = localAuthApi.getCurrentUser;
export const updateProfile = localAuthApi.updateProfile;
export const changePassword = localAuthApi.changePassword;
export const forgotPassword = localAuthApi.forgotPassword;
export const resetPassword = localAuthApi.resetPassword;

export default localAuthApi;
