<template>
  <div class="chart-container">
    <canvas ref="pieChart"></canvas>
  </div>
</template>

<script>
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

export default {
  name: 'PieChart',
  props: {
    chartData: {
      type: Array,
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
    title: {
      type: String,
      default: 'Distribution'
    },
    backgroundColors: {
      type: Array,
      default: () => [
        '#42b983', // Primary color (Vue green)
        '#2c3e50', // Dark blue
        '#f39c12', // Orange
        '#3498db', // Blue
        '#e74c3c', // Red
        '#9b59b6', // Purple
        '#1abc9c', // Turquoise
        '#f1c40f', // Yellow
        '#34495e', // Dark gray
        '#95a5a6'  // Light gray
      ]
    }
  },
  data() {
    return {
      chart: null
    };
  },
  watch: {
    chartData: {
      handler() {
        this.renderChart();
      },
      deep: true
    }
  },
  mounted() {
    this.renderChart();
  },
  methods: {
    renderChart() {
      if (this.chart) {
        this.chart.destroy();
      }

      const ctx = this.$refs.pieChart.getContext('2d');
      
      // Handle different data structures based on props
      const getLabelValue = (item) => {
        // Dynamically access the property based on labelField
        // For example, for browser data, item[Browser] would give the browser name
        const keys = Object.keys(item);
        let label = '';
        
        // Try to find the label field directly
        if (item[this.labelField]) {
          label = item[this.labelField];
        } 
        // Try to find a key that contains the labelField (case insensitive)
        else {
          const matchingKey = keys.find(key => 
            key.toLowerCase().includes(this.labelField.toLowerCase())
          );
          if (matchingKey) {
            label = item[matchingKey];
          } else {
            // Fallback to the first key that's not the count field
            const firstNonCountKey = keys.find(key => key !== this.valueField);
            if (firstNonCountKey) {
              label = item[firstNonCountKey];
            }
          }
        }
        
        // Same for value field
        let value = item[this.valueField];
        if (value === undefined) {
          const matchingKey = keys.find(key => 
            key.toLowerCase().includes('count')
          );
          if (matchingKey) {
            value = item[matchingKey];
          }
        }
        
        return { label, value };
      };

      const processedData = this.chartData.map(getLabelValue);
      
      const labels = processedData.map(item => item.label || 'Unknown');
      const data = processedData.map(item => item.value || 0);
      
      // Create enough colors by repeating the backgroundColors array if needed
      const colors = [];
      for (let i = 0; i < labels.length; i++) {
        colors.push(this.backgroundColors[i % this.backgroundColors.length]);
      }

      this.chart = new Chart(ctx, {
        type: 'pie',
        data: {
          labels: labels,
          datasets: [{
            data: data,
            backgroundColor: colors,
            hoverOffset: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: this.title,
              font: {
                size: 16
              }
            },
            legend: {
              display: true,
              position: 'right'
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const label = context.label || '';
                  const value = context.raw || 0;
                  const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                  const percentage = Math.round((value / total) * 100);
                  return `${label}: ${value} (${percentage}%)`;
                }
              }
            }
          }
        }
      });
    }
  },
  beforeUnmount() {
    if (this.chart) {
      this.chart.destroy();
    }
  }
};
</script>

<style scoped>
.chart-container {
  position: relative;
  height: 300px;
  width: 100%;
  margin-bottom: 20px;
}
</style>