import axios from 'axios';

const API_BASE_URL = process.env.VUE_APP_API_BASE_URL || 'http://localhost:9999';

export const apiService = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000
});

// Interceptor để thêm token
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

// Interceptor xử lý response errors
apiService.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      // Xóa token và thông tin user
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Cập nhật trạng thái xác thực trong store
      store.commit('auth/setAuthenticated', false);
      
      // Redirect tới trang login
      router.push('/login?expired=true');
    }
    return Promise.reject(error);
  }
);
  
// Các methods hỗ trợ
export const urlService = {
  getAllUrls: () => apiService.get('/gateway/urls'),
  
  getUrl: (id) => apiService.get(`/gateway/urls/${id}`),
  
  createUrl: (urlData) => apiService.post('/gateway/urls', urlData),
  
  updateUrl: (id, urlData) => apiService.put(`/gateway/urls/${id}`, urlData),
  
  deleteUrl: (id) => apiService.delete(`/gateway/urls/${id}`)
};

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