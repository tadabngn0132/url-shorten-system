import Vue from 'vue'
import Vuex from 'vuex'
import AuthService from '@/services/auth-service'
import apiService from '@/services/api'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    urls: [],
    loading: false,
    error: null,
    auth: {
      user: JSON.parse(localStorage.getItem('user')) || null,
      token: localStorage.getItem('token') || null,
      isAuthenticated: !!localStorage.getItem('token')
    }
  },
  getters: {
    allUrls: (state) => {
      return state.urls
    },
    isLoading: (state) => {
      return state.loading
    },
    hasError: (state) => {
      return state.error !== null
    },
    // Auth getters
    isAuthenticated: (state) => {
      return state.auth.isAuthenticated
    },
    currentUser: (state) => {
      return state.auth.user
    },
    userRole: (state) => {
      return state.auth.user ? state.auth.user.role : null
    }
  },
  mutations: {
    SET_URLS(state, urls) {
      state.urls = urls
    },
    ADD_URL(state, url) {
      state.urls.push(url)
    },
    SET_LOADING(state, loading) {
      state.loading = loading
    },
    SET_ERROR(state, error) {
      state.error = error
    },
    REMOVE_URL(state, id) {
      state.urls = state.urls.filter(url => url.id !== id)
    },
    // Auth mutations
    SET_AUTH_USER(state, user) {
      state.auth.user = user
      state.auth.isAuthenticated = !!user
    },
    SET_AUTH(state, { user, token }) {
      state.auth.user = user;
      state.auth.token = token;
      state.auth.isAuthenticated = !!user && !!token;
    },
    SET_TOKEN(state, token) {
      state.auth.token = token
    },
    LOGOUT(state) {
      state.auth.user = null
      state.auth.token = null
      state.auth.isAuthenticated = false
    },
    REMOVE_URL(state, urlId) {
      state.urls = state.urls.filter(url => url.id !== urlId);
    }
  },
  actions: {
    async fetchUrls({ commit }) {
      commit('SET_LOADING', true)
      try {
        const response = await apiService.urlService.getAllUrls()
        commit('SET_URLS', response.data)
      } catch (error) {
        console.error('Error fetching URLs:', error)
        commit('SET_ERROR', error.response?.data?.error || 'Failed to fetch URLs')
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async shortenUrl({ commit, state }, urlData) {
      commit('SET_LOADING', true)
      try {
        // If authenticated, add the user ID to the data
        if (state.auth.user) {
          urlData.userId = state.auth.user.id;
        }
        
        const response = await apiService.urlService.createUrl(urlData)
        commit('ADD_URL', response.data)
        return response.data
      } catch (error) {
        console.error('Error shortening URL:', error)
        const errorMessage = error.response?.data?.error || 'Failed to shorten URL'
        commit('SET_ERROR', errorMessage)
        throw new Error(errorMessage)
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async deleteUrl({ commit }, id) {
      commit('SET_LOADING', true)
      try {
        await apiService.urlService.deleteUrl(urlId);
        commit('REMOVE_URL', urlId);
        
        // Xử lý cho khách (không đăng nhập)
        const isAuthenticated = !!localStorage.getItem('token');
        if (!isAuthenticated) {
          const guestUrlIds = JSON.parse(localStorage.getItem('guestUrlIds')) || [];
          const updatedIds = guestUrlIds.filter(id => id !== urlId);
          localStorage.setItem('guestUrlIds', JSON.stringify(updatedIds));
        }
        
        return { success: true };
      } catch (error) {
        // Không xử lý lỗi 401 ở đây vì interceptor đã xử lý
        if (!error.response || error.response.status !== 401) {
          console.error('Error deleting URL:', error);
        }
        throw error;
      }
    },
    
    // Auth actions
    async login({ commit }, credentials) {
      try {

        commit('SET_LOADING', true)
        commit('SET_ERROR', null)
        // Kiểm tra dữ liệu đầu vào
        if (!credentials || !credentials.username || !credentials.password) {
          if (credentials && credentials.token && credentials.user) {
            // Trường hợp đặc biệt: đã có token và user (từ localStorage)
            commit('SET_AUTH', credentials);
            return credentials.user;
          } else {
            throw new Error('Username and password are required');
          }
        }
        
        const response = await apiService.authService.login(credentials);
        const { token, user } = response.data;
        
        // Gọi AuthService để đăng nhập
        const result = await AuthService.login(credentials)

        // Cập nhật state từ kết quả đăng nhập
        commit('SET_AUTH_USER', result.user)
        commit('SET_TOKEN', result.token)
        // Update store
        commit('SET_AUTH', { user, token });
        
        return result.user
      } catch (error) {
        console.error('Login error:', error)
        const errorMessage = error.message || 'Login failed'
        commit('SET_ERROR', errorMessage)
        throw new Error(errorMessage)
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async register({ commit }, userData) {
      try {
        commit('SET_LOADING', true)
        commit('SET_ERROR', null)
        
        // Gọi AuthService để đăng ký
        const result = await AuthService.register(userData)
        
        // Cập nhật state từ kết quả đăng ký
        commit('SET_AUTH_USER', result.user)
        commit('SET_TOKEN', result.token)
        
        return result.user
      } catch (error) {
        console.error('Registration error:', error)
        const errorMessage = error.message || 'Registration failed'
        commit('SET_ERROR', errorMessage)
        throw new Error(errorMessage)
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async verifyAuth({ commit }) {
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.log("No token found in localStorage");
        commit('LOGOUT');
        return false;
      }
      
      try {
        console.log("Verifying token...");
        const response = await apiService.authService.verifyToken();
        
        if (response && response.data && response.data.isAuthenticated) {
          console.log("Token verification successful");
          
          // Cập nhật state với user từ response
          const user = response.data.user;
          commit('SET_AUTH', { user, token });
          return true;
        } else {
          console.log("Token is invalid or expired");
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          commit('LOGOUT');
          return false;
        }
      } catch (error) {
        console.error('Token verification error:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        commit('LOGOUT');
        return false;
      }
    },

    logout({ commit }) {
      // Xóa token và thông tin người dùng khỏi localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('userData');
      localStorage.removeItem('userId');
      localStorage.removeItem('userRole');
      
      // Cập nhật state trong store
      commit('LOGOUT');
      
      // Có thể thêm logic xóa dữ liệu người dùng khác
      commit('SET_URLS', []);
    },

    setAuthUser({ commit }, user) {
      const token = localStorage.getItem('token');
      if (user && token) {
        commit('SET_AUTH', { user, token });
        return user;
      } else {
        console.warn('Missing user or token for authentication');
        return null;
      }
    }
  }
})