<template>
  <div class="profile-container">
    <div class="profile-header">
      <h1>My Profile</h1>
      <p class="profile-subtitle">Manage your account information and preferences</p>
    </div>

    <div v-if="loading" class="loading-container">
      <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="loading-icon">
        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path>
      </svg>
      <p>Loading profile information...</p>
    </div>
    
    <div v-else-if="error" class="error-container">
      <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
      <h3>Something went wrong</h3>
      <p>{{ error }}</p>
      <button @click="fetchProfile" class="btn btn-primary">Try Again</button>
    </div>
    
    <div v-else class="profile-grid">
      <!-- Profile Card -->
      <div class="card">
        <div class="card-body">
          <div class="profile-info">
            <div class="profile-avatar">
              <div class="avatar avatar-lg">
                {{ userInitials }}
              </div>
            </div>
            
            <div class="profile-details">
              <h2 class="profile-name">{{ profile.username }}</h2>
              <p class="profile-email">{{ profile.email }}</p>
              
              <div class="profile-meta">
                <div class="profile-meta-item">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="8.5" cy="7" r="4"></circle>
                    <polyline points="17 11 19 13 23 9"></polyline>
                  </svg>
                  <span>{{ profile.role }}</span>
                </div>
                
                <div class="profile-meta-item">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                  <span>Member since {{ formatDate(profile.createdAt) }}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="profile-actions">
            <button @click="showChangePasswordModal = true" class="btn btn-primary">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              Change Password
            </button>
          </div>
        </div>
      </div>
      
      <!-- Stats Card -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-header">
            <h3>URLs Created</h3>
            <div class="stat-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
              </svg>
            </div>
          </div>
          <p class="stat-value">{{ urlCount }}</p>
          <p class="stat-subtitle">Total URLs created</p>
        </div>
        
        <div class="stat-card">
          <div class="stat-header">
            <h3>Active URLs</h3>
            <div class="stat-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
          </div>
          <p class="stat-value">{{ activeUrlCount }}</p>
          <p class="stat-subtitle">URLs currently active</p>
        </div>
      </div>
    </div>
    
    <!-- Change Password Modal -->
    <div v-if="showChangePasswordModal" class="modal-overlay">
      <div class="modal-container">
        <div class="modal-header">
          <h3>Change Password</h3>
          <button class="modal-close" @click="showChangePasswordModal = false">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <div v-if="passwordError" class="alert alert-danger">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          {{ passwordError }}
        </div>
        
        <form @submit.prevent="changePassword" class="modal-body">
          <div class="form-group">
            <label class="form-label" for="current-password">Current Password</label>
            <div class="input-group">
              <div class="input-group-text">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </div>
              <input
                :type="showCurrentPassword ? 'text' : 'password'"
                id="current-password"
                v-model="passwordForm.currentPassword"
                required
                class="form-input"
                placeholder="••••••••"
              />
              <button 
                type="button" 
                class="input-group-text password-toggle" 
                @click="showCurrentPassword = !showCurrentPassword"
              >
                <svg v-if="showCurrentPassword" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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
          
          <div class="form-group">
            <label class="form-label" for="new-password">New Password</label>
            <div class="input-group">
              <div class="input-group-text">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </div>
              <input
                :type="showNewPassword ? 'text' : 'password'"
                id="new-password"
                v-model="passwordForm.newPassword"
                required
                class="form-input"
                placeholder="••••••••"
                minlength="6"
              />
              <button 
                type="button" 
                class="input-group-text password-toggle" 
                @click="showNewPassword = !showNewPassword"
              >
                <svg v-if="showNewPassword" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              </button>
            </div>
            <div class="helper-text">Password must be at least 6 characters</div>
          </div>
          
          <div class="form-group">
            <label class="form-label" for="confirm-password">Confirm New Password</label>
            <div class="input-group">
              <div class="input-group-text">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </div>
              <input
                :type="showConfirmPassword ? 'text' : 'password'"
                id="confirm-password"
                v-model="passwordForm.confirmPassword"
                required
                class="form-input"
                placeholder="••••••••"
              />
              <button 
                type="button" 
                class="input-group-text password-toggle" 
                @click="showConfirmPassword = !showConfirmPassword"
              >
                <svg v-if="showConfirmPassword" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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
          
          <div class="modal-footer">
            <button type="button" @click="showChangePasswordModal = false" class="btn btn-outline">
              Cancel
            </button>
            <button type="submit" class="btn btn-primary" :disabled="isChangingPassword">
              <svg v-if="isChangingPassword" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="loading-icon">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path>
              </svg>
              <span>{{ isChangingPassword ? 'Changing...' : 'Change Password' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import exportApis from '@/services/api/exportApis';
import { mapState, mapGetters } from 'vuex';

export default {
  name: 'Profile',
  data() {
    return {
      profile: null,
      loading: true,
      error: null,
      showChangePasswordModal: false,
      passwordForm: {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      },
      passwordError: null,
      isChangingPassword: false,
      urlCount: 0,
      activeUrlCount: 0,
      showCurrentPassword: false,
      showNewPassword: false,
      showConfirmPassword: false
    };
  },
  computed: {
    ...mapState({
      auth: state => state.auth
    }),
    ...mapGetters(['isAuthenticated']),
    
    userInitials() {
      if (!this.profile || !this.profile.username) return '';
      return this.profile.username.substring(0, 2).toUpperCase();
    }
  },
  methods: {
    async fetchProfile() {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await exportApis.auths.getProfile();
        this.profile = response;
      } catch (error) {
        console.error('Error fetching profile:', error);
        this.error = error.userMessage || 'Unable to load profile. Please try again.';
      } finally {
        this.loading = false;
      }
    },

    async fetchUrlStats() {
      try {
        if (!this.isAuthenticated || !this.auth.user) {
          return; 
        }
        
        const response = await exportApis.urls.getAllUrls();
        
        if (response && Array.isArray(response)) {
          const userUrls = response.filter(url => url.userId === this.auth.user.id);
          this.urlCount = userUrls.length;
          this.activeUrlCount = userUrls.filter(url => url.isActive).length;
        }
      } catch (error) {
        console.error('Error fetching URL stats:', error);
      }
    },
    
    formatDate(dateString) {
      if (!dateString) return 'N/A';
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateString).toLocaleDateString(undefined, options);
    },
    
    async changePassword() {
      this.passwordError = null;
      
      if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
        this.passwordError = 'New passwords do not match.';
        return;
      }
      
      if (this.passwordForm.newPassword.length < 6) {
        this.passwordError = 'Password must be at least 6 characters.';
        return;
      }
      
      this.isChangingPassword = true;
      
      try {
        await exportApis.auths.changePassword({
          currentPassword: this.passwordForm.currentPassword,
          newPassword: this.passwordForm.newPassword
        });
        
        // Clear form
        this.passwordForm = {
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        };
        
        // Close modal
        this.showChangePasswordModal = false;
        
        // Show success message
        alert('Password changed successfully!');
      } catch (error) {
        console.error('Error changing password:', error);
        this.passwordError = error.userMessage || 'Unable to change password. Please try again.';
      } finally {
        this.isChangingPassword = false;
      }
    }
  },
  created() {
    if (!this.isAuthenticated) {
      return;
    }
    
    this.fetchProfile();
    this.fetchUrlStats();
  }
};
</script>

