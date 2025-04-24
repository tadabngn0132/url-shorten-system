// frontend/src/services/api/apiClient.js
import axios from 'axios'
import router from '@/router'
import store from '@/store'

// Lấy base URL từ biến môi trường hoặc sử dụng mặc định
const API_BASE_URL = process.env.VUE_APP_API_BASE_URL || 'http://localhost:9999';

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

// Create API clients with proper axios instances
const mainApiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: createHeaders()
});

const urlApiClient = axios.create({
    baseURL: `${API_BASE_URL}/gateway/urls`,
    timeout: 30000,
    headers: createHeaders()
});

const authApiClient = axios.create({
    baseURL: `${API_BASE_URL}/gateway/auth`,
    timeout: 30000,
    headers: createHeaders()
});

// Configure request interceptors for all clients
[mainApiClient, urlApiClient, authApiClient].forEach(client => {
    // Request interceptor
    client.interceptors.request.use(
        config => {
            const token = getToken();
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        },
        error => Promise.reject(error)
    );

    // Response interceptor
    client.interceptors.response.use(
        response => response,
        error => {
            // Xử lý lỗi 401 (Unauthorized)
            if (error.response && error.response.status === 401) {
                const isLoggedOut = !getToken();
                
                if (!isLoggedOut) {
                    // Xóa token và đăng xuất
                    clearToken();
                
                    // Chuyển hướng về trang đăng nhập nếu cần
                    if (router.currentRoute.path !== '/login') {
                        router.replace('/login?expired=true').catch(err => {
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
});

export default {
    mainApiClient,
    urlApiClient,
    authApiClient,
    getToken,
    clearToken
};