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

      // Create background colors with opacity for hover
      const hoverColors = colors.map(color => {
        return this.adjustColorOpacity(color, 0.8);
      });

      this.chart = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: labels,
          datasets: [{
            data: data,
            backgroundColor: colors,
            hoverBackgroundColor: hoverColors,
            borderColor: 'white',
            borderWidth: 2,
            hoverBorderWidth: 3,
            hoverBorderColor: 'white',
            borderRadius: 4,
            spacing: 2,
            hoverOffset: 8
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          layout: {
            padding: {
              top: 5,
              bottom: 5,
              left: 5,
              right: 5
            }
          },
          plugins: {
            title: {
              display: true,
              text: this.title,
              font: {
                size: 16,
                weight: 'bold',
                family: "'Avenir', 'Helvetica', 'Arial', sans-serif"
              },
              padding: {
                top: 10,
                bottom: 20
              },
              color: '#1e293b' // Dark slate
            },
            legend: {
              display: true,
              position: 'right',
              align: 'center',
              labels: {
                boxWidth: 15,
                boxHeight: 15,
                padding: 15,
                usePointStyle: true,
                pointStyle: 'circle',
                font: {
                  family: "'Avenir', 'Helvetica', 'Arial', sans-serif",
                  size: 12
                },
                color: '#64748b', // Gray
                filter: (legendItem, data) => {
                  // Hide legend items with no data or very small values
                  const value = data.datasets[0].data[legendItem.index];
                  return value > 0;
                },
                generateLabels: (chart) => {
                  const data = chart.data;
                  if (data.labels.length && data.datasets.length) {
                    const {labels: {pointStyle}} = chart.legend.options;
                    
                    return data.labels.map((label, i) => {
                      const value = data.datasets[0].data[i];
                      const total = data.datasets[0].data.reduce((a, b) => a + b, 0);
                      const percentage = Math.round((value / total) * 100);
                      
                      // Only include in legend if value > 0
                      if (value <= 0) return null;
                      
                      return {
                        text: `${label} (${percentage}%)`,
                        fillStyle: data.datasets[0].backgroundColor[i],
                        strokeStyle: data.datasets[0].borderColor,
                        lineWidth: data.datasets[0].borderWidth,
                        pointStyle: pointStyle,
                        hidden: !chart.getDataVisibility(i),
                        index: i
                      };
                    }).filter(item => item !== null);
                  }
                  return [];
                }
              },
              onClick: function(e, legendItem, legend) {
                const index = legendItem.index;
                const chart = legend.chart;
                chart.toggleDataVisibility(index);
                chart.update();
              }
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
              },
              backgroundColor: 'rgba(17, 24, 39, 0.8)',
              titleFont: {
                family: "'Avenir', 'Helvetica', 'Arial', sans-serif",
                size: 13,
                weight: 'bold'
              },
              bodyFont: {
                family: "'Avenir', 'Helvetica', 'Arial', sans-serif",
                size: 12
              },
              padding: 12,
              cornerRadius: 6,
              displayColors: true,
              usePointStyle: true,
              caretSize: 6
            }
          },
          animation: {
            animateRotate: true,
            animateScale: true,
            duration: 1000,
            easing: 'easeOutQuart'
          },
          cutout: '60%', // Slightly reduced from 65% for better visibility
          radius: '90%'  // Increased from 85% for larger chart
        }
      });
    },
    
    // Helper function to adjust color opacity
    adjustColorOpacity(color, opacity) {
      // Handle different color formats
      
      // If color is in hex format (#RRGGBB)
      if (color.startsWith('#')) {
        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${opacity})`;
      }
      
      // If color is already in rgba format
      if (color.startsWith('rgba')) {
        return color.replace(/rgba\((.+),\s*[\d.]+\)/, `rgba($1, ${opacity})`);
      }
      
      // If color is in rgb format
      if (color.startsWith('rgb')) {
        return color.replace('rgb', 'rgba').replace(')', `, ${opacity})`);
      }
      
      // Default fallback - return original color
      return color;
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
  height: 350px; /* Increased from 350px */
  width: 100%;
  margin-bottom: 20px;
  padding: 10px;
  border-radius: var(--rounded);
  background-color: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: box-shadow 0.3s ease;
}

.chart-container:hover {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

@media (max-width: 768px) {
  .chart-container {
    height: 400px; /* Increased from 300px */
  }
}
</style>