// frontend/src/services/api/apiClient.js
import axios from 'axios'
import router from '@/router'
import store from '@/store'

// Lấy base URL từ biến môi trường hoặc sử dụng mặc định
const API_BASE_URL = process.env.VUE_APP_API_BASE_URL || 'http://localhost:9999';

// Debug log
console.log('API_BASE_URL being used:', API_BASE_URL);

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
        error => {
            // Log lỗi API để debug
            console.log(`[API Error] ${error.response?.status || 'Unknown'} for ${error.config?.url}`);
            console.log('[Error Details]', error.response?.data);
            
            // Xử lý lỗi 401 (Unauthorized)
            if (error.response && error.response.status === 401) {
                const isLoggedOut = !getToken();
                
                if (!isLoggedOut) {
                    console.log('[Auth Error] Token hết hạn hoặc không hợp lệ - đăng xuất người dùng');
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