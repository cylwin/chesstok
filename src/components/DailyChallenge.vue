<script setup lang="ts">
import { computed } from 'vue'
import ProgressBar from './ProgressBar.vue'
import { useUserStore } from '@/stores'

const userStore = useUserStore()

// Computed property for the remaining time (6 hours in the example)
const remainingTime = computed(() => {
  const now = new Date()
  const midnight = new Date()
  midnight.setHours(24, 0, 0, 0)
  const hoursUntilMidnight = Math.round((midnight.getTime() - now.getTime()) / (1000 * 60 * 60))
  const minutesUntilMidnight = Math.floor((midnight.getTime() - now.getTime()) / (1000 * 60))
  if (hoursUntilMidnight === 0) {
    return `${minutesUntilMidnight} MIN`
  }
  return `${hoursUntilMidnight} HOURS`
})

// Daily challenge data
const dailyChallenge = computed(() => {
  // This would ideally come from the store
  return {
    completed: Math.min(userStore.dailyChallenge || 0, userStore.DAILY_CHALLENGE_GOAL),
    total: userStore.DAILY_CHALLENGE_GOAL,
  }
})
</script>

<template>
  <h2 class="text-xl font-bold text-slate-700">Daily Challenge</h2>

  <div
    class="relative mt-2 p-5 rounded-xl border bg-white shadow-sm transition-colors duration-300 ease-in-out"
    :class="{
      'border-amber-200 bg-gradient-to-b from-white to-amber-50/80':
        dailyChallenge.completed < dailyChallenge.total,
      'border-green-200 bg-gradient-to-b from-white to-green-50/80':
        dailyChallenge.completed >= dailyChallenge.total,
    }"
  >
    <div class="flex items-center justify-between mb-2">
      <h2 class="text-xl font-bold text-slate-700">Solve {{ dailyChallenge.total }} puzzles</h2>
      <div
        v-if="dailyChallenge.completed >= dailyChallenge.total"
        class="flex items-center text-green-500 font-bold"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fill-rule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clip-rule="evenodd"
          />
        </svg>
        <span class="ml-1">Completed!</span>
      </div>
      <div v-else class="time-remaining flex items-center text-amber-500 font-bold">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5 mr-1.5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fill-rule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
            clip-rule="evenodd"
          />
        </svg>
        {{ remainingTime }}
      </div>
    </div>

    <div class="flex items-center mb-2">
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
</template>

<style scoped>
.daily-challenge {
  position: relative;
  overflow: hidden;
}
</style>
