// frontend/src/services/auth-service.js
import axios from 'axios';

// Base URL from environment or default
const API_BASE_URL = process.env.VUE_APP_API_BASE_URL || 'http://localhost:9999';

// Create auth service with detailed error handling and logging
const AuthService = {
  /**
   * Login user
   * @param {Object} credentials - User credentials
   * @returns {Promise} Promise with auth data
   */
  async login(credentials) {
    try {
      console.log('Login attempt with:', credentials.username);
      const response = await axios.post(`${API_BASE_URL}/gateway/auth/login`, credentials);
      
      if (response.data && response.data.token) {
        // Store auth data
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        console.log('Login successful');
        return response.data;
      } else {
        console.error('Login response missing token:', response.data);
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Login error:', error);
      
      // Enhanced error handling
      if (error.response) {
        // Server responded with an error status
        console.error('Server error:', error.response.status, error.response.data);
        throw {
          status: error.response.status,
          message: error.response.data.error || 'Authentication failed',
          details: error.response.data
        };
      } else if (error.request) {
        // Request made but no response received
        console.error('No response from server:', error.request);
        throw {
          status: 0,
          message: 'No response from authentication server',
          details: 'Server may be down or unreachable'
        };
      } else {
        // Error in request setup
        throw {
          status: -1,
          message: error.message || 'Login request failed',
          details: 'Check your network connection'
        };
      }
    }
  },

  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Promise} Promise with auth data
   */
  async register(userData) {
    try {
      console.log('Registration attempt for:', userData.username);
      const response = await axios.post(`${API_BASE_URL}/gateway/auth/register`, userData);
      
      if (response.data && response.data.token) {
        // Store auth data
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        console.log('Registration successful');
        return response.data;
      } else {
        console.error('Registration response missing token:', response.data);
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Registration error:', error);
      
      // Enhanced error handling
      if (error.response) {
        console.error('Server error:', error.response.status, error.response.data);
        throw {
          status: error.response.status,
          message: error.response.data.error || 'Registration failed',
          details: error.response.data
        };
      } else if (error.request) {
        console.error('No response from server:', error.request);
        throw {
          status: 0,
          message: 'No response from authentication server',
          details: 'Server may be down or unreachable'
        };
      } else {
        throw {
          status: -1,
          message: error.message || 'Registration request failed',
          details: 'Check your network connection'
        };
      }
    }
  },

  /**
   * Verify authentication token
   * @returns {Promise} Promise with verification result
   */
  async verifyAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
      return { isAuthenticated: false };
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/gateway/auth/verify`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      return { 
        isAuthenticated: true, 
        user: response.data.user 
      };
    } catch (error) {
      console.error('Token verification failed:', error);
      
      // Clear invalid auth data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      return { isAuthenticated: false };
    }
  },

  /**
   * Logout the current user
   */
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    console.log('User logged out');
    
    // Optional: Call backend to invalidate token server-side
    // This would require implementing a logout endpoint on the server
  }
};

export default AuthService;