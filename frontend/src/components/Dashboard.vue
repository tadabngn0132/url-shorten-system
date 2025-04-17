<template>
    <div class="dashboard">
      <h1>User Dashboard</h1>
      
      <div class="dashboard-stats">
        <div class="stat-card">
          <h3>Total URLs</h3>
          <p class="stat-number">{{ urls.length }}</p>
        </div>
        
        <div class="stat-card">
          <h3>Active URLs</h3>
          <p class="stat-number">{{ activeUrls.length }}</p>
        </div>
      </div>
      
      <div class="dashboard-actions">
        <h2>Your URLs</h2>
        <div v-if="loading" class="loading">
          Loading URLs...
        </div>
        <div v-else-if="urls.length === 0" class="no-urls">
          No URLs shortened yet.
        </div>
        <div v-else class="url-management">
          <div class="url-filters">
            <button 
              @click="currentFilter = 'all'" 
              :class="{ active: currentFilter === 'all' }"
              class="filter-btn"
            >
              All
            </button>
            <button 
              @click="currentFilter = 'active'" 
              :class="{ active: currentFilter === 'active' }"
              class="filter-btn"
            >
              Active
            </button>
            <button 
              @click="currentFilter = 'inactive'" 
              :class="{ active: currentFilter === 'inactive' }"
              class="filter-btn"
            >
              Inactive
            </button>
          </div>
          
          <div class="url-list">
            <div v-for="url in filteredUrls" :key="url.id" class="url-item">
              <div class="url-details">
                <div class="original-url">
                  <h4>Original URL:</h4>
                  <p>{{ url.originalUrl }}</p>
                </div>
                <div class="short-url">
                  <h4>Shortened URL:</h4>
                  <a :href="getFullShortUrl(url)" target="_blank">{{ getFullShortUrl(url) }}</a>
                  <button @click="copyToClipboard(getFullShortUrl(url))" class="btn-copy">
                    Copy
                  </button>
                </div>
                <div class="created-at">
                  <small>Created at: {{ formatDate(url.createdAt) }}</small>
                </div>
              </div>
              <div class="url-actions">
                <div class="url-status">
                  <label class="switch">
                    <input 
                      type="checkbox" 
                      :checked="url.isActive" 
                      @change="toggleUrlStatus(url)"
                    >
                    <span class="slider"></span>
                  </label>
                  <span class="status-label">{{ url.isActive ? 'Active' : 'Inactive' }}</span>
                </div>
                <button @click="editUrl(url)" class="btn-edit">Edit</button>
                <button @click="deleteUrl(url.id)" class="btn-delete">Delete</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Edit URL Modal -->
      <div v-if="showEditModal" class="edit-modal">
        <div class="modal-content">
          <span class="close-modal" @click="showEditModal = false">&times;</span>
          <h2>Edit URL</h2>
          
          <form @submit.prevent="saveUrlChanges">
            <div class="form-group">
              <label for="original-url">Original URL</label>
              <input type="url" id="original-url" v-model="editingUrl.originalUrl" required>
            </div>
            
            <div class="form-group">
              <label for="short-code">Short Code</label>
              <input type="text" id="short-code" v-model="editingUrl.shortCode" required>
            </div>
            
            <div class="form-group checkbox">
              <label>
                <input type="checkbox" v-model="editingUrl.isActive">
                Active
              </label>
            </div>
            
            <div class="modal-actions">
              <button type="button" @click="showEditModal = false" class="btn-cancel">Cancel</button>
              <button type="submit" class="btn-save">Save Changes</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { mapState, mapGetters } from 'vuex';
  import axios from 'axios';
  
  export default {
    name: 'Dashboard',
    data() {
      return {
        currentFilter: 'all',
        showEditModal: false,
        editingUrl: null,
        loading: true
      };
    },
    computed: {
      ...mapState(['auth']),
      ...mapGetters(['isAuthenticated']),
      
      urls() {
        // If we have Vuex store with URLs, use it
        return this.$store.state.urls || [];
      },
      activeUrls() {
        return this.urls.filter(url => url.isActive);
      },
      filteredUrls() {
        if (this.currentFilter === 'active') {
          return this.urls.filter(url => url.isActive);
        } else if (this.currentFilter === 'inactive') {
          return this.urls.filter(url => !url.isActive);
        }
        return this.urls;
      }
    },
    methods: {
      async fetchUrls() {
        this.loading = true;
        try {
          const headers = {};
          if (this.auth.token) {
            headers['Authorization'] = `Bearer ${this.auth.token}`;
          }
          
          const response = await axios.get('http://localhost:9999/gateway/urls', { headers });
          this.$store.commit('SET_URLS', response.data);
        } catch (error) {
          console.error('Error fetching URLs:', error);
        } finally {
          this.loading = false;
        }
      },
      getFullShortUrl(url) {
        return `${window.location.origin}/${url.shortCode}`;
      },
      formatDate(dateString) {
        const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString(undefined, options);
      },
      copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
          alert('URL copied to clipboard!');
        }).catch(err => {
          console.error('Failed to copy:', err);
        });
      },
      async toggleUrlStatus(url) {
        try {
          const updatedUrl = { ...url, isActive: !url.isActive };
          const headers = {};
          if (this.auth.token) {
            headers['Authorization'] = `Bearer ${this.auth.token}`;
          }
          
          await axios.put(`http://localhost:9999/gateway/urls/${url.id}`, updatedUrl, { headers });
          
          // Update the URL in the store
          this.fetchUrls();
        } catch (error) {
          console.error('Error updating URL status:', error);
        }
      },
      editUrl(url) {
        this.editingUrl = { ...url };
        this.showEditModal = true;
      },
      async saveUrlChanges() {
        try {
          const headers = {};
          if (this.auth.token) {
            headers['Authorization'] = `Bearer ${this.auth.token}`;
          }
          
          await axios.put(`http://localhost:9999/gateway/urls/${this.editingUrl.id}`, this.editingUrl, { headers });
          
          // Refresh URLs
          this.fetchUrls();
          
          // Close modal
          this.showEditModal = false;
          this.editingUrl = null;
        } catch (error) {
          console.error('Error saving URL changes:', error);
          
          if (error.response && error.response.data && error.response.data.error) {
            alert(error.response.data.error);
          } else {
            alert('Failed to save changes. Please try again.');
          }
        }
      },
      async deleteUrl(id) {
        if (confirm('Are you sure you want to delete this URL?')) {
          await this.$store.dispatch('deleteUrl', id);
        }
      }
    },
    created() {
      // Fetch URLs when component is created
      this.fetchUrls();
    },
    beforeRouteEnter(to, from, next) {
      next(vm => {
        // Check if user is authenticated
        if (!vm.isAuthenticated) {
          vm.$router.push('/login');
        }
      });
    }
  };
  </script>
  
  <style scoped>
  .dashboard {
    max-width: 1000px;
    margin: 0 auto;
    padding: 20px;
  }
  
  h1 {
    color: #2c3e50;
    margin-bottom: 30px;
    text-align: center;
  }
  
  h2 {
    color: #2c3e50;
    margin: 30px 0 20px;
  }
  
  .dashboard-stats {
    display: flex;
    gap: 20px;
    margin-bottom: 30px;
  }
  
  .stat-card {
    flex: 1;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    padding: 20px;
    text-align: center;
  }
  
  .stat-card h3 {
    color: #666;
    margin-bottom: 10px;
  }
  
  .stat-number {
    font-size: 2.5rem;
    font-weight: bold;
    color: #42b983;
  }
  
  .url-filters {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
  }
  
  .filter-btn {
    padding: 8px 15px;
    border: 1px solid #ddd;
    border-radius: 5px;
    background-color: white;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .filter-btn.active {
    background-color: #42b983;
    color: white;
    border-color: #42b983;
  }
  
  .url-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px;
    margin-bottom: 15px;
    border: 1px solid #ddd;
    border-radius: 5px;
    background-color: #f9f9f9;
  }
  
  .url-details {
    flex: 1;
  }
  
  .original-url, .short-url {
    margin-bottom: 10px;
  }
  
  .original-url p {
    word-break: break-all;
    margin: 5px 0;
  }
  
  .short-url a {
    color: #42b983;
    text-decoration: none;
    margin-right: 10px;
  }
  
  .created-at {
    color: #666;
  }
  
  .url-actions {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  
  .url-status {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  
  .switch {
    position: relative;
    display: inline-block;
    width: 50px;
    height: 24px;
  }
  
  .switch input {
    opacity: 0;
    width: 0;
    height: 0;
  }
  
  .slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #ccc;
    transition: .4s;
    border-radius: 24px;
  }
  
  .slider:before {
    position: absolute;
    content: "";
    height: 16px;
    width: 16px;
    left: 4px;
    bottom: 4px;
    background-color: white;
    transition: .4s;
    border-radius: 50%;
  }
  
  input:checked + .slider {
    background-color: #42b983;
  }
  
  input:checked + .slider:before {
    transform: translateX(26px);
  }
  
  .status-label {
    font-size: 0.9rem;
    color: #666;
  }
  
  .btn-copy, .btn-edit, .btn-delete {
    padding: 5px 10px;
    border: none;
    border-radius: 3px;
    cursor: pointer;
    width: 100%;
  }
  
  .btn-copy {
    background-color: #42b983;
    color: white;
  }
  
  .btn-edit {
    background-color: #3498db;
    color: white;
  }
  
  .btn-delete {
    background-color: #f56c6c;
    color: white;
  }
  
  /* Modal Styles */
  .edit-modal {
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
    max-width: 500px;
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
  
  .form-group input[type="text"],
  .form-group input[type="url"] {
    width: 100%;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 5px;
  }
  
  .form-group.checkbox {
    display: flex;
    align-items: center;
  }
  
  .form-group.checkbox label {
    display: flex;
    align-items: center;
    gap: 5px;
    margin-bottom: 0;
    cursor: pointer;
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
  
  .loading, .no-urls {
    text-align: center;
    padding: 20px;
    color: #666;
  }
  </style>