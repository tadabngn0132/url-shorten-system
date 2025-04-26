<template>
  <div class="chart-container">
    <canvas ref="lineChart"></canvas>
  </div>
</template>

<script>
import { Chart, registerables } from 'chart.js';
// Register all Chart.js components
Chart.register(...registerables);

export default {
  name: 'LineChart',
  props: {
    chartData: {
      type: Array,
      required: true
    },
    title: {
      type: String,
      default: 'Clicks Over Time'
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

      const ctx = this.$refs.lineChart.getContext('2d');
      
      // Format data for chart.js
      const labels = this.chartData.map(item => {
        const date = new Date(item.date);
        return date.toLocaleDateString();
      });
      
      const data = this.chartData.map(item => item.count);

      this.chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            label: 'Number of Clicks',
            data: data,
            fill: true,
            borderColor: '#3b82f6', // Blue
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            tension: 0.4,
            borderWidth: 3,
            pointBackgroundColor: '#3b82f6',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6,
            pointHoverBackgroundColor: '#3b82f6',
            pointHoverBorderColor: '#fff',
            pointHoverBorderWidth: 2
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
              position: 'top',
              labels: {
                font: {
                  family: "'Avenir', 'Helvetica', 'Arial', sans-serif",
                  size: 12
                },
                boxWidth: 12,
                padding: 15,
                usePointStyle: true,
                pointStyle: 'circle'
              }
            },
            tooltip: {
              mode: 'index',
              intersect: false,
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
              callbacks: {
                label: function(context) {
                  return `Clicks: ${context.parsed.y}`;
                }
              }
            },
            filler: {
              propagate: false
            }
          },
          hover: {
            mode: 'index',
            intersect: false
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                color: 'rgba(148, 163, 184, 0.1)',
                lineWidth: 1
              },
              border: {
                dash: [2, 4]
              },
              ticks: {
                font: {
                  family: "'Avenir', 'Helvetica', 'Arial', sans-serif",
                  size: 11
                },
                color: '#64748b', // Gray
                padding: 8,
                callback: function(value) {
                  return value + (value === 1 ? ' click' : ' clicks');
                }
              },
              title: {
                display: true,
                text: 'Clicks',
                font: {
                  family: "'Avenir', 'Helvetica', 'Arial', sans-serif",
                  size: 13,
                  weight: 'normal'
                },
                color: '#64748b', // Gray
                padding: {
                  bottom: 10
                }
              }
            },
            x: {
              grid: {
                color: 'rgba(148, 163, 184, 0.1)',
                display: false
              },
              ticks: {
                font: {
                  family: "'Avenir', 'Helvetica', 'Arial', sans-serif",
                  size: 11
                },
                color: '#64748b', // Gray
                padding: 8,
                maxRotation: 45,
                minRotation: 45
              },
              title: {
                display: true,
                text: 'Date',
                font: {
                  family: "'Avenir', 'Helvetica', 'Arial', sans-serif",
                  size: 13,
                  weight: 'normal'
                },
                color: '#64748b', // Gray
                padding: {
                  top: 10
                }
              }
            }
          },
          elements: {
            line: {
              tension: 0.4
            }
          },
          animation: {
            duration: 1000,
            easing: 'easeOutQuart'
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
  height: 450px; /* Increased from 350px */
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