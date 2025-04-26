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
          try {
            response = await exportApis.auths.register({
              username: this.username,
              email: this.email,
              password: this.password
            });
            
            console.log('Register response success:', response);
            
            // Successful registration with valid response
            localStorage.setItem('token', response.token);
            
            // Store user data and securely store credentials for token refresh
            const userData = {...response.user, username: this.username, password: this.password};
            localStorage.setItem('user', JSON.stringify(userData));
            
            this.$store.commit('auth/SET_AUTH', {
              user: response.user,
              token: response.token
            });
            
            // Transfer guest URLs to the new registered user
            await this.transferGuestUrls(response.user.id);
            
            this.$router.push('/');
          } catch (registerError) {
            console.error('Register specific error:', registerError);
            
            // Special handling for the case where user is created but response has an error
            if (registerError && registerError.response && 
                registerError.response.status === 400 && 
                registerError.userMessage === 'Failed to register user') {
              
              // Show a more helpful message and redirect to login
              this.isRegister = false;
              this.error = 'Registration may have succeeded. Please try logging in with your credentials.';
              return;
            }
            
            // Rethrow for general error handling
            throw registerError;
          }
        } else {
          // Login flow
          response = await exportApis.auths.login({
            username: this.username,
            password: this.password
          });
          
          localStorage.setItem('token', response.token);
          
          // Store user data and securely store credentials for token refresh
          const userData = {...response.user, username: this.username, password: this.password};
          localStorage.setItem('user', JSON.stringify(userData));
          
          this.$store.commit('auth/SET_AUTH', {
            user: response.user,
            token: response.token
          });
          
          // Transfer guest URLs to the logged in user
          await this.transferGuestUrls(response.user.id);
          
          this.$router.push('/');
        }
      } catch (err) {
        console.error('Auth error:', err);
        this.error = err.userMessage || 'Đã xảy ra lỗi. Vui lòng thử lại.';
      } finally {
        this.isLoading = false;
      }
    },
    
    // New method to transfer guest URLs to registered user
    async transferGuestUrls(userId) {
      try {
        // Get guest URL IDs from localStorage
        const guestUrlIds = JSON.parse(localStorage.getItem('guestUrlIds') || '[]');
        
        console.log('Guest URL IDs found in localStorage:', guestUrlIds);
        
        if (guestUrlIds.length > 0) {
          console.log(`Attempting to transfer ${guestUrlIds.length} guest URLs to user ${userId}`);
          
          // Two approaches: 
          // 1. Bulk transfer using new API endpoint (preferred if backend supports it)
          try {
            console.log('Calling transfer-ownership API with payload:', { urlIds: guestUrlIds, newUserId: userId });
            const result = await exportApis.urls.transferUrlOwnership(guestUrlIds, userId);
            console.log('Transfer ownership API response:', result);
            
            // Clear guest URLs from localStorage after transfer
            localStorage.removeItem('guestUrlIds');
            console.log('Cleared guest URLs from localStorage after successful transfer');
          } catch (bulkError) {
            console.error('Bulk transfer failed, details:', bulkError);
            
            // 2. Fallback: Update each URL individually
            console.log('Falling back to individual URL updates');
            const updatePromises = guestUrlIds.map(async (urlId) => {
              try {
                console.log(`Fetching URL with ID ${urlId}`);
                const urlData = await exportApis.urls.getUrlById(urlId);
                
                if (urlData) {
                  console.log(`Updating URL ${urlId} owner from "${urlData.userId}" to "${userId}"`);
                  urlData.userId = userId;
                  await exportApis.urls.updateUrl(urlId, urlData);
                  console.log(`URL ${urlId} ownership updated successfully`);
                  return true;
                }
                return false;
              } catch (err) {
                console.error(`Failed to update URL ${urlId}:`, err);
                return false;
              }
            });
            
            const results = await Promise.all(updatePromises);
            const successCount = results.filter(r => r).length;
            
            if (successCount > 0) {
              console.log(`Successfully transferred ${successCount} URLs via individual updates`);
              // Clear guest URLs from localStorage after transfer
              localStorage.removeItem('guestUrlIds');
              console.log('Cleared guest URLs from localStorage after successful individual transfers');
            }
          }
        } else {
          console.log('No guest URLs found in localStorage to transfer');
        }
      } catch (error) {
        console.error('Error in transferGuestUrls:', error);
        // Don't throw error - we don't want to interrupt the login flow
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