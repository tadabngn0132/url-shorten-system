// frontend/src/main.js
import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import axios from 'axios'
import AuthService from './services/auth-service'

Vue.config.productionTip = false

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
      // Xóa token nếu hết hạn
      AuthService.logout();
      
      // Chuyển hướng về trang login nếu cần
      if (router.currentRoute.path !== '/login') {
        router.push('/login?expired=true');
      }
    }
    return Promise.reject(error);
  }
);

// Bảo vệ các tuyến đường yêu cầu xác thực
router.beforeEach(async (to, from, next) => {
  const publicPages = ['/login', '/', '/about'];
  const authRequired = !publicPages.includes(to.path);
  const isLoggedIn = localStorage.getItem('token');

  // Nếu tuyến đường yêu cầu xác thực và người dùng chưa đăng nhập
  if (authRequired && !isLoggedIn) {
    next('/login');
  } else {
    next();
  }
});

// Khởi tạo app sau khi kiểm tra xác thực
async function initApp() {
  const token = localStorage.getItem('token');
  
  // Nếu có token lưu trữ, kiểm tra tính hợp lệ
  if (token) {
    try {
      const result = await AuthService.verifyAuth();
      if (result.isAuthenticated) {
        store.commit('auth/loginSuccess', result.user);
      } else {
        AuthService.logout();
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      AuthService.logout();
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