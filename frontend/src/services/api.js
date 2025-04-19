import axios from 'axios';

// Get base URL from environment variables or use default
const API_BASE_URL = process.env.VUE_APP_API_BASE_URL || 'http://localhost:9999';

export const apiService = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000
});

// Interceptor to add token
apiService.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Interceptor to handle response errors
apiService.interceptors.response.use(
  response => response,
  error => {
    // Handle 401 (Unauthorized)
    if (error.response && error.response.status === 401) {
      // Remove token if expired
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Redirect to login if necessary
      if (window.location.pathname !== '/login') {
        window.location = '/login?expired=true';
      }
    }
    
    // Handle network errors
    if (!error.response) {
      console.error('Network error, please check your connection');
    }
    
    return Promise.reject(error);
  }
);

// URL service methods
export const urlService = {
  getAllUrls: () => apiService.get('/gateway/urls'),
  
  getUrl: (id) => apiService.get(`/gateway/urls/${id}`),
  
  createUrl: (urlData) => apiService.post('/gateway/urls', urlData),
  
  updateUrl: (id, urlData) => apiService.put(`/gateway/urls/${id}`, urlData),
  
  deleteUrl: (id) => apiService.delete(`/gateway/urls/${id}`),
  
  redirectUrl: (shortCode) => apiService.get(`/gateway/urls/redirect/${shortCode}`)
};

// Auth service methods
export const authService = {
  login: (credentials) => apiService.post('/gateway/auth/login', credentials),
  
  register: (userData) => apiService.post('/gateway/auth/register', userData),
  
  verifyToken: () => apiService.get('/gateway/auth/verify'),
  
  getProfile: () => apiService.get('/gateway/auth/profile'),
  
  changePassword: (passwordData) => apiService.post('/gateway/auth/change-password', passwordData)
};

export default {
  apiService,
  urlService,
  authService
};