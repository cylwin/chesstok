<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
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
import dayjs from 'dayjs'
import { supabase } from '@/services/supabase'
import { useUserStore } from '@/stores/user'
// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

async function getUserEloHistory() {
  // Get the date 7 days ago
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  // Query puzzle attempts for the last 7 days
  const { data, error } = await supabase
    .from('puzzle_attempts')
    .select('created_at, new_elo')
    .gte('created_at', sevenDaysAgo.toISOString())

  if (error) {
    console.error('Error fetching elo history:', error)
    return []
  }

  if (!data || data.length === 0) {
    return []
  }

  // Group data by day
  const groupedByDay = data.reduce(
    (acc: Record<string, { min: number; max: number; count: number }>, item) => {
      // Extract date part only from created_at
      const day = new Date(item.created_at).toISOString().split('T')[0]

      if (!acc[day]) {
        acc[day] = {
          min: Infinity,
          max: -Infinity,
          count: 0,
        }
      }

      // Update min and max elo for the day
      acc[day].min = Math.min(acc[day].min, item.new_elo)
      acc[day].max = Math.max(acc[day].max, item.new_elo)
      acc[day].count += 1

      return acc
    },
    {},
  )

  // Convert to array format
  return Object.entries(groupedByDay).map(([date, stats]) => ({
    date,
    min_elo: stats.min === Infinity ? null : stats.min,
    max_elo: stats.max === -Infinity ? null : stats.max,
    count: stats.count,
  }))
}

interface ProgressData {
  name: string
  elo: number
  color: string
}

// Define day keys for type safety, now based on ISO date string format (YYYY-MM-DD)
type DayKey = string

// Interface for chart data
interface ChartDataItem {
  name: string
  color: string
  [key: string]: string | number // Allow dynamic date keys
}

// Get the last 7 days (including today)
const getDays = () => {
  const result: DayKey[] = []
  for (let i = 6; i >= 0; i--) {
    result.push(dayjs().subtract(i, 'day').format('YYYY-MM-DD'))
  }
  return result
}

// Format day for display
const formatDayLabel = (dateStr: string) => {
  return dayjs(dateStr).format('ddd')[0] // First letter of day name
}

// Days for data
const dayKeys = getDays()

// Sample data for the chart, using dynamic date keys
const chartData = ref<ChartDataItem>({
  name: 'Your Elo',
  color: '#4f46e5',
})

const userStore = useUserStore()

// For display in header
const progressData = ref<ProgressData>({
  name: 'Your Elo',
  elo: userStore.currentElo,
  color: '#4f46e5',
})

// Initialize chart data with dates
onMounted(async () => {
  try {
    // Get actual ELO history data from service
    let eloHistory = await getUserEloHistory()

    // Calculate current ELO (most recent value)
    const currentElo = userStore.currentElo
    // Process eloHistory to ensure all days have values
    const processedEloHistory = dayKeys.map((day) => {
      // Find if we have data for this day
      const dayData = eloHistory.find((item) => item.date === day)

      if (dayData) {
        return dayData
      } else {
        // Find the most recent previous day with data
        const previousData = eloHistory
          .filter((item) => item.date < day)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]

        // Use previous day's data or default to 0
        return {
          date: day,
          min_elo: previousData ? previousData.min_elo : 0,
          max_elo: previousData ? previousData.max_elo : 0,
          count: 0,
        }
      }
    })

    // For the last day (today), use the current Elo from userStore
    const lastDayIndex = processedEloHistory.length - 1
    if (lastDayIndex >= 0) {
      processedEloHistory[lastDayIndex].max_elo = currentElo
    }

    // Replace the original eloHistory with the processed one
    eloHistory = processedEloHistory
    // Update chartData with date keys
    chartData.value = {
      name: 'Your Elo',
      color: '#4f46e5',
      ...dayKeys.reduce(
        (acc, day, index) => {
          // Map ELO values to corresponding days, handle case where not enough data exists
          acc[day] = index < eloHistory.length ? eloHistory[index].max_elo || 0 : 0
          return acc
        },
        {} as Record<string, number>,
      ),
    }
  } catch (error) {
    console.error('Failed to fetch ELO history:', error)
    // Fallback to empty data in case of error
    chartData.value = { name: 'Your Elo', color: '#4f46e5' }
    progressData.value = {
      name: 'Your Elo',
      elo: 0,
      color: '#4f46e5',
    }
  }
})

// Formatted day labels for display
const dayLabels = computed(() => dayKeys.map(formatDayLabel))

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
    tooltip: {
      callbacks: {
        title: (tooltipItems: any[]) => {
          // Display full date in tooltip
          const index = tooltipItems[0].dataIndex
          return dayjs(dayKeys[index]).format('ddd, MMM D')
        },
      },
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
    labels: dayLabels.value,
    datasets: [chartData.value].map((user) => ({
      label: user.name,
      data: dayKeys.map((day) => (user[day] as number) || 0),
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
    <!-- Current date indicator -->
    <div class="text-sm text-gray-500 mb-2">
      {{ dayjs().format('MMMM D, YYYY') }}
    </div>

    <!-- User ELO Header -->
    <div class="mb-6">
      <div :key="progressData.name" class="flex items-center mb-1">
        <div
          class="w-3 h-3 rounded-full mr-2"
          :style="{ backgroundColor: progressData.color }"
        ></div>
        <span class="text-base font-medium" :style="{ color: progressData.color }">{{
          progressData.name
        }}</span>
        <span class="ml-auto text-base font-medium" :style="{ color: progressData.color }"
          >{{ progressData.elo }} Elo</span
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
