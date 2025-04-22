import axios from 'axios'
import router from '@/router'
import store from '@/store'

// Lấy base URL từ biến môi trường hoặc sử dụng mặc định
const API_BASE_URL = process.env.VUE_APP_API_BASE_URL || 'http://localhost:9999/';

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

// Cấu hình client API chung
const createApiClient = (path) => {
    const client = axios.create({
        baseURL: API_BASE_URL + (path || ''),
        timeout: 30000,
        headers: createHeaders()
    });

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
};

// Tạp các client riêng cho từng loại API
const mainApiClient = createApiClient('');
const urlApiClient = createApiClient('gateway/urls/');
const authApiClient = createApiClient('gateway/auth/');

const setUpAuthToken = (token) => {
    if (token) {
        localStorage.setItem('token', token);
    } else {
        localStorage.removeItem('token');
    }
}

export default {
    mainApiClient,
    urlApiClient,
    authApiClient,

    setUpAuthToken,
    getToken: () => localStorage.getItem('token'),
    clearToken: () => localStorage.removeItem('token')
};
