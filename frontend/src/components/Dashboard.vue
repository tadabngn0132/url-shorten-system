<template>
  <div class="dashboard-container">
    <div class="dashboard-header">
      <h1>Analytics Dashboard</h1>
      <p class="dashboard-subtitle">Track and analyze your shortened URL performance</p>
    </div>
    
    <!-- Control Panel -->
    <div class="control-panel">
      <!-- URL Selector -->
      <div class="url-selector">
        <label for="url-select" class="form-label">Select URL:</label>
        <select id="url-select" v-model="selectedUrlId" @change="fetchDashboardData" class="form-select">
          <option value="">All URLs</option>
          <option v-for="url in urls" :key="url.id" :value="url.id">
            {{ url.shortCode }} ({{ url.originalUrl | truncate(30) }})
          </option>
        </select>
      </div>
      
      <!-- View Type Selector -->
      <div class="view-type-selector">
        <label class="form-label">View Type:</label>
        <div class="toggle-buttons">
          <button 
            :class="['toggle-btn', { active: viewType === 'charts' }]" 
            @click="viewType = 'charts'"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="20" x2="18" y2="10"></line>
              <line x1="12" y1="20" x2="12" y2="4"></line>
              <line x1="6" y1="20" x2="6" y2="14"></line>
            </svg>
            Charts
          </button>
          <button 
            :class="['toggle-btn', { active: viewType === 'tables' }]" 
            @click="viewType = 'tables'"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="8" y1="6" x2="21" y2="6"></line>
              <line x1="8" y1="12" x2="21" y2="12"></line>
              <line x1="8" y1="18" x2="21" y2="18"></line>
              <line x1="3" y1="6" x2="3.01" y2="6"></line>
              <line x1="3" y1="12" x2="3.01" y2="12"></line>
              <line x1="3" y1="18" x2="3.01" y2="18"></line>
            </svg>
            Tables
          </button>
        </div>
      </div>
    </div>
    
    <!-- Loading State -->
    <div v-if="loading" class="dashboard-loading">
      <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="loading-icon">
        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path>
      </svg>
      <p>Loading dashboard data...</p>
    </div>
    
    <!-- Error State -->
    <div v-else-if="error" class="dashboard-error">
      <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
      <h3>Something went wrong</h3>
      <p>{{ error }}</p>
      <button @click="fetchDashboardData" class="btn btn-primary">Try Again</button>
    </div>
    
    <!-- No Data State -->
    <div v-else-if="noData" class="dashboard-empty">
      <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="8" y1="12" x2="16" y2="12"></line>
      </svg>
      <h3>No click data available</h3>
      <p>Share your shortened URLs to start collecting statistics.</p>
      <router-link to="/" class="btn btn-primary">Create Short URLs</router-link>
    </div>
    
    <!-- Dashboard Content -->
    <div v-else class="dashboard-content">
      <!-- Summary Stats Cards -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-header">
            <h3>Total Clicks</h3>
            <div class="stat-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                <polyline points="15 3 21 3 21 9"></polyline>
                <line x1="10" y1="14" x2="21" y2="3"></line>
              </svg>
            </div>
          </div>
          <p class="stat-value">{{ dashboardData.totalClicks }}</p>
          <p class="stat-subtitle">All time clicks</p>
        </div>
        
        <div class="stat-card">
          <div class="stat-header">
            <h3>Unique Devices</h3>
            <div class="stat-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
                <line x1="12" y1="18" x2="12.01" y2="18"></line>
              </svg>
            </div>
          </div>
          <p class="stat-value">{{ uniqueDevices }}</p>
          <p class="stat-subtitle">Different devices</p>
        </div>
        
        <div class="stat-card">
          <div class="stat-header">
            <h3>Unique Browsers</h3>
            <div class="stat-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="2" y1="12" x2="22" y2="12"></line>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
              </svg>
            </div>
          </div>
          <p class="stat-value">{{ uniqueBrowsers }}</p>
          <p class="stat-subtitle">Browser count</p>
        </div>
        
        <div class="stat-card">
          <div class="stat-header">
            <h3>Peak Day</h3>
            <div class="stat-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
            </div>
          </div>
          <p class="stat-value">{{ peakDay.date }}</p>
          <p class="stat-subtitle">{{ peakDay.count }} clicks</p>
        </div>
      </div>
      
      <!-- Charts View -->
      <div v-if="viewType === 'charts'" class="chart-grid">
        <!-- Time Series Chart -->
        <div class="chart-box full-width">
          <div class="chart-header">
            <h3>Clicks Over Time</h3>
            <span class="chart-period">Last 30 days</span>
          </div>
          <line-chart 
            :chart-data="dashboardData.clicksOverTime" 
            title="Clicks Over Time"
          />
        </div>
        
        <!-- Device Types Chart -->
        <div class="chart-box">
          <div class="chart-header">
            <h3>Device Types</h3>
          </div>
          <pie-chart 
            :chart-data="dashboardData.deviceTypes" 
            title="Clicks by Device Type"
            label-field="DeviceType"
            value-field="Count"
          />
        </div>
        
        <!-- Browsers Chart -->
        <div class="chart-box">
          <div class="chart-header">
            <h3>Browsers</h3>
          </div>
          <pie-chart 
            :chart-data="dashboardData.browsers" 
            title="Clicks by Browser"
            label-field="Browser"
            value-field="Count"
          />
        </div>
        
        <!-- Languages Chart -->
        <div class="chart-box">
          <div class="chart-header">
            <h3>Languages</h3>
          </div>
          <pie-chart 
            :chart-data="dashboardData.languages" 
            title="Clicks by Language"
            label-field="Language"
            value-field="Count"
          />
        </div>
        
        <!-- Operating Systems Chart -->
        <div class="chart-box">
          <div class="chart-header">
            <h3>Operating Systems</h3>
          </div>
          <pie-chart 
            :chart-data="dashboardData.operatingSystems" 
            title="Clicks by OS"
            label-field="OS"
            value-field="Count"
          />
        </div>
      </div>
      
      <!-- Tables View -->
      <div v-else-if="viewType === 'tables'" class="table-grid">
        <!-- Time Series Table -->
        <div class="table-box full-width">
          <div class="table-header">
            <h3>Clicks Over Time</h3>
            <span class="table-period">Last 30 days</span>
          </div>
          <tabular-view
            :chart-data="dashboardData.clicksOverTime"
            title="Clicks Over Time"
            label-field="Date"
            label-header="Date"
            value-field="Count"
            value-header="Clicks"
          />
        </div>
        
        <!-- Device Types Table -->
        <div class="table-box">
          <div class="table-header">
            <h3>Device Types</h3>
          </div>
          <tabular-view
            :chart-data="dashboardData.deviceTypes"
            title="Clicks by Device Type"
            label-field="DeviceType"
            label-header="Device Type"
            value-field="Count"
            value-header="Clicks"
          />
        </div>
        
        <!-- Browsers Table -->
        <div class="table-box">
          <div class="table-header">
            <h3>Browsers</h3>
          </div>
          <tabular-view
            :chart-data="dashboardData.browsers"
            title="Clicks by Browser"
            label-field="Browser"
            label-header="Browser"
            value-field="Count"
            value-header="Clicks"
          />
        </div>
        
        <!-- Languages Table -->
        <div class="table-box">
          <div class="table-header">
            <h3>Languages</h3>
          </div>
          <tabular-view
            :chart-data="dashboardData.languages"
            title="Clicks by Language"
            label-field="Language"
            label-header="Language"
            value-field="Count"
            value-header="Clicks"
          />
        </div>
        
        <!-- Operating Systems Table -->
        <div class="table-box">
          <div class="table-header">
            <h3>Operating Systems</h3>
          </div>
          <tabular-view
            :chart-data="dashboardData.operatingSystems"
            title="Clicks by Operating System"
            label-field="OS"
            label-header="Operating System"
            value-field="Count"
            value-header="Clicks"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import LineChart from './charts/LineChart.vue';
