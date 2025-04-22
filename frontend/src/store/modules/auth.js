import Vue from 'vue'
import Vuex from 'vuex'
import exportApis from '@/services/api/exportApis'

Vue.use(Vuex)

const state = {
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('token') || null,
    isAuthenticated: !!localStorage.getItem('token')
}

const getters = {
    isAuthenticated: (state) => state.isAuthenticated,
    currentUser: (state) => state.user,
    userRole: (state) => state.user ? state.user.role : null
}

const mutations = {
    SET_AUTH_USER(state, user) {
        state.user = user
        state.isAuthenticated = !!user
    },
    SET_AUTH(state, { user, token }) {
        state.user = user;
        state.token = token;
        state.isAuthenticated = !!user && !!token;

        // Lưu token và toàn bộ thông tin user vào localStorage
        if (token) localStorage.setItem('token', token);
        if (user) localStorage.setItem('user', JSON.stringify(user));
    },
    SET_TOKEN(state, token) {
        state.token = token
    },
    LOGOUT(state) {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;

        // Xóa token và user data từ localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('userData'); // Để đảm bảo xóa cả userData nếu có
    }
}

const actions = {
    async login({ commit }, credentials) {
        try {
            commit('SET_LOADING', true);
            commit('SET_ERROR', null);
            
            const response = await exportApis.auths.login(credentials);
            
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
        const result = await exportApis.auths.register(userData)
        
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
        const response = await exportApis.auths.verifyToken();
        
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

export default {
    namespaced: true,
    state,
    getters,
    mutations,
    actions
}