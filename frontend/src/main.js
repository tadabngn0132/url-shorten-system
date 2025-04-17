import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import axios from 'axios'
import apiService from './services/api'

Vue.config.productionTip = false

// Đăng ký API service như là một plugin toàn cục
Vue.prototype.$api = apiService;

// Thiết lập interceptor cho axios để tự động thêm token vào header
axios.interceptors.request.use(
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

// Xử lý lỗi response toàn cục
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      // Xóa token nếu hết hạn
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Redirect về trang login nếu cần
      if (window.location.pathname !== '/login') {
        router.push('/login?expired=true');
      }
    }
    return Promise.reject(error);
  }
);

// Khởi tạo app sau khi kiểm tra xác thực
async function initApp() {
  const token = localStorage.getItem('token');
  
  // Nếu có token lưu trữ, kiểm tra tính hợp lệ
  if (token) {
    try {
      await store.dispatch('verifyAuth');
    } catch (error) {
      console.error('Token verification failed:', error);
      // Xóa token không hợp lệ
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }
  
  // Khởi tạo ứng dụng Vue
  new Vue({
    router,
    store,
    render: h => h(App)
  }).$mount('#app');
}

// Khởi chạy ứng dụng
initApp();