import PieChart from './charts/PieChart.vue';
import TabularView from './charts/TabularView.vue';
import { mapGetters } from 'vuex';
import exportApis from '@/services/api/exportApis';

export default {
  name: 'Dashboard',
  components: {
    LineChart,
    PieChart,
    TabularView
  },
  data() {
    return {
      loading: true,
      error: null,
      selectedUrlId: '',
      viewType: 'charts', // default view is charts
      urls: [],
      dashboardData: {
        totalClicks: 0,
        clicksOverTime: [],
        deviceTypes: [],
        browsers: [],
        languages: [],
        operatingSystems: []
      },
      uniqueDevices: 0,
      uniqueBrowsers: 0,
      peakDay: {
        date: '',
        count: 0
      }
    };
  },
  computed: {
    ...mapGetters(['isAuthenticated']),
    noData() {
      return this.dashboardData.totalClicks === 0;
    }
  },
  created() {
    if (this.isAuthenticated) {
      this.fetchUrls();
    }
  },
  methods: {
    async fetchUrls() {
      try {
        const urls = await exportApis.urls.getAllUrls();
        this.urls = urls;
        this.fetchDashboardData();
      } catch (error) {
        console.error('Error fetching URLs:', error);
        this.error = 'Failed to load URLs. Please try again later.';
        this.loading = false;
      }
    },
    
    async fetchDashboardData() {
      try {
        this.loading = true;
        this.error = null;
        
        const response = await exportApis.urls.getDashboardStats(this.selectedUrlId || null);
        
        this.dashboardData = {
          totalClicks: response.totalClicks || 0,
          clicksOverTime: response.clicksOverTime || [],
          deviceTypes: response.deviceTypes || [],
          browsers: response.browsers || [],
          languages: response.languages || [],
          operatingSystems: response.operatingSystems || []
        };
        
        this.uniqueDevices = response.uniqueDevices || 0;
        this.uniqueBrowsers = response.uniqueBrowsers || 0;
        this.peakDay = response.peakDay || { date: '', count: 0 };
        
        this.loading = false;
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        this.error = 'Failed to load dashboard data. Please try again later.';
        this.loading = false;
      }
    }
  },
  filters: {
    truncate(value, length) {
      if (!value) return '';
      if (value.length <= length) return value;
      return value.slice(0, length) + '...';
    }
  }
};
</script>

