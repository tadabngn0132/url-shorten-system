import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import axios from 'axios'
import exportApis from './services/api/exportApis'

Vue.config.productionTip = false

// Thiết lập interceptor cho axios
const token = localStorage.getItem('token');
if (token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

// Khởi tạo app sau khi kiểm tra xác thực
async function initApp() {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  
  // Nếu có token và user, thiết lập state
  if (token && user) {
    store.commit('auth/SET_AUTH', { user, token });
    
    // Kiểm tra token với server
    try {
      await exportApis.auths.verifyToken();
    } catch (error) {
      console.error('Token validation failed:', error);
      // Token không hợp lệ, đăng xuất
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      store.commit('auth/LOGOUT');
    }
  }
  
  // Khởi tạo ứng dụng Vue
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