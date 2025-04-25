<template>
  <div class="chart-container">
    <canvas ref="lineChart"></canvas>
  </div>
</template>

<script>
import { Chart, registerables } from 'chart.js';
// Đăng ký tất cả các thành phần của Chart.js
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
            fill: false,
            borderColor: '#42b983',
            tension: 0.1,
            backgroundColor: 'rgba(66, 185, 131, 0.2)'
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
              position: 'top'
            },
            tooltip: {
              mode: 'index',
              intersect: false
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Clicks'
              }
            },
            x: {
              title: {
                display: true,
                text: 'Date'
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