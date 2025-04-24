import Vue from 'vue';
import Vuex from 'vuex';
import auth from './modules/auth';
import urls from './modules/urls';

Vue.use(Vuex);

export default new Vuex.Store({
    modules: {
        auth,
        urls
    },
    // Thêm getters toàn cục để dễ truy cập
    getters: {
        isAuthenticated: state => state.auth.isAuthenticated,
        currentUser: state => state.auth.user
    }
});