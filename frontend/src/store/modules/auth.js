import exportApis from '@/services/api/exportApis';

const state = {
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('token') || null,
    isAuthenticated: !!localStorage.getItem('token')
};

const getters = {
    isAuthenticated: (state) => state.isAuthenticated,
    currentUser: (state) => state.user,
    userRole: (state) => state.user ? state.user.role : null
};

const mutations = {
    SET_AUTH(state, { user, token }) {
        state.user = user;
        state.token = token;
        state.isAuthenticated = !!user && !!token;

        // Lưu token và toàn bộ thông tin user vào localStorage
        if (token) localStorage.setItem('token', token);
        if (user) localStorage.setItem('user', JSON.stringify(user));
    },
    LOGOUT(state) {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;

        // Xóa token và user data từ localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('userData');
    }
};

const actions = {
    async login({ commit }, credentials) {
        try {
            const response = await exportApis.auths.login(credentials);
            
            // Cập nhật store
            commit('SET_AUTH', {
                user: response.user,
                token: response.token
            });
            
            return response.user;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    },
    
    async register({ commit }, userData) {
        try {
            const response = await exportApis.auths.register(userData);
            
            // Cập nhật state từ kết quả đăng ký
            commit('SET_AUTH', {
                user: response.user,
                token: response.token
            });
            
            return response.user;
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    },
    
    async verifyAuth({ commit }) {
        const token = localStorage.getItem('token');
        
        if (!token) {
            commit('LOGOUT');
            return false;
        }
        
        try {
            const response = await exportApis.auths.verifyToken();
            
            if (response && response.isAuthenticated) {
                const user = response.user;
                commit('SET_AUTH', { user, token });
                return true;
            } else {
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
        
        // Cập nhật state trong store
        commit('LOGOUT');
    }
};

export default {
    namespaced: true,
    state,
    getters,
    mutations,
    actions
};