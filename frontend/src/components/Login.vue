<template>
  <div class="auth-container">
    <div class="auth-card">
      <div class="auth-header">
        <h2>{{ isRegister ? 'Create an Account' : 'Welcome Back' }}</h2>
        <p class="auth-subtitle">{{ isRegister ? 'Sign up to manage your shortened URLs' : 'Sign in to your account' }}</p>
      </div>
      
      <div v-if="error" class="alert alert-danger">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        {{ error }}
      </div>
      
      <form @submit.prevent="handleSubmit" class="auth-form">
        <div class="form-group" v-if="isRegister">
          <label class="form-label" for="email">Email</label>
          <div class="input-group">
            <div class="input-group-text">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
            </div>
            <input
              type="email"
              id="email"
              v-model="email"
              required
              class="form-input"
              placeholder="you@example.com"
            />
          </div>
        </div>
        
        <div class="form-group">
          <label class="form-label" for="username">Username</label>
          <div class="input-group">
            <div class="input-group-text">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
            <input
              type="text"
              id="username"
              v-model="username"
              required
              class="form-input"
              placeholder="johndoe"
            />
          </div>
        </div>
        
        <div class="form-group">
          <div class="password-label">
            <label class="form-label" for="password">Password</label>
            <span v-if="!isRegister" class="forgot-password">Forgot password?</span>
          </div>
          <div class="input-group">
            <div class="input-group-text">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </div>
            <input
              :type="showPassword ? 'text' : 'password'"
              id="password"
              v-model="password"
              required
              class="form-input"
              placeholder="••••••••"
            />
            <button 
              type="button" 
              class="input-group-text password-toggle" 
              @click="showPassword = !showPassword"
            >
              <svg v-if="showPassword" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                <line x1="1" y1="1" x2="23" y2="23"></line>
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            </button>
          </div>
        </div>
        
        <button type="submit" class="btn btn-primary btn-block" :disabled="isLoading">
          <svg v-if="isLoading" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="loading-icon">
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path>
          </svg>
          {{ isLoading ? 'Processing...' : (isRegister ? 'Create Account' : 'Sign In') }}
        </button>
      </form>
      
      <div class="auth-separator">
        <span>OR</span>
      </div>
      
      <div class="form-switch">
        <p>
          {{ isRegister ? 'Already have an account?' : 'Need an account?' }}
          <a href="#" @click.prevent="toggleForm">
            {{ isRegister ? 'Sign In' : 'Sign Up' }}
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
      isRegister: this.$route.query.register === 'true',
      username: '',
      email: '',
      password: '',
      error: '',
      isLoading: false,
      showPassword: false
    };
  },
  methods: {
    toggleForm() {
      this.isRegister = !this.isRegister;
      this.error = '';
      
      // Update URL query parameter without reloading
      this.$router.replace({
        query: { ...this.$route.query, register: this.isRegister ? 'true' : undefined }
      }).catch(() => {});
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
        this.error = err.userMessage || 'An error occurred. Please try again.';
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
      this.error = 'Your session has expired. Please log in again.';
    }
  }
};
</script>

<style scoped>
.auth-container {
  max-width: 450px;
  margin: 2rem auto;
  padding: 0 1rem;
}

.auth-card {
  background-color: white;
  border-radius: var(--rounded-lg);
  box-shadow: var(--shadow-md);
  overflow: hidden;
}

.auth-header {
  text-align: center;
  padding: 2rem 2rem 1rem;
}

.auth-subtitle {
  color: var(--gray);
  margin-top: 0.5rem;
}

.auth-form {
  padding: 0 2rem 2rem;
}

.password-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.forgot-password {
  font-size: 0.875rem;
  color: var(--primary);
  cursor: pointer;
}

.forgot-password:hover {
  text-decoration: underline;
}

.password-toggle {
  cursor: pointer;
  border-left: none;
}

.input-group {
  display: flex;
  align-items: stretch;
}

.input-group-text {
  display: flex;
  align-items: center;
  padding: 0 0.75rem;
  background-color: var(--gray-light);
  border: 1px solid var(--gray-light);
}

.input-group-text:first-child {
  border-top-left-radius: var(--rounded);
  border-bottom-left-radius: var(--rounded);
  border-right: none;
}

.input-group-text:last-child {
  border-top-right-radius: var(--rounded);
  border-bottom-right-radius: var(--rounded);
  border-left: none;
}

.input-group .form-input {
  border-radius: 0;
}

.input-group .form-input:first-child {
  border-top-left-radius: var(--rounded);
  border-bottom-left-radius: var(--rounded);
}

.input-group .form-input:last-child {
  border-top-right-radius: var(--rounded);
  border-bottom-right-radius: var(--rounded);
}

.auth-separator {
  display: flex;
  align-items: center;
  text-align: center;
  margin: 1.5rem 2rem;
}

.auth-separator::before,
.auth-separator::after {
  content: '';
  flex: 1;
  border-bottom: 1px solid var(--gray-light);
}

.auth-separator span {
  padding: 0 1rem;
  color: var(--gray);
  font-size: 0.875rem;
}

.form-switch {
  text-align: center;
  padding: 0 2rem 2rem;
}

.form-switch a {
  color: var(--primary);
  font-weight: 500;
  text-decoration: none;
}

.form-switch a:hover {
  text-decoration: underline;
}

.loading-icon {
  animation: spin 1s linear infinite;
  margin-right: 0.5rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>