<style scoped>
.dashboard-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.5rem;
}

.dashboard-header {
  text-align: center;
  margin-bottom: 2rem;
}

.dashboard-subtitle {
  color: var(--gray);
  margin-top: 0.5rem;
}

.control-panel {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 1.5rem;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background-color: white;
  border-radius: var(--rounded-lg);
  box-shadow: var(--shadow);
}

.url-selector {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--gray-light);
  border-radius: var(--rounded);
  font-size: 1rem;
  color: var(--dark);
  background-color: white;
}

.view-type-selector {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.toggle-buttons {
  display: flex;
  border: 1px solid var(--gray-light);
  border-radius: var(--rounded);
  overflow: hidden;
}

.toggle-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background-color: white;
  border: none;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.toggle-btn:not(:last-child) {
  border-right: 1px solid var(--gray-light);
}

.toggle-btn.active {
  background-color: var(--primary);
  color: white;
}

.dashboard-loading,
.dashboard-error,
.dashboard-empty {
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

.dashboard-loading svg,
.dashboard-error svg,
.dashboard-empty svg {
  margin-bottom: 1.5rem;
  color: var(--gray);
}

.dashboard-error h3,
.dashboard-empty h3 {
  margin-bottom: 0.5rem;
  color: var(--dark);
}

.dashboard-error p,
.dashboard-empty p {
  color: var(--gray);
  margin-bottom: 1.5rem;
}

.loading-icon {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
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

/* Chart Grid */
.chart-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 1.5rem;
}

.chart-box {
  background-color: white;
  border-radius: var(--rounded-lg);
  box-shadow: var(--shadow);
  padding: 1.5rem;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.chart-header h3 {
  font-size: 1.25rem;
  margin: 0;
}

.chart-period {
  font-size: 0.875rem;
  color: var(--gray);
}

.full-width {
  grid-column: 1 / -1;
}

/* Table Grid */
.table-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 1.5rem;
}

.table-box {
  background-color: white;
  border-radius: var(--rounded-lg);
  box-shadow: var(--shadow);
  padding: 1.5rem;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.table-header h3 {
  font-size: 1.25rem;
  margin: 0;
}

.table-period {
  font-size: 0.875rem;
  color: var(--gray);
}

@media (max-width: 768px) {
  .control-panel {
    grid-template-columns: 1fr;
  }
  
  .chart-grid,
  .table-grid,
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>