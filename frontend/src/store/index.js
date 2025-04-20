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

      // Lưu token và toàn bộ thông tin user vào localStorage
      if (token) localStorage.setItem('token', token);
      if (user) localStorage.setItem('userData', JSON.stringify(user));
    },
    SET_TOKEN(state, token) {
      state.auth.token = token
    },
    LOGOUT(state) {
      state.auth.user = null
      state.auth.token = null
      state.auth.isAuthenticated = false

      // Xóa token và user data từ localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('userData');
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
        commit('SET_LOADING', true);
        commit('SET_ERROR', null);
        
        const response = await apiService.authService.login(credentials);
        
        // Đảm bảo response có đúng định dạng
        if (response.data && response.data.token && response.data.user) {
          // Lưu vào localStorage
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('user', JSON.stringify(response.data.user));
          
          // Cập nhật store
          commit('SET_AUTH', {
            user: response.data.user,
            token: response.data.token
          });
          
          return response.data.user;
        } else {
          throw new Error('Invalid response format');
        }
      } catch (error) {
        console.error('Login error:', error);
        const errorMessage = error.response?.data?.error || error.message || 'Login failed';
        commit('SET_ERROR', errorMessage);
        throw new Error(errorMessage);
      } finally {
        commit('SET_LOADING', false);
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

    // Sửa hàm setAuthUser trong store
  setAuthUser({ commit }, user) {
    // Kiểm tra xem user có tồn tại không trước khi sử dụng
    if (!user) {
      console.warn('No user data provided to setAuthUser');
      return null;
    }
    
    const token = localStorage.getItem('token');
    if (token) {
      // Cả user và token đều tồn tại
      commit('SET_AUTH', { user, token });
      return user;
    } else {
      console.warn('Missing token for authentication');
      // Kiểm tra xem có token trong user object không
      if (user.token) {
        // Lưu token vào localStorage
        localStorage.setItem('token', user.token);
        commit('SET_AUTH', { user, token: user.token });
        return user;
      }
      return null;
    }
  }
  }
})