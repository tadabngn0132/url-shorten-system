import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'

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
        // Add auth token to request if available
        const headers = {};
        if (state.auth.token) {
          headers['Authorization'] = `Bearer ${state.auth.token}`;
        }
        
        const response = await axios.get('http://localhost:9999/gateway/urls', { headers })
        commit('SET_URLS', response.data)
      } catch (error) {
        commit('SET_ERROR', error)
      } finally {
        commit('SET_LOADING', false)
      }
    },
    async shortenUrl({ commit, state }, urlData) 
    {
      commit('SET_LOADING', true)
      try {
        // If authenticated, add the user ID to the data
        if (state.auth.user) {
          urlData.userId = state.auth.user.id;
        }
        
        // Add auth token to request if available
        const headers = {};
        if (state.auth.token) {
          headers['Authorization'] = `Bearer ${state.auth.token}`;
        }
        
        const response = await axios.post('http://localhost:9999/gateway/urls', urlData, { headers })
        commit('ADD_URL', response.data)
        return response.data
      } catch (error) {
        commit('SET_ERROR', 'Failed to shorten URL')
        console.error('Error shortening URL:', error)
      } finally {
        commit('SET_LOADING', false)
      }
    },
    async deleteUrl({ commit, state }, id) {
      commit('SET_LOADING', true)
      try {
        // Add auth token to request if available
        const headers = {};
        if (state.auth.token) {
          headers['Authorization'] = `Bearer ${state.auth.token}`;
        }
        
        await axios.delete(`http://localhost:9999/gateway/urls/${id}`, { headers })
        commit('REMOVE_URL', id)
      } catch (error) {
        commit('SET_ERROR', 'Failed to delete URL');
        console.error('Error deleting URL:', error);
      } finally {
        commit('SET_LOADING', false)
      }
    },
    // Auth actions
    setAuthUser({ commit }, user) {
      commit('SET_AUTH_USER', user);
    },
    setToken({ commit }, token) {
      commit('SET_TOKEN', token);
      // Set token in axios default headers
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    },
    async login({ commit, dispatch }, credentials) {
      try {
        const response = await axios.post('http://localhost:9999/gateway/auth/login', credentials);
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
        throw error;
      }
    },
    async register({ commit, dispatch }, userData) {
      try {
        const response = await axios.post('http://localhost:9999/gateway/auth/register', userData);
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
        throw error;
      }
    },
    logout({ commit }) {
      // Remove from localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Update store
      commit('LOGOUT');
      
      // Remove token from axios headers
      delete axios.defaults.headers.common['Authorization'];
    },
    async verifyAuth({ commit, state }) {
      if (!state.auth.token) return false;
      
      try {
        const response = await axios.get('http://localhost:9999/gateway/auth/verify', {
          headers: { 'Authorization': `Bearer ${state.auth.token}` }
        });
        
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