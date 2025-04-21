// frontend/src/main.js
import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import axios from 'axios'
import AuthService from './services/auth-service'
import api from './services/api'

Vue.config.productionTip = false

// Thêm $api vào Vue.prototype để có thể truy cập từ mọi component
Vue.prototype.$api = api;

// Thiết lập interceptor cho axios để tự động thêm token vào header
axios.interceptors.request.use(
  config => {
    const authHeader = AuthService.getAuthHeader();
    if (authHeader.Authorization) {
      config.headers.Authorization = authHeader.Authorization;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Xử lý lỗi response toàn cục
axios.interceptors.response.use(
  response => response,
  error => {
    // Xử lý lỗi 401 Unauthorized
    if (error.response && error.response.status === 401) {
      // Kiểm tra xem đã đăng xuất chưa để tránh xử lý nhiều lần
      const isLoggedOut = !localStorage.getItem('token');
      
      if (!isLoggedOut) {
        // Xóa token nếu hết hạn
        AuthService.logout();
        
        // Chuyển hướng về trang login nếu cần, sử dụng replace để tránh lỗi chuyển hướng
        if (router.currentRoute.path !== '/login') {
          router.replace('/login?expired=true').catch(err => {
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

// Khởi tạo app sau khi kiểm tra xác thực
async function initApp() {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  
  // Nếu có token và user, thiết lập state
  if (token && user) {
    store.commit('SET_AUTH', { user, token });
    
    // Kiểm tra token với server
    try {
      await axios.get('http://localhost:9999/gateway/auth/verify', {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (error) {
      console.error('Token validation failed:', error);
      // Token không hợp lệ, đăng xuất
      AuthService.logout();
      store.commit('LOGOUT');
    }
  }
  
  // Khởi tạo ứng dụng Vue và lưu tham chiếu toàn cục
  const vueApp = new Vue({
    router,
    store,
    render: h => h(App)
  }).$mount('#app');
  
  // Lưu instance Vue toàn cục để các dịch vụ có thể truy cập
  window.app = vueApp;
}

// Khởi chạy ứng dụng
initApp();