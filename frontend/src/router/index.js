import Vue from 'vue'
import VueRouter from 'vue-router'
import HomeView from '../views/HomeView.vue'
import RedirectView from '../views/RedirectView.vue'
import Login from '../views/LoginView.vue'
import Dashboard from '../views/DashboardView.vue'
import Profile from '../views/ProfileView.vue'
import BulkShortener from '../views/BulkShortenerView.vue'
import store from '../store'

Vue.use(VueRouter)

// Navigation guard for authenticated routes
const requireAuth = (to, from, next) => {
  if (!store.getters.isAuthenticated) {
    next('/login');
  } else {
    next();
  }
};

// Kiểm tra logic của requireGuest
const requireGuest = (to, from, next) => {
  if (store.getters.isAuthenticated) {
    console.log("User is authenticated, redirecting from login page");
    next('/'); // chuyển hướng đến trang chủ nếu đã đăng nhập
  } else {
    console.log("User is a guest, allowing access to login page");
    next();
  }
};

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('../views/AboutView.vue')
  },
  {
    path: '/login',
    name: 'login',
    component: Login,
    beforeEnter: requireGuest
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: Dashboard,
    meta: { 
      requiresAuth: true,
      requiresAdmin: true 
    }
  },
  {
    path: '/profile',
    name: 'profile',
    component: Profile,
    beforeEnter: requireAuth
  },
  {
    path: '/bulk-shortener',
    name: 'bulk-shortener',
    component: BulkShortener,
    beforeEnter: requireAuth
  },
  {
    path: '/:shortCode',
    name: 'redirect',
    component: RedirectView
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

// Điều chỉnh global navigation guard
router.beforeEach((to, from, next) => {
  // Lấy thông tin xác thực hiện tại
  const token = localStorage.getItem('token');
  const isAuthenticated = !!token; 
  
  console.log('Navigating from', from.path, 'to', to.path);
  console.log('Auth state:', isAuthenticated);

  // Nếu đang cố truy cập trang yêu cầu đăng nhập
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!isAuthenticated) {
      console.log('User is not authenticated, redirecting to login page');
      next('/login');
    } else {
      // Kiểm tra xem token có thực sự còn hạn không
      authService.verifyToken()
        .then(() => {
          console.log('Token verified, proceeding to', to.path);
          next();
        })
        .catch(error => {
          console.log('Token invalid, redirecting to login page');
          // Xóa token và thông tin user
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          next('/login?expired=true');
        });
    }
  } 
  // Nếu đang truy cập trang dành cho khách (như login)
  else if (to.matched.some(record => record.meta.requiresGuest)) {
    if (isAuthenticated) {
      // Thêm kiểm tra token trước khi chuyển hướng
      authService.verifyToken()
        .then(() => {
          console.log('User is authenticated, redirecting from login page');
          next('/');
        })
        .catch(error => {
          console.log('Token invalid but exists, removing token');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          // Tiếp tục đến trang login vì token không hợp lệ
          next();
        });
    } else {
      next();
    }
  } else {
    next();
  }
});

export default router