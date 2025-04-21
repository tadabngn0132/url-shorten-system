import Vue from 'vue'
import VueRouter from 'vue-router'
import HomeView from '../views/HomeView.vue'
import RedirectView from '../views/RedirectView.vue'
import Login from '../views/LoginView.vue'
import Dashboard from '../views/DashboardView.vue'
import Profile from '../views/ProfileView.vue'
import BulkShortener from '../views/BulkShortenerView.vue'
import store from '../store'
import authService from '../services/auth-service'

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
    meta: { 
      requiresGuest: true 
    }
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
    meta: { 
      requiresAuth: true
    }
  },
  {
    path: '/bulk-shortener',
    name: 'bulk-shortener',
    component: BulkShortener,
    meta: { 
      requiresAuth: true 
    }
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
  
  // Lấy thông tin user từ localStorage
  const userData = localStorage.getItem('user');
  const user = userData ? JSON.parse(userData) : null;
  const isAdmin = user && user.role === 'admin';
  
  console.log('Navigating from', from.path, 'to', to.path);
  console.log('Auth state:', isAuthenticated, 'Token:', token ? 'exists' : 'missing');

  // Nếu đang cố truy cập trang yêu cầu quyền admin
  if (to.matched.some(record => record.meta.requiresAdmin)) {
    if (!isAuthenticated) {
      console.log('User is not authenticated, redirecting to login page');
      // Chuyển hướng với replace để tránh lỗi NavigationDuplicated
      return next({ path: '/login', replace: true });
    } else if (!isAdmin) {
      console.log('User is not admin, redirecting to home page');
      return next('/');
    } else {
      console.log('Admin access granted for', to.path);
      return next();
    }
  } 
  // Nếu trang yêu cầu đăng nhập nhưng không cần quyền admin
  else if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!isAuthenticated) {
      console.log('Authentication required for', to.path, 'redirecting to login');
      // Chuyển hướng với replace để tránh lỗi NavigationDuplicated
      return next({ path: '/login', replace: true });
    } else {
      console.log('User is authenticated, allowing access to', to.path);
      return next();
    }
  }
  // Nếu đang truy cập trang dành cho khách (như login)
  else if (to.matched.some(record => record.meta.requiresGuest)) {
    if (isAuthenticated) {
      console.log('Page is for guests only, redirecting authenticated user to home');
      return next('/');
    } else {
      return next();
    }
  } else {
    return next();
  }
});

export default router