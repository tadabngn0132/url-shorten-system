<template>
    <div class="shortener">
        <h1>URL Shortener</h1>
        <p class="description">Enter the URL you want to shorten below</p>

        <form @submit.prevent="shortenUrl" class="shortener-form">
            <div class="input-group">
                <input
                    type="url"
                    v-model="originalUrl"
                    placeholder="Enter long URL (e.g., https://example.com)"
                    required
                    class="url-input"
                />
            </div>

            <div class="input-group">
                <input
                    type="text"
                    v-model="customCode"
                    placeholder="Custom code (optional)"
                    class="code-input"
                />
            </div>

            <button type="submit" class="btn-shorten" :disabled="isSubmitting">
                {{ isSubmitting ? 'Processing...' : 'Shorten URL' }}
            </button>

            <!-- Thêm thông báo về tính năng nâng cao cho người dùng đăng nhập -->
            <div v-if="!isAuthenticated" class="login-prompt">
                <p>
                    <router-link to="/login">Log in</router-link> or 
                    <router-link to="/login">register</router-link> 
                    for advanced URL management and bulk shortening.
                </p>
            </div>
        </form>

        <div v-if="error" class="error-message">
            {{ error }}
        </div>

        <div v-if="shortenedUrl" class="result">
            <h3>Your shortened URL:</h3>
            <div class="shortened-url">
                <a :href="shortenedUrl" target="_blank">{{ shortenedUrl }}</a>
                <button @click="copyToClipboard(shortenedUrl)" class="btn-copy">
                    Copy
                </button>
            </div>
        </div>
    </div>
</template>

<script>
import { mapGetters } from 'vuex';
import exportApis from '@/services/api/exportApis';

export default {
    name: 'Login',
    data() {
        return {
        isRegister: false,
        username: '',
        email: '',
        password: '',
        error: '',
        isLoading: false,
        originalUrl: '',
        customCode: '',
        isSubmitting: false,
        shortenedUrl: null
        };
    },
    computed: {
        ...mapGetters(['isAuthenticated'])
    },
    methods: {
        toggleForm() {
            this.isRegister = !this.isRegister;
            this.error = '';
        },
        async handleSubmit() {
            this.error = '';
            this.isLoading = true;
            
            try {
                let response;
                
                if (this.isRegister) {
                response = await exportApis.auths.register({
                    username: this.username,
                    email: this.email,
                    password: this.password
                });
                } else {
                response = await exportApis.auths.login({
                    username: this.username,
                    password: this.password
                });
                }
                
                // Lưu token và user vào localStorage
                localStorage.setItem('token', response.token);
                localStorage.setItem('user', JSON.stringify(response.user));
                
                // Cập nhật Vuex store
                this.$store.commit('auth/SET_AUTH', {
                    user: response.user,
                    token: response.token
                });
                
                // Redirect to home page
                this.$router.push('/');
            } catch (err) {
                console.error('Auth error:', err);
                this.error = err.userMessage || 'Đã xảy ra lỗi. Vui lòng thử lại.';
            } finally {
                this.isLoading = false;
            }
        }
    },
    created() {
        if (this.$route.query.expired) {
            this.error = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
        }
    }
};
</script>

<style scoped>
.shortener {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
    text-align: center;
}

h1 {
    color: #2c3e50;
    margin-bottom: 10px;
}

.description {
    color: #666;
    margin-bottom: 30px;
}

.shortener-form {
    display: flex;
    flex-direction: column;
    gap: 15px;
    margin-bottom: 20px;
}

.input-group {
    width: 100%;
}

.url-input, .code-input {
    width: 100%;
    padding: 12px 15px;
    border: 1px solid #ddd;
    border-radius: 5px;
    font-size: 16px;
}

.btn-shorten {
    background-color: #42b983;
    color: white;
    padding: 12px 20px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 16px;
    transition: background-color 0.3s;
}

.btn-shorten:hover {
    background-color: #3aa876;
}

.btn-shorten:disabled {
    background-color: #95d5b2;
    cursor: not-allowed;
}

.error-message {
    color: #f56c6c;
    margin-bottom: 15px;
}

.result {
    margin-top: 30px;
    padding: 20px;
    background-color: #f9f9f9;
    border-radius: 5px;
}

.shortened-url {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    margin-top: 10px;
}

.shortened-url a {
    color: #42b983;
    font-weight: bold;
    word-break: break-all;
}

.btn-copy {
    background-color: #42b983;
    color: white;
    padding: 8px 15px;
    border: none;
    border-radius: 3px;
    cursor: pointer;
}

.login-prompt {
    margin-top: 15px;
    padding: 10px;
    background-color: #f8f9fa;
    border-radius: 5px;
    font-size: 0.9rem;
}

.login-prompt a {
    color: #42b983;
    font-weight: bold;
    text-decoration: none;
}

.login-prompt a:hover {
    text-decoration: underline;
}
</style>