// frontend/src/services/api/apiClient.js
import axios from 'axios'
import router from '@/router'
import store from '@/store'

// Lấy base URL từ biến môi trường hoặc sử dụng mặc định
const API_BASE_URL = process.env.VUE_APP_API_BASE_URL || 'http://localhost:9999';

// Debug log
console.log('API_BASE_URL being used:', API_BASE_URL);

// Tạo biến để theo dõi trạng thái làm mới token
let isRefreshing = false;
let failedQueue = [];

// Hàm xử lý hàng đợi các request bị lỗi
const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

// Hàm lấy token
const getToken = () => localStorage.getItem('token');

// Hàm xóa token và đăng xuất
const clearToken = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Cập nhật store nếu có thể
    if (store) {
        store.commit('auth/LOGOUT');
    }
};

// Hàm làm mới token bằng cách đăng nhập lại
const refreshToken = async () => {
  try {
    // Lấy thông tin người dùng từ localStorage
    const userData = JSON.parse(localStorage.getItem('user'));
    if (!userData || !userData.username || !userData.password) {
      console.log("No stored credentials found for token refresh: ", userData ? "missing username/password" : "no user data");
      throw new Error('No stored credentials for refresh');
    }
    
    console.log('Attempting to refresh token with stored credentials...');
    
    // Gọi API đăng nhập để lấy token mới
    const response = await authApiClient.post('/login', {
      username: userData.username,
      password: userData.password
    }, {
      // Skip auth interceptor để tránh vòng lặp vô hạn
      headers: { 'X-Skip-Auth-Interceptor': 'true' }
    });
    
    // Lưu token mới
    const newToken = response.data.token;
    console.log('Token refreshed successfully');
    localStorage.setItem('token', newToken);
    
    return newToken;
  } catch (error) {
    console.error('Failed to refresh token:', error);
    throw error;
  }
};

// Cấu hình header chung cho cả trường hợp có token hoặc không
const createHeaders = () => {
    const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    };

    const token = localStorage.getItem('token');
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
};

// Create API clients with proper axios instances - với headers cơ bản
const mainApiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

const urlApiClient = axios.create({
    baseURL: `${API_BASE_URL}/gateway/urls`,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

console.log('urlApiClient baseURL:', `${API_BASE_URL}/gateway/urls`);

const authApiClient = axios.create({
    baseURL: `${API_BASE_URL}/gateway/auth`,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

// Thêm một log để kiểm tra mỗi khi một request được gửi
const logRequest = (config) => {
    console.log(`[API Request] ${config.method.toUpperCase()} ${config.baseURL}${config.url}`);
    console.log('[API Headers]', config.headers);
    return config;
};

// Configure request interceptors for all clients
[mainApiClient, urlApiClient, authApiClient].forEach(client => {
    // Request interceptor
    client.interceptors.request.use(
        config => {
            // Bỏ qua việc thêm token cho các request được đánh dấu
            if (config.headers['X-Skip-Auth-Interceptor']) {
                delete config.headers['X-Skip-Auth-Interceptor'];
                return logRequest(config);
            }
            
            // Lấy token mới nhất từ localStorage mỗi khi gửi request
            const token = getToken();
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            // Log request để debug
            return logRequest(config);
        },
        error => Promise.reject(error)
    );

    // Response interceptor
    client.interceptors.response.use(
        response => {
            console.log(`[API Response] ${response.status} for ${response.config.url}`);
            return response;
        },
        async error => {
            // Log lỗi API để debug
            console.log(`[API Error] ${error.response?.status || 'Unknown'} for ${error.config?.url}`);
            console.log('[Error Details]', error.response?.data);
            
            // Xử lý lỗi 401 (Unauthorized)
            if (error.response && error.response.status === 401) {
                const isLoginRequest = error.config.url === '/login' || 
                                       error.config.url.includes('/gateway/auth/login');
                                       
                // Bỏ qua xử lý cho request đăng nhập hoặc request đã được thử làm mới token
                if (isLoginRequest || error.config.headers['X-Retry-After-Refresh']) {
                    return Promise.reject(error);
                }
                
                // Nếu chưa đang trong quá trình làm mới token
                if (!isRefreshing) {
                    isRefreshing = true;
                    
                    try {
                        // Thử làm mới token
                        const newToken = await refreshToken();
                        
                        // Phục hồi các request đang đợi với token mới
                        processQueue(null, newToken);
                        
                        // Thử lại request gốc với token mới
                        const originalRequest = error.config;
                        originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
                        originalRequest.headers['X-Retry-After-Refresh'] = 'true';
                        
                        isRefreshing = false;
                        return axios(originalRequest);
                    } catch (refreshError) {
                        // Nếu không thể làm mới token, xử lý lỗi và đăng xuất
                        processQueue(refreshError, null);
                        isRefreshing = false;
                        
                        console.log('[Auth Error] Token không thể làm mới - đăng xuất người dùng');
                        clearToken();
                        
                        // Chuyển hướng về trang đăng nhập nếu cần
                        if (router.currentRoute.path !== '/login') {
                            router.replace('/login?expired=true').catch(err => {
                                if (err.name !== 'NavigationDuplicated') {
                                    console.error('Navigation error:', err);
                                }
                            });
                        }
                        
                        return Promise.reject(error);
                    }
                } else {
                    // Nếu đang trong quá trình làm mới token, thêm request hiện tại vào hàng đợi
                    return new Promise((resolve, reject) => {
                        failedQueue.push({ resolve, reject });
                    }).then(newToken => {
                        // Khi có token mới, thử lại request với token này
                        error.config.headers['Authorization'] = `Bearer ${newToken}`;
                        error.config.headers['X-Retry-After-Refresh'] = 'true';
                        return axios(error.config);
                    }).catch(err => {
                        return Promise.reject(err);
                    });
                }
            }
            
            return Promise.reject(error);
        }
    );
});

export default {
    mainApiClient,
    urlApiClient,
    authApiClient,
    getToken,
    clearToken,
    refreshToken
};