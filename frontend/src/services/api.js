import axios from 'axios';
import router from '../router'; // Import router
import store from '../store'; // Import store

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
      // Kiểm tra xem đã đăng xuất chưa để tránh xử lý nhiều lần
      const isLoggedOut = !localStorage.getItem('token');
      
      if (!isLoggedOut) {
        // Remove token if expired
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Nếu có store thì commit logout
        if (window.app && window.app.$store) {
          window.app.$store.commit('LOGOUT');
        }
        
        // Kiểm tra xem có đang ở trang login không để tránh chuyển hướng trùng lặp
        if (router && router.currentRoute.path !== '/login') {
          router.push('/login?expired=true').catch(err => {
            // Bỏ qua lỗi NavigationDuplicated
            if (err.name !== 'NavigationDuplicated') {
              console.error('Navigation error:', err);
            }
          });
        }
      }
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