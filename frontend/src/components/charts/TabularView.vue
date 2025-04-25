<template>
  <div class="tabular-view">
    <h3>{{ title }}</h3>
    <table class="data-table">
      <thead>
        <tr>
          <th>{{ labelHeader }}</th>
          <th>{{ valueHeader }}</th>
          <th>Percentage</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, index) in processedData" :key="index">
          <td>{{ item.label }}</td>
          <td>{{ item.value }}</td>
          <td>{{ item.percentage }}%</td>
        </tr>
      </tbody>
    </table>
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
      return this.chartData.map(item => {
        const label = this.getLabel(item);
        const value = this.getValue(item);
        const percentage = total > 0 ? Math.round((value / total) * 100) : 0;

        return {
          label: label || 'Unknown',
          value,
          percentage
        };
      });
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
    }
  }
};
</script>

<style scoped>
.tabular-view {
  margin-bottom: 30px;
}

h3 {
  margin-bottom: 15px;
  color: #2c3e50;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  border-radius: 8px;
  overflow: hidden;
}

.data-table th, 
.data-table td {
  padding: 12px 15px;
  text-align: left;
}

.data-table th {
  background-color: #42b983;
  color: white;
  font-weight: 600;
}

.data-table tr:nth-child(even) {
  background-color: #f8f8f8;
}

.data-table tr:hover {
  background-color: #f1f1f1;
}
</style>