<template>
  <div class="profile-container">
    <div class="profile-card">
      <h1>User Profile</h1>
      
      <div v-if="loading" class="loading">
        Loading profile...
      </div>
      
      <div v-else-if="error" class="error-message">
        {{ error }}
      </div>
      
      <div v-else class="profile-details">
        <div class="profile-avatar">
          <div class="avatar-circle">
            {{ userInitials }}
          </div>
        </div>
        
        <div class="profile-info">
          <div class="info-item">
            <span class="label">Username:</span>
            <span class="value">{{ profile.username }}</span>
          </div>
          
          <div class="info-item">
            <span class="label">Email:</span>
            <span class="value">{{ profile.email }}</span>
          </div>
          
          <div class="info-item">
            <span class="label">Role:</span>
            <span class="value role-badge" :class="{ 'admin-role': profile.role === 'admin' }">
              {{ profile.role }}
            </span>
          </div>
          
          <div class="info-item">
            <span class="label">Member Since:</span>
            <span class="value">{{ formatDate(profile.createdAt) }}</span>
          </div>
        </div>
      </div>
      
      <div class="profile-stats">
        <div class="stat-item">
          <span class="stat-value">{{ urlCount }}</span>
          <span class="stat-label">URLs Created</span>
        </div>
        
        <div class="stat-item">
          <span class="stat-value">{{ activeUrlCount }}</span>
          <span class="stat-label">Active URLs</span>
        </div>
      </div>
      
      <div class="profile-actions">
        <button @click="showChangePasswordModal = true" class="btn-change-password">
          Change Password
        </button>
      </div>
    </div>
    
    <!-- Change Password Modal -->
    <div v-if="showChangePasswordModal" class="modal">
      <div class="modal-content">
        <span class="close-modal" @click="showChangePasswordModal = false">&times;</span>
        <h2>Change Password</h2>
        
        <div v-if="passwordError" class="error-message">
          {{ passwordError }}
        </div>
        
        <form @submit.prevent="changePassword">
          <div class="form-group">
            <label for="current-password">Current Password</label>
            <input 
              type="password" 
              id="current-password" 
              v-model="passwordForm.currentPassword" 
              required
            />
          </div>
          
          <div class="form-group">
            <label for="new-password">New Password</label>
            <input 
              type="password" 
              id="new-password" 
              v-model="passwordForm.newPassword" 
              required
              minlength="6"
            />
          </div>
          
          <div class="form-group">
            <label for="confirm-password">Confirm New Password</label>
            <input 
              type="password" 
              id="confirm-password" 
              v-model="passwordForm.confirmPassword" 
              required
            />
          </div>
          
          <div class="modal-actions">
            <button type="button" @click="showChangePasswordModal = false" class="btn-cancel">
              Cancel
            </button>
            <button type="submit" class="btn-save" :disabled="isChangingPassword">
              {{ isChangingPassword ? 'Changing...' : 'Change Password' }}
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
      activeUrlCount: 0
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
        this.error = error.userMessage || 'Không thể tải hồ sơ. Vui lòng thử lại.';
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
        this.passwordError = 'Mật khẩu mới không khớp';
        return;
      }
      
      if (this.passwordForm.newPassword.length < 6) {
        this.passwordError = 'Mật khẩu phải có ít nhất 6 ký tự';
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
        alert('Đổi mật khẩu thành công');
      } catch (error) {
        console.error('Error changing password:', error);
        this.passwordError = error.userMessage || 'Không thể đổi mật khẩu. Vui lòng thử lại.';
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
  display: flex;
  justify-content: center;
  padding: 40px 20px;
}

.profile-card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 30px;
  width: 100%;
  max-width: 600px;
}

h1 {
  color: #2c3e50;
  margin-bottom: 30px;
  text-align: center;
}

.loading, .error-message {
  text-align: center;
  padding: 20px;
}

.error-message {
  color: #f56c6c;
  background-color: #fef0f0;
  border-radius: 4px;
}

.profile-details {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  margin-bottom: 30px;
}

.profile-avatar {
  margin-bottom: 20px;
}

.avatar-circle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background-color: #42b983;
  color: white;
  font-size: 2.5rem;
  font-weight: bold;
}

.profile-info {
  width: 100%;
}

.info-item {
  display: flex;
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid #f0f0f0;
}

.label {
  flex: 0 0 120px;
  font-weight: 500;
  color: #666;
}

.value {
  flex: 1;
  font-weight: 500;
  color: #2c3e50;
}

.role-badge {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 20px;
  background-color: #e5f9f0;
  color: #42b983;
  text-transform: capitalize;
}

.admin-role {
  background-color: #f0f5ff;
  color: #3498db;
}

.profile-stats {
  display: flex;
  justify-content: space-around;
  margin: 30px 0;
  padding: 20px 0;
  border-top: 1px solid #f0f0f0;
  border-bottom: 1px solid #f0f0f0;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: 2rem;
  font-weight: bold;
  color: #42b983;
}

.stat-label {
  font-size: 0.9rem;
  color: #666;
}

.profile-actions {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.btn-change-password {
  padding: 10px 20px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.3s;
}

.btn-change-password:hover {
  background-color: #2980b9;
}

/* Modal Styles */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.2);
  padding: 30px;
  width: 100%;
  max-width: 400px;
  position: relative;
}

.close-modal {
  position: absolute;
  top: 15px;
  right: 15px;
  font-size: 24px;
  cursor: pointer;
  color: #666;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.btn-cancel {
  padding: 8px 15px;
  border: 1px solid #ddd;
  background-color: white;
  border-radius: 4px;
  cursor: pointer;
}

.btn-save {
  padding: 8px 15px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-save:disabled {
  background-color: #95d5b2;
  cursor: not-allowed;
}
</style>