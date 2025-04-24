<template>
  <div class="login-container">
    <div class="auth-form">
      <h2>{{ isRegister ? 'Create Account' : 'Login' }}</h2>
      
      <div v-if="error" class="error-message">
        {{ error }}
      </div>
      
      <form @submit.prevent="handleSubmit">
        <div class="form-group" v-if="isRegister">
          <label for="email">Email</label>
          <input
            type="email"
            id="email"
            v-model="email"
            required
            placeholder="Enter your email"
          />
        </div>
        
        <div class="form-group">
          <label for="username">Username</label>
          <input
            type="text"
            id="username"
            v-model="username"
            required
            placeholder="Enter your username"
          />
        </div>
        
        <div class="form-group">
          <label for="password">Password</label>
          <input
            type="password"
            id="password"
            v-model="password"
            required
            placeholder="Enter your password"
          />
        </div>
        
        <button type="submit" class="btn-submit" :disabled="isLoading">
          {{ isLoading ? 'Processing...' : (isRegister ? 'Register' : 'Login') }}
        </button>
      </form>
      
      <div class="form-switch">
        <p>
          {{ isRegister ? 'Already have an account?' : 'Need an account?' }}
          <a href="#" @click.prevent="toggleForm">
            {{ isRegister ? 'Login' : 'Register' }}
          </a>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
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
      isLoading: false
    };
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
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px 20px;
}

.auth-form {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 30px;
  width: 100%;
  max-width: 400px;
}

h2 {
  color: #2c3e50;
  margin-bottom: 30px;
  text-align: center;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #2c3e50;
}

input {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 16px;
}

.btn-submit {
  background-color: #42b983;
  color: white;
  width: 100%;
  padding: 12px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s;
}

.btn-submit:hover {
  background-color: #3aa876;
}

.btn-submit:disabled {
  background-color: #95d5b2;
  cursor: not-allowed;
}

.error-message {
  color: #f56c6c;
  margin-bottom: 15px;
  text-align: center;
  padding: 10px;
  background-color: #fef0f0;
  border-radius: 4px;
}

.form-switch {
  margin-top: 20px;
  text-align: center;
}

.form-switch a {
  color: #42b983;
  font-weight: bold;
  text-decoration: none;
}

.form-switch a:hover {
  text-decoration: underline;
}
</style>