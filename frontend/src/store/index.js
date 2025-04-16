import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'


Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    urls: [],
    loading: false,
    error: null,
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
    }
  },
  actions: {
    async fetchUrls({ commit }) {
      commit('SET_LOADING', true)
      try {
        const response = await axios.get('/api/urls')
        commit('SET_URLS', response.data)
      } catch (error) {
        commit('SET_ERROR', error)
      } finally {
        commit('SET_LOADING', false)
      }
    },
    async shortenUrl({ commit }, urlData) 
    {
      commit('SET_LOADING', true)
      try {
        const response = await axios.post('http://localhost:9999/gateway/urls', urlData)
        commit('ADD_URL', response.data)
        return response.data
      } catch (error) {
        commit('SET_ERROR', 'Failed to shorten URL')
        console.error('Error shortening URL:', error)
      } finally {
        commit('SET_LOADING', false)
      }
    },
    async deleteUrl({ commit }, id) {
      commit('SET_LOADING', true)
      try {
        await axios.delete(`http://localhost:9999/gateway/urls/${id}`)
        commit('REMOVE_URL', id)
      } catch (error) {
        commit('SET_ERROR', 'Failed to delete URL');
        console.error('Error deleting URL:', error);
      } finally {
        commit('SET_LOADING', false)
      }
    }
  }
}
)