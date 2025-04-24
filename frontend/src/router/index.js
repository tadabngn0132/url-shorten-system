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
      requiresAuth: true
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
  const isAuthenticated = store.getters.isAuthenticated;
  const user = store.state.auth.user;
  const isAdmin = user && user.role === 'admin';
  
  // Nếu đang cố truy cập trang yêu cầu quyền admin
  if (to.matched.some(record => record.meta.requiresAdmin)) {
    if (!isAuthenticated) {
      return next({ path: '/login', query: { redirect: to.fullPath } });
    } else if (!isAdmin) {
      return next('/');
    } else {
      return next();
    }
  } 
  // Nếu trang yêu cầu đăng nhập nhưng không cần quyền admin
  else if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!isAuthenticated) {
      return next({ path: '/login', query: { redirect: to.fullPath } });
    } else {
      return next();
    }
  }
  // Nếu đang truy cập trang dành cho khách (như login)
  else if (to.matched.some(record => record.meta.requiresGuest)) {
    if (isAuthenticated) {
      return next('/');
    } else {
      return next();
    }
  } else {
    return next();
  }
});

export default router