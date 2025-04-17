import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import axios from 'axios'

Vue.config.productionTip = false

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