// frontend/src/services/api/urlServiceApi.js
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
        
        console.error('API URL Error:', errorMessage);
        
        // Thêm thông báo lỗi vào đối tượng lỗi để component có thể sử dụng
        error.userMessage = errorMessage;
        throw error;
    });

export const urlService = {
    getAllUrls : handleError(async () => {
        const res = await apiClient.urlApiClient.get('');
        return res.data;
    }),

    getUrl: handleError(async (id) => {
        const res = await apiClient.urlApiClient.get(`/${id}`);
        return res.data;
    }),
    
    // Alias for getUrl to match the method name used in UrlList.vue
    getUrlById: handleError(async (id) => {
        const res = await apiClient.urlApiClient.get(`/${id}`);
        return res.data;
    }),

    createUrl: handleError(async (urlData) => {
        const res = await apiClient.urlApiClient.post('', urlData);
        return res.data;
    }),

    updateUrl: handleError(async (id, urlData) => {
        const res = await apiClient.urlApiClient.put(`/${id}`, urlData);
        return res.data;
    }),
    
    // Add new method to transfer ownership of URLs
    transferUrlOwnership: handleError(async (urlIds, newUserId) => {
        const res = await apiClient.urlApiClient.post('/transfer-ownership', {
            urlIds: urlIds,
            newUserId: newUserId
        });
        return res.data;
    }),

    deleteUrl: handleError(async (id) => {
        const res = await apiClient.urlApiClient.delete(`/${id}`);
        return res.data;
    }),

    getUrlStats: handleError(async () => {
        const res = await apiClient.urlApiClient.get('/stats');
        return res.data;
    }),
    
    getDashboardStats: handleError(async (urlId = null) => {
        let endpoint = '/dashboard-stats';
        if (urlId) {
            endpoint = `/dashboard-stats/${urlId}`;
        }
        console.log('getDashboardStats calling endpoint:', endpoint);
        console.log('With full URL:', apiClient.urlApiClient.defaults.baseURL + endpoint);
        const res = await apiClient.urlApiClient.get(endpoint);
        return res.data;
    }),

    bulkShorten: handleError(async (urlsData) => {
        const res = await apiClient.urlApiClient.post('/bulk', { urls: urlsData });
        return res.data;
    }),

    toggleUrlStatus: handleError(async (id, isActive) => {
        const res = await apiClient.urlApiClient.put(`/${id}/toggle-status`, { isActive });
        return res.data;
    })
}