import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'
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
    async fetchUrls({ commit, state }) {
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
    
    async deleteUrl({ commit, state }, id) {
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
    async login({ commit, dispatch }, credentials) {
      try {
        const response = await apiService.authService.login(credentials)
        const { token, user } = response.data;
        
        // Save to localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        // Update store
        commit('SET_AUTH_USER', user);
        commit('SET_TOKEN', token);
        
        return user;
      } catch (error) {
        console.error('Login error:', error);
        const errorMessage = error.response?.data?.error || 'Login failed'
        throw new Error(errorMessage);
      }
    },
    
    async register({ commit, dispatch }, userData) {
      try {
        const response = await apiService.authService.register(userData)
        const { token, user } = response.data;
        
        // Save to localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        // Update store
        commit('SET_AUTH_USER', user);
        commit('SET_TOKEN', token);
        
        return user;
      } catch (error) {
        console.error('Registration error:', error);
        const errorMessage = error.response?.data?.error || 'Registration failed'
        throw new Error(errorMessage);
      }
    },
    
    async verifyAuth({ commit, state }) {
      if (!state.auth.token) return false;
      
      try {
        const response = await apiService.authService.verifyToken();
        
        if (response.data.isAuthenticated) {
          commit('SET_AUTH_USER', response.data.user);
          return true;
        } else {
          commit('LOGOUT');
          return false;
        }
      } catch (error) {
        console.error('Token verification error:', error);
        commit('LOGOUT');
        return false;
      }
    }
  }
})