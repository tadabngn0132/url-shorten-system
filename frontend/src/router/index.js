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

// Navigation guard for guest routes (redirect if already logged in)
const requireGuest = (to, from, next) => {
  if (store.getters.isAuthenticated) {
    next('/');
  } else {
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
    beforeEnter: requireAuth
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

// Global navigation guard
router.beforeEach(async (to, from, next) => {
  // If the user is logged in (has a token), but we're not sure if it's valid
  if (store.state.auth.token && !store.state.auth.isAuthenticated) {
    try {
      // Verify the token
      await store.dispatch('verifyAuth');
      next();
    } catch (error) {
      console.error('Auth verification error:', error);
      next();
    }
  } else {
    next();
  }
});

export default router