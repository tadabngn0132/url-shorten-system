<template>
  <div class="dashboard">
    <h1>Analytics Dashboard</h1>
    
    <!-- Control Panel -->
    <div class="control-panel">
      <!-- URL Selector -->
      <div class="url-selector">
        <label for="url-select">Select URL:</label>
        <select id="url-select" v-model="selectedUrlId" @change="fetchDashboardData">
          <option value="">All URLs</option>
          <option v-for="url in urls" :key="url.id" :value="url.id">
            {{ url.shortCode }} ({{ url.originalUrl | truncate(30) }})
          </option>
        </select>
      </div>
      
      <!-- View Type Selector -->
      <div class="view-type-selector">
        <label>View Type:</label>
        <div class="toggle-buttons">
          <button 
            :class="['toggle-btn', { active: viewType === 'charts' }]" 
            @click="viewType = 'charts'"
          >
            Charts
          </button>
          <button 
            :class="['toggle-btn', { active: viewType === 'tables' }]" 
            @click="viewType = 'tables'"
          >
            Tables
          </button>
        </div>
      </div>
    </div>
    
    <!-- Loading State -->
    <div v-if="loading" class="loading">
      <p>Loading dashboard data...</p>
    </div>
    
    <!-- Error State -->
    <div v-else-if="error" class="error">
      <p>{{ error }}</p>
    </div>
    
    <!-- No Data State -->
    <div v-else-if="noData" class="no-data">
      <p>No click data available for the selected URL(s).</p>
      <p>Share your shortened URLs to start collecting statistics.</p>
    </div>
    
    <!-- Dashboard Content -->
    <div v-else class="dashboard-content">
      <!-- Summary Stats Cards -->
      <div class="stats-cards">
        <div class="stat-card">
          <h3>Total Clicks</h3>
          <p class="stat-number">{{ dashboardData.totalClicks }}</p>
        </div>
        
        <div class="stat-card">
          <h3>Unique Devices</h3>
          <p class="stat-number">{{ uniqueDevices }}</p>
        </div>
        
        <div class="stat-card">
          <h3>Unique Browsers</h3>
          <p class="stat-number">{{ uniqueBrowsers }}</p>
        </div>
        
        <div class="stat-card">
          <h3>Peak Day</h3>
          <p class="stat-number">{{ peakDay.date }}</p>
          <p class="stat-subtext">{{ peakDay.count }} clicks</p>
        </div>
      </div>
      
      <!-- Charts View -->
      <div v-if="viewType === 'charts'" class="charts-grid">
        <!-- Time Series Chart -->
        <div class="chart-box full-width">
          <line-chart 
            :chart-data="dashboardData.clicksOverTime" 
            title="Clicks Over Time (Last 30 Days)"
          />
        </div>
        
        <!-- Device Types Chart -->
        <div class="chart-box">
          <pie-chart 
            :chart-data="dashboardData.deviceTypes" 
            title="Clicks by Device Type"
            label-field="DeviceType"
            value-field="Count"
          />
        </div>
        
        <!-- Browsers Chart -->
        <div class="chart-box">
          <pie-chart 
            :chart-data="dashboardData.browsers" 
            title="Clicks by Browser"
            label-field="Browser"
            value-field="Count"
          />
        </div>
        
        <!-- Languages Chart -->
        <div class="chart-box">
          <pie-chart 
            :chart-data="dashboardData.languages" 
            title="Clicks by Language"
            label-field="Language"
            value-field="Count"
          />
        </div>
        
        <!-- Operating Systems Chart -->
        <div class="chart-box">
          <pie-chart 
            :chart-data="dashboardData.operatingSystems" 
            title="Clicks by Operating System"
            label-field="OS"
            value-field="Count"
          />
        </div>
      </div>
      
      <!-- Tables View -->
      <div v-else-if="viewType === 'tables'" class="tables-container">
        <!-- Time Series Table -->
        <div class="table-box full-width">
          <tabular-view
            :chart-data="dashboardData.clicksOverTime"
            title="Clicks Over Time (Last 30 Days)"
            label-field="Date"
            label-header="Date"
            value-field="Count"
            value-header="Clicks"
          />
        </div>
        
        <!-- Device Types Table -->
        <div class="table-box">
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
.dashboard {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  color: #2c3e50;
  margin-bottom: 30px;
  text-align: center;
}

.control-panel {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  background-color: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.url-selector {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.url-selector label {
  margin-right: 10px;
  font-weight: bold;
}

.url-selector select {
  padding: 8px 12px;
  border-radius: 4px;
  border: 1px solid #ddd;
  min-width: 300px;
  font-size: 14px;
}

.view-type-selector {
  display: flex;
  align-items: center;
}

.view-type-selector label {
  margin-right: 10px;
  font-weight: bold;
}

.toggle-buttons {
  display: flex;
}

.toggle-btn {
  padding: 8px 15px;
  background-color: #e9ecef;
  border: 1px solid #ddd;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
}

.toggle-btn:first-child {
  border-top-left-radius: 4px;
  border-bottom-left-radius: 4px;
}

.toggle-btn:last-child {
  border-top-right-radius: 4px;
  border-bottom-right-radius: 4px;
}

.toggle-btn.active {
  background-color: #42b983;
  color: white;
  border-color: #42b983;
}

.loading, .error, .no-data {
  text-align: center;
  padding: 50px 0;
  color: #666;
}

.error {
  color: #e74c3c;
}

.stats-cards {
  display: flex;
  justify-content: space-around;
  margin-bottom: 30px;
  flex-wrap: wrap;
}

.stat-card {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 20px;
  text-align: center;
  min-width: 200px;
  margin-bottom: 20px;
}

.stat-card h3 {
  margin: 0 0 10px 0;
  color: #2c3e50;
  font-size: 16px;
}

.stat-number {
  font-size: 30px;
  font-weight: bold;
  color: #42b983;
  margin: 0;
}

.stat-subtext {
  font-size: 14px;
  color: #666;
  margin-top: 5px;
}

.charts-grid, .tables-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
  gap: 20px;
}

.chart-box, .table-box {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-bottom: 20px;
}

.full-width {
  grid-column: 1 / -1;
}

@media (max-width: 768px) {
  .control-panel {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .url-selector, .view-type-selector {
    width: 100%;
    margin-bottom: 15px;
  }
  
  .charts-grid, .tables-container {
    grid-template-columns: 1fr;
  }
  
  .chart-box, .table-box {
    width: 100%;
  }
}
</style>