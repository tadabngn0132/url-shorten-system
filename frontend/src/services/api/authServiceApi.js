import apiClient from './apiClient';

const handleError = fn => (...params) =>
    fn(...params).catch(error => {
        let errorMessage = 'Đã xảy ra lỗi không xác định';
        
        if (error.response) {
            // Xử lý lỗi dựa trên mã trạng thái
            if (error.response.status === 401) {
            errorMessage = 'Thông tin đăng nhập không chính xác';
            } else if (error.response.status === 403) {
            errorMessage = 'Bạn không có quyền truy cập tài nguyên này';
            } else if (error.response.data && error.response.data.error) {
            errorMessage = error.response.data.error;
            } else {
            errorMessage = `Lỗi ${error.response.status}: ${error.response.statusText}`;
            }
        } else if (error.message) {
            errorMessage = error.message;
        }
        
        console.error('API Auth Error:', errorMessage);
        
        // Thêm thông báo lỗi vào đối tượng lỗi để component có thể sử dụng
        error.userMessage = errorMessage;
        throw error;
    });

export const authService = {
    register: handleError(async (userData) => {
        const res = await apiClient.authApiClient.post('/register', userData);
        return res.data;
    }),

    login: handleError(async (credentials) => {
        const res = await apiClient.authApiClient.post('/login', credentials);
        return res.data;
    }),

    verifyToken: handleError(async () => {
        const res = await apiClient.authApiClient.get('/verify');
        return res.data;
    }),

    getProfile: handleError(async () => {
        const res = await apiClient.authApiClient.get('/profile');
        return res.data;
    }),

    changePassword: handleError (async (passwordData) => {
        const res = await apiClient.authApiClient.post('/change-password', passwordData);
        return res.data;
    })
}