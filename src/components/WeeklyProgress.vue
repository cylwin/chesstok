<script setup lang="ts">
import { ref, computed } from 'vue'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

interface ProgressData {
  name: string
  elo: number
  color: string
  data: number[]
}

// Define day keys for type safety
type DayKey = 'T' | 'W' | 'Th' | 'F' | 'S' | 'Su' | 'M'

// Interface for chart data
interface ChartDataItem {
  name: string
  color: string
  T: number
  W: number
  Th: number
  F: number
  S: number
  Su: number
  M: number
}

// Sample data for the chart
const chartData = ref<ChartDataItem[]>([
  {
    name: 'Your Elo',
    color: '#4f46e5',
    T: 0,
    W: 0,
    Th: 650,
    F: 30,
    S: 30,
    Su: 500,
    M: 180,
  },
])

// For display in header
const progressData = ref<ProgressData[]>([
  {
    name: 'Your Elo',
    elo: 1393,
    color: '#4f46e5',
    data: [0, 0, 650, 30, 30, 500, 180],
  },
])

const days: DayKey[] = ['T', 'W', 'Th', 'F', 'S', 'Su', 'M']

// Chart.js configuration
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
      beginAtZero: true,
      max: 1200,
      grid: {
        color: '#e5e7eb', // Tailwind gray-200
      },
      ticks: {
        stepSize: 300, // To get approximately 4 ticks
      },
    },
    x: {
      grid: {
        display: false,
      },
    },
  },
  plugins: {
    legend: {
      display: false,
    },
  },
  elements: {
    line: {
      tension: 0, // Straight lines (linear)
    },
    point: {
      radius: 3,
    },
  },
}

// Prepare chart.js data format
const chartjsData = computed(() => {
  return {
    labels: days,
    datasets: chartData.value.map((user) => ({
      label: user.name,
      data: days.map((day) => user[day]),
      borderColor: user.color,
      backgroundColor: user.color,
      borderWidth: 2,
      pointBackgroundColor: user.color,
    })),
  }
})
</script>

<template>
  <h2 class="text-xl font-bold text-slate-700">Weekly Progress</h2>

  <div class="weekly-progress rounded-xl mt-2 border border-amber-200 bg-white p-4 shadow-sm">
    <!-- User ELO Header -->
    <div class="mb-6">
      <div v-for="user in progressData" :key="user.name" class="flex items-center mb-1">
        <div class="w-3 h-3 rounded-full mr-2" :style="{ backgroundColor: user.color }"></div>
        <span class="text-base font-medium" :style="{ color: user.color }">{{ user.name }}</span>
        <span class="ml-auto text-base font-medium" :style="{ color: user.color }"
          >{{ user.elo }} Elo</span
        >
      </div>
    </div>

    <!-- Chart Container using vue-chartjs -->
    <div class="h-48 mt-4 mb-6">
      <Line :data="chartjsData" :options="chartOptions" />
    </div>
  </div>
</template>

<style scoped>
.weekly-progress {
  position: relative;
  overflow: hidden;
  background: linear-gradient(to bottom, rgba(255, 255, 255, 1) 0%, rgba(255, 250, 240, 0.8) 100%);
}
</style>