<style scoped>
.profile-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 1.5rem;
}

.profile-header {
  text-align: center;
  margin-bottom: 2rem;
}

.profile-subtitle {
  color: var(--gray);
  margin-top: 0.5rem;
}

.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 4rem 2rem;
  background-color: white;
  border-radius: var(--rounded-lg);
  box-shadow: var(--shadow);
}

.loading-container svg,
.error-container svg {
  margin-bottom: 1.5rem;
  color: var(--gray);
}

.error-container h3 {
  margin-bottom: 0.5rem;
  color: var(--dark);
}

.error-container p {
  color: var(--gray);
  margin-bottom: 1.5rem;
}

.profile-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1.5rem;
}

.profile-info {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--primary);
  color: white;
  font-weight: 700;
  border-radius: var(--rounded-full);
  width: 3rem;
  height: 3rem;
}

.avatar-lg {
  width: 5rem;
  height: 5rem;
  font-size: 1.5rem;
}

.profile-name {
  font-size: 1.5rem;
  margin-bottom: 0.25rem;
}

.profile-email {
  color: var(--gray);
  margin-bottom: 1rem;
}

.profile-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.profile-meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--gray);
}

.profile-actions {
  display: flex;
  justify-content: flex-end;
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

.stat-card {
  background-color: white;
  border-radius: var(--rounded-lg);
  box-shadow: var(--shadow);
  padding: 1.5rem;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-md);
}

.stat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.stat-header h3 {
  font-size: 1rem;
  color: var(--gray);
  margin: 0;
}

.stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background-color: rgba(59, 130, 246, 0.1);
  border-radius: var(--rounded-full);
  color: var(--primary);
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--dark);
  margin-bottom: 0.25rem;
}

.stat-subtitle {
  font-size: 0.875rem;
  color: var(--gray);
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 1rem;
}

.modal-container {
  background-color: white;
  border-radius: var(--rounded-lg);
  box-shadow: var(--shadow-lg);
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid var(--gray-light);
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
}

.modal-close {
  background: none;
  border: none;
  color: var(--gray);
  cursor: pointer;
  transition: color 0.2s ease;
}

.modal-close:hover {
  color: var(--danger);
}

.modal-body {
  padding: 1.5rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
}

.helper-text {
  font-size: 0.875rem;
  color: var(--gray);
  margin-top: 0.5rem;
}

.password-toggle {
  cursor: pointer;
  border-left: none;
}

.loading-icon {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .profile-grid {
    grid-template-columns: 1fr;
  }
  
  .profile-info {
    flex-direction: column;
    text-align: center;
  }
  
  .profile-meta {
    justify-content: center;
  }
  
  .profile-actions {
    justify-content: center;
  }
}
</style>