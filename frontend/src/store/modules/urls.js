import exportApis from '@/services/api/exportApis';

const state = {
    urls: [],
    loading: false,
    error: null
};

const getters = {
    allUrls: (state) => state.urls,
    isLoading: (state) => state.loading,
    hasError: (state) => state.error !== null
};

const mutations = {
    SET_URLS(state, urls) {
        state.urls = urls;
    },
    ADD_URL(state, url) {
        state.urls.push(url);
    },
    SET_LOADING(state, loading) {
        state.loading = loading;
    },
    SET_ERROR(state, error) {
        state.error = error;
    },
    REMOVE_URL(state, id) {
        state.urls = state.urls.filter(url => url.id !== id);
    }
};

const actions = {
    async fetchUrls({ commit }) {
        commit('SET_LOADING', true);
        try {
            const response = await exportApis.urls.getAllUrls();
            commit('SET_URLS', response);
        } catch (error) {
            console.error('Error fetching URLs:', error);
            commit('SET_ERROR', error.userMessage || 'Không thể tải danh sách URL');
        } finally {
            commit('SET_LOADING', false);
        }
    },
        
    async shortenUrl({ commit }, urlData) {
        commit('SET_LOADING', true);
        try {
            const response = await exportApis.urls.createUrl(urlData);
            commit('ADD_URL', response);
            return response;
        } catch (error) {
            console.error('Error shortening URL:', error);
            throw error;
        } finally {
            commit('SET_LOADING', false);
        }
    },
    
    async deleteUrl({ commit }, id) {
        commit('SET_LOADING', true);
        try {
            await exportApis.urls.deleteUrl(id);
            commit('REMOVE_URL', id);
            
            // Xử lý cho khách (không đăng nhập)
            const isAuthenticated = !!localStorage.getItem('token');
            if (!isAuthenticated) {
                const guestUrlIds = JSON.parse(localStorage.getItem('guestUrlIds')) || [];
                const updatedIds = guestUrlIds.filter(urlId => urlId !== id);
                localStorage.setItem('guestUrlIds', JSON.stringify(updatedIds));
            }
            
            return { success: true };
        } catch (error) {
            console.error('Error deleting URL:', error);
            throw error;
        } finally {
            commit('SET_LOADING', false);
        }
    }
};

export default {
    namespaced: true,
    state,
    getters,
    mutations,
    actions
};