<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
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
import ProgressBar from '@/components/ProgressBar.vue'

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

const userStore = useUserStore()

// Stats data
const stats = ref({
  wins: 0,
  losses: 0,
  totalPuzzles: 0,
  bestGamesStreak: 0,
})

// For the ELO chart
type DayKey = string

interface ChartDataItem {
  name: string
  color: string
  [key: string]: string | number
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

// For display in header
const progressData = computed(() => ({
  name: 'Your Elo',
  elo: userStore.currentElo,
  color: '#4f46e5',
}))

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
  animation: {
    duration: 0, // Disable animations by setting duration to 0
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

// Daily challenge data
const dailyChallenge = computed(() => {
  return {
    completed: Math.min(userStore.dailyChallenge || 0, userStore.DAILY_CHALLENGE_GOAL),
    total: userStore.DAILY_CHALLENGE_GOAL,
  }
})

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

async function fetchStats() {
  try {
    // Get puzzle attempts to calculate wins and losses
    const { data: puzzleAttempts, error } = await supabase.from('puzzle_attempts').select('outcome')

    if (error) {
      console.error('Error fetching puzzle attempts:', error)
      return
    }

    if (puzzleAttempts) {
      const wins = puzzleAttempts.filter((attempt) => attempt.outcome === 'correct').length
      const losses = puzzleAttempts.filter((attempt) => attempt.outcome === 'incorrect').length

      stats.value = {
        wins,
        losses,
        totalPuzzles: wins + losses,
        bestGamesStreak: userStore.highestStreak || 0, // TODO: add highest games streak
      }
    }

    // Get ELO history
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
    console.error('Failed to fetch stats:', error)
  }
}

onMounted(async () => {
  await fetchStats()
})
</script>

<template>
  <div class="stats-view-container">
    <div class="stats-view">
      <h1 class="text-2xl font-bold text-slate-700 mb-4">Your Stats</h1>

      <!-- Key Figures Section -->
      <div class="grid grid-cols-2 gap-3 mb-6">
        <div class="bg-white rounded-xl p-4 shadow-sm border border-indigo-100">
          <h3 class="text-sm text-gray-500 mb-1">Puzzles Solved</h3>
          <div class="text-2xl font-bold text-indigo-600">{{ stats.wins }}</div>
        </div>

        <div class="bg-white rounded-xl p-4 shadow-sm border border-indigo-100">
          <h3 class="text-sm text-gray-500 mb-1">Incorrect Attempts</h3>
          <div class="text-2xl font-bold text-indigo-600">{{ stats.losses }}</div>
        </div>

        <div class="bg-white rounded-xl p-4 shadow-sm border border-indigo-100">
          <h3 class="text-sm text-gray-500 mb-1">Total Puzzles</h3>
          <div class="text-2xl font-bold text-indigo-600">{{ stats.totalPuzzles }}</div>
        </div>

        <div class="bg-white rounded-xl p-4 shadow-sm border border-indigo-100">
          <h3 class="text-sm text-gray-500 mb-1">Current ELO</h3>
          <div class="text-2xl font-bold text-indigo-600">{{ userStore.currentElo }}</div>
        </div>

        <div class="bg-white rounded-xl p-4 shadow-sm border border-indigo-100">
          <h3 class="text-sm text-gray-500 mb-1">Best Games Streak</h3>
          <div class="text-2xl font-bold text-indigo-600">{{ stats.bestGamesStreak }}</div>
        </div>
      </div>

      <!-- Daily Challenge Progress (without animation) -->
      <div class="mb-6">
        <h2 class="text-xl font-bold text-slate-700 mb-2">Daily Challenge Progress</h2>
        <div class="p-5 rounded-xl border border-amber-200 bg-white shadow-sm">
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-lg font-bold text-slate-700">
              {{ dailyChallenge.completed }}/{{ dailyChallenge.total }} Puzzles
            </h3>
            <div
              v-if="dailyChallenge.completed >= dailyChallenge.total"
              class="text-green-500 font-bold flex items-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5 mr-1"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clip-rule="evenodd"
                />
              </svg>
              Completed!
            </div>
          </div>
          <div class="flex items-center">
            <div class="flex-1">
              <ProgressBar
                :completed="dailyChallenge.completed"
                :total="dailyChallenge.total"
                label=""
                className=""
              />
            </div>
          </div>
        </div>
      </div>

      <!-- ELO History Chart -->
      <div class="mb-6">
        <h2 class="text-xl font-bold text-slate-700 mb-2">ELO History</h2>
        <div class="weekly-progress rounded-xl border border-amber-200 bg-white p-4 shadow-sm">
          <!-- Current date indicator -->
          <div class="text-sm text-gray-500 mb-2">
            {{ dayjs().format('MMMM D, YYYY') }}
          </div>

          <!-- User ELO Header -->
          <div class="mb-4">
            <div class="flex items-center mb-1">
              <div
                class="w-3 h-3 rounded-full mr-2"
                :style="{ backgroundColor: progressData.color }"
              ></div>
              <span class="text-base font-medium" :style="{ color: progressData.color }">
                {{ progressData.name }}
              </span>
              <span class="ml-auto text-base font-medium" :style="{ color: progressData.color }">
                {{ progressData.elo }} Elo
              </span>
            </div>
          </div>

          <!-- Chart Container using vue-chartjs (without animation) -->
          <div class="h-48 mt-4">
            <Line :data="chartjsData" :options="chartOptions" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.stats-view-container {
  min-height: 100vh;
  background-color: #f9fafb;
}
.stats-view {
  padding: 1rem;
  background-color: #f9fafb;
}

.weekly-progress {
  position: relative;
  overflow: hidden;
  background: linear-gradient(to bottom, rgba(255, 255, 255, 1) 0%, rgba(255, 250, 240, 0.8) 100%);
}
</style>
