// frontend/src/services/auth-service.js
import axios from 'axios';

// API Base URL - Lấy từ biến môi trường hoặc sử dụng giá trị mặc định
const API_BASE_URL = process.env.VUE_APP_API_BASE_URL || 'http://localhost:9999';

// Tạo instance axios với cấu hình cơ bản
const api = axios.create({
    baseURL: `${API_BASE_URL}/gateway/auth`,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    }
});

// Service xác thực với xử lý lỗi chi tiết
const AuthService = {
    /**
     * Đăng ký người dùng mới
     * @param {Object} userData - Dữ liệu đăng ký
     * @returns {Promise} Promise với dữ liệu xác thực
     */
    async register(userData) {
        try {
            console.log('Sending registration data:', userData);
            const response = await api.post('/register', userData);
            
            // Kiểm tra response
            if (response.data && response.data.token) {
                // Lưu thông tin xác thực vào localStorage
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
                
                console.log('Registration successful');
                return response.data;
            } else {
                console.error('Registration response missing token:', response.data);
                throw new Error('Invalid server response');
            }
        } catch (error) {
            console.error('Registration error:', error);
            
            // Xử lý lỗi
            if (error.response) {
                // Server trả về lỗi
                console.error('Server error:', error.response.status, error.response.data);
                throw {
                    status: error.response.status,
                    message: error.response.data.error || 'Registration failed',
                    details: error.response.data
                };
            } else if (error.request) {
                // Không nhận được phản hồi từ server
                console.error('No response from server:', error.request);
                throw {
                    status: 0,
                    message: 'No response from authentication server. Please try again later.',
                    details: 'Server may be down or unreachable'
                };
            } else {
                // Lỗi cấu hình request
                throw {
                    status: -1,
                    message: error.message || 'Registration request failed',
                    details: 'Check your network connection'
                };
            }
        }
    },

    /**
     * Đăng nhập người dùng
     * @param {Object} credentials - Thông tin đăng nhập
     * @returns {Promise} Promise với dữ liệu xác thực
     */
    async login(credentials) {
        try {
            console.log('Login attempt with:', credentials.username);
            const response = await api.post('/login', credentials);
            
            // Kiểm tra response
            if (response.data && response.data.token) {
                // Lưu thông tin xác thực
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
            
            // Xử lý lỗi
            if (error.response) {
                // Server trả về lỗi
                console.error('Server error:', error.response.status, error.response.data);
                throw {
                    status: error.response.status,
                    message: error.response.data.error || 'Authentication failed',
                    details: error.response.data
                };
            } else if (error.request) {
                // Không nhận được phản hồi từ server
                console.error('No response from server:', error.request);
                throw {
                    status: 0,
                    message: 'No response from authentication server',
                    details: 'Server may be down or unreachable'
                };
            } else {
                // Lỗi cấu hình request
                throw {
                    status: -1,
                    message: error.message || 'Login request failed',
                    details: 'Check your network connection'
                };
            }
        }
    },

    /**
     * Xác minh token
     * @returns {Promise} Promise với kết quả xác minh
     */
    async verifyAuth() {
        const token = localStorage.getItem('token');
        if (!token) {
            return { isAuthenticated: false };
        }

        try {
            const response = await api.get('/verify', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            // Kiểm tra kết quả xác minh
            if (response.data && response.data.isAuthenticated) {
                return { 
                    isAuthenticated: true, 
                    user: response.data.user 
                };
            } else {
                this.logout();
                return { isAuthenticated: false };
            }
        } catch (error) {
            console.error('Token verification failed:', error);
            
            // Xóa thông tin xác thực không hợp lệ
            this.logout();
            return { isAuthenticated: false };
        }
    },

    /**
     * Đăng xuất
     */
    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        console.log('User logged out');
    },

    /**
     * Đổi mật khẩu
     * @param {Object} passwordData - Dữ liệu mật khẩu cũ và mới
     * @returns {Promise} Promise với kết quả
     */
    async changePassword(passwordData) {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Authentication required');
        }

        try {
            const response = await api.post('/change-password', passwordData, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            console.error('Change password error:', error);
            
            if (error.response) {
                throw {
                    status: error.response.status,
                    message: error.response.data.error || 'Failed to change password',
                    details: error.response.data
                };
            } else {
                throw {
                    status: -1,
                    message: 'Failed to connect to server',
                    details: error.message
                };
            }
        }
    },

    /**
     * Lấy thông tin người dùng từ localStorage
     * @returns {Object|null} Thông tin người dùng hoặc null
     */
    getCurrentUser() {
        const userJson = localStorage.getItem('user');
        return userJson ? JSON.parse(userJson) : null;
    },

    /**
     * Kiểm tra xem người dùng đã đăng nhập chưa
     * @returns {Boolean} Trạng thái đăng nhập
     */
    isLoggedIn() {
        return !!localStorage.getItem('token');
    }
};

export default AuthService;