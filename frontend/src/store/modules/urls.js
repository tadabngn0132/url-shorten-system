import Vue from 'vue'
import Vuex from 'vuex'
import exportApis from '@/services/api/exportApis'

Vue.use(Vuex)

const state = {
    urls: [],
    loading: false,
    error: null
}

const getters = {
    allUrls: (state) => state.urls,
    isLoading: (state) => state.loading,
    hasError: (state) => state.error !== null
}

const mutations = {
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
}

const actions = {
    async fetchUrls({ commit }) {
        commit('SET_LOADING', true)
        try {
            const response = await exportApis.urls.getAllUrls()
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
            
            const response = await exportApis.urls.createUrl(urlData)
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
            await exportApis.urls.deleteUrl(urlId);
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
    }
}

export default {
    namespaced: true,
    state,
    getters,
    mutations,
    actions
}