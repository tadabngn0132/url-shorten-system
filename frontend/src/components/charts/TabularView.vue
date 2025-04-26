<template>
  <div class="tabular-view">
    <h3 class="tabular-title">{{ title }}</h3>
    <div class="table-responsive">
      <table class="data-table">
        <thead>
          <tr>
            <th>{{ labelHeader }}</th>
            <th>{{ valueHeader }}</th>
            <th>Percentage</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in processedData" :key="index" :class="{'highlight-row': index === 0}">
            <td>
              <div class="label-cell">
                <span 
                  class="color-indicator" 
                  :style="{ backgroundColor: getColor(index) }"
                ></span>
                {{ item.label }}
              </div>
            </td>
            <td>{{ item.value }}</td>
            <td>
              <div class="percentage-cell">
                <div class="percentage-bar-container">
                  <div 
                    class="percentage-bar" 
                    :style="{ 
                      width: `${item.percentage}%`,
                      backgroundColor: getColor(index)
                    }"
                  ></div>
                </div>
                <span class="percentage-text">{{ item.percentage }}%</span>
              </div>
            </td>
          </tr>
        </tbody>
        <tfoot v-if="showTotal">
          <tr class="total-row">
            <td><strong>Total</strong></td>
            <td><strong>{{ totalValue }}</strong></td>
            <td><strong>100%</strong></td>
          </tr>
        </tfoot>
      </table>
    </div>
    <div v-if="noData" class="no-data-message">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="8" y1="12" x2="16" y2="12"></line>
      </svg>
      <span>No data available</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TabularView',
  props: {
    chartData: {
      type: Array,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    labelField: {
      type: String,
      default: 'label'
    },
    valueField: {
      type: String,
      default: 'count'
    },
    labelHeader: {
      type: String,
      default: 'Label'
    },
    valueHeader: {
      type: String,
      default: 'Count'
    },
    showTotal: {
      type: Boolean,
      default: true
    },
    colorPalette: {
      type: Array,
      default: () => [
        '#3b82f6', // Blue (Primary)
        '#10b981', // Emerald (Secondary)
        '#8b5cf6', // Violet
        '#f97316', // Orange
        '#ec4899', // Pink
        '#14b8a6', // Teal
        '#eab308', // Yellow
        '#6366f1', // Indigo
        '#a855f7', // Purple
        '#ef4444'  // Red
      ]
    }
  },
  computed: {
    processedData() {
      if (!this.chartData || this.chartData.length === 0) {
        return [];
      }

      // Calculate total
      const total = this.chartData.reduce((sum, item) => {
        const value = this.getValue(item);
        return sum + value;
      }, 0);

      // Process each data item
      return this.chartData
        .map(item => {
          const label = this.getLabel(item);
          const value = this.getValue(item);
          const percentage = total > 0 ? Math.round((value / total) * 100) : 0;

          return {
            label: label || 'Unknown',
            value,
            percentage
          };
        })
        // Sort by value in descending order
        .sort((a, b) => b.value - a.value);
    },
    totalValue() {
      return this.processedData.reduce((sum, item) => sum + item.value, 0);
    },
    noData() {
      return this.processedData.length === 0 || this.totalValue === 0;
    }
  },
  methods: {
    getLabel(item) {
      // Try to find the label field directly
      if (item[this.labelField] !== undefined) {
        return item[this.labelField];
      }

      // Try to find a key that contains the labelField (case insensitive)
      const keys = Object.keys(item);
      const matchingKey = keys.find(key => 
        key.toLowerCase().includes(this.labelField.toLowerCase())
      );
      
      if (matchingKey) {
        return item[matchingKey];
      }
      
      // Fallback to the first key that's not the value field
      const firstNonValueKey = keys.find(key => key.toLowerCase() !== this.valueField.toLowerCase());
      return firstNonValueKey ? item[firstNonValueKey] : 'Unknown';
    },
    
    getValue(item) {
      // Try to find the value field directly
      if (item[this.valueField] !== undefined) {
        return item[this.valueField];
      }
      
      // Try to find a key that contains 'count' (case insensitive)
      const keys = Object.keys(item);
      const matchingKey = keys.find(key => 
        key.toLowerCase().includes('count')
      );
      
      return matchingKey ? item[matchingKey] : 0;
    },
    
    getColor(index) {
      return this.colorPalette[index % this.colorPalette.length];
    }
  }
};
</script>

<style scoped>
.tabular-view {
  width: 100%;
  margin-bottom: 1.5rem;
}

.tabular-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: var(--dark);
}

.table-responsive {
  overflow-x: auto;
  max-height: 350px;
  overflow-y: auto;
  border-radius: var(--rounded);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  border-radius: var(--rounded);
  overflow: hidden;
  font-size: 0.875rem;
}

.data-table th {
  background-color: #f8fafc;
  color: var(--gray);
  font-weight: 600;
  text-align: left;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--gray-light);
  position: sticky;
  top: 0;
  z-index: 10;
}

.data-table td {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--gray-light);
  color: var(--dark);
}

.data-table tbody tr:last-child td {
  border-bottom: none;
}

.data-table tbody tr:hover {
  background-color: rgba(59, 130, 246, 0.05);
}

.highlight-row {
  background-color: rgba(59, 130, 246, 0.05);
  font-weight: 500;
}

.label-cell {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.color-indicator {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
}

.percentage-cell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.percentage-bar-container {
  flex: 1;
  height: 8px;
  background-color: #f1f5f9;
  border-radius: 4px;
  overflow: hidden;
}

.percentage-bar {
  height: 100%;
  border-radius: 4px;
  min-width: 2px;
  transition: width 0.6s ease;
}

.percentage-text {
  min-width: 45px;
  text-align: right;
  font-size: 0.875rem;
  color: var(--gray);
}

.total-row {
  background-color: #f8fafc;
}

.total-row td {
  border-top: 2px solid var(--gray-light);
  color: var(--dark);
}

.no-data-message {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 2rem;
  color: var(--gray);
  background-color: #f9fafb;
  border-radius: var(--rounded);
  margin-top: 1rem;
}

@media (max-width: 640px) {
  .percentage-bar-container {
    max-width: 100px;
  }
  
  .data-table th, 
  .data-table td {
    padding: 0.75rem 0.5rem;
  }
}
</style>