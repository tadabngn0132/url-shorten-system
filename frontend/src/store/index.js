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
    SET_TOKEN(state, token) {
      state.auth.token = token
    },
    LOGOUT(state) {
      state.auth.user = null
      state.auth.token = null
      state.auth.isAuthenticated = false
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
        await apiService.urlService.deleteUrl(id)
        commit('REMOVE_URL', id)
      } catch (error) {
        console.error('Error deleting URL:', error)
        commit('SET_ERROR', error.response?.data?.error || 'Failed to delete URL')
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    // Auth actions
    async login({ commit }, credentials) {
      try {
        commit('SET_LOADING', true)
        commit('SET_ERROR', null)
        
        // Gọi AuthService để đăng nhập
        const result = await AuthService.login(credentials)
        
        // Cập nhật state từ kết quả đăng nhập
        commit('SET_AUTH_USER', result.user)
        commit('SET_TOKEN', result.token)
        
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
      try {
        // Xác thực token
        const result = await AuthService.verifyAuth()
        
        if (result.isAuthenticated) {
          commit('SET_AUTH_USER', result.user)
          return true
        } else {
          // Xóa thông tin xác thực không hợp lệ
          commit('LOGOUT')
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          return false
        }
      } catch (error) {
        console.error('Token verification error:', error)
        commit('LOGOUT')
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        return false
      }
    },
    
    logout({ commit }) {
      // Xóa thông tin xác thực
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      
      // Cập nhật state
      commit('LOGOUT')
    },
    
    setAuthUser({ commit }, user) {
      commit('SET_AUTH_USER', user)
    }
  }
})