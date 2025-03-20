<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue'
import { useUserStore } from '@/stores/user'

// Props to make it configurable
const props = defineProps({
  // If true, animate the streak counter; if false, display immediately
  animate: {
    type: Boolean,
    default: false,
  },
  // If set, will use this value instead of the store value (useful for static displays)
  streakOverride: {
    type: Number,
    default: null,
  },
})

const userStore = useUserStore()

// We'll animate this value from 0 to the actual streak value
const animatedStreak = ref(0)
const streakMilestones = ref<number[]>([7, 14, 30, 45, 60, 70, 80, 90, 100])

const dailyChallengeStreak = computed(() => {
  return props.streakOverride !== null ? props.streakOverride : userStore.dailyChallengeStreak
})

const lastCheckedMilestone = computed(() => {
  return [...streakMilestones.value]
    .filter((milestone) => milestone <= dailyChallengeStreak.value)
    .pop()
})

const upcomingMilestone = computed(() => {
  return (
    streakMilestones.value.find((milestone) => milestone > dailyChallengeStreak.value) ||
    dailyChallengeStreak.value + 7
  )
})

const computeProgressPercentage = computed(() => {
  // Find the next upcoming milestone
  if (!lastCheckedMilestone.value) {
    return (animatedStreak.value / upcomingMilestone.value) * 70
  } else {
    // At least one milestone reached
    // Last milestone is at 33%, next milestone is at 70%
    // Calculate progress between these points
    const progressBeyondLastMilestone = animatedStreak.value - lastCheckedMilestone.value
    const rangeToNextMilestone = upcomingMilestone.value - lastCheckedMilestone.value
    const progressInRange = progressBeyondLastMilestone / rangeToNextMilestone

    // 33% + progress toward next milestone (which is at 70%)
    return 33 + progressInRange * (70 - 33)
  }
})

// Function to animate the streak counter
const animateStreak = () => {
  // Only animate if the prop is set to true
  if (!props.animate) {
    animatedStreak.value = dailyChallengeStreak.value
    return
  }

  const duration = Math.min(2000, dailyChallengeStreak.value * 180)
  const start = 0
  const end = dailyChallengeStreak.value
  const startTime = Date.now()

  const animate = () => {
    const now = Date.now()
    const elapsed = now - startTime

    if (elapsed < duration) {
      animatedStreak.value = start + (end - start) * (elapsed / duration)
      requestAnimationFrame(animate)
    } else {
      animatedStreak.value = end
    }
  }

  animate()
}

// Re-run the animation if the streak value changes
watch(
  () => dailyChallengeStreak.value,
  () => {
    animateStreak()
  },
)

// Initialize on mount
onMounted(() => {
  animateStreak()
})
</script>

<template>
  <div class="bg-white rounded-xl shadow-md p-6 mb-2">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-xl font-bold text-slate-700">Current Streak</h2>
      <div class="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full font-bold text-sm">
        {{ Math.floor(animatedStreak) }} days
      </div>
    </div>
    <div class="relative h-16 mb-4">
      <!-- Progress bar background -->
      <div
        class="absolute top-1/2 left-0 right-0 h-3 bg-gray-200 transform -translate-y-1/2 rounded-full"
      >
        <!-- Fill based on achieved days -->
        <div
          class="h-full bg-gradient-to-r from-[#6366F1] to-purple-500 rounded-full"
          :style="{
            width: `${Math.min(computeProgressPercentage, 100)}%`,
          }"
        ></div>
      </div>

      <!-- Last checked milestone (if any) -->
      <div
        v-if="lastCheckedMilestone"
        class="absolute top-1"
        style="left: 33%; transform: translateX(-50%)"
      >
        <div
          class="w-12 h-12 flex flex-col items-center justify-center rounded-md shadow-md"
          :class="{
            'bg-gray-200': lastCheckedMilestone > animatedStreak,
            'bg-gradient-to-r from-yellow-400 to-yellow-500':
              lastCheckedMilestone <= animatedStreak,
          }"
        >
          <span class="text-gray-800 font-bold">
            {{ lastCheckedMilestone }}
          </span>
        </div>
        <div class="text-xs font-semibold mt-1 text-center text-gray-800">
          Day {{ lastCheckedMilestone }}
        </div>
      </div>

      <!-- Next milestone -->
      <div class="absolute top-1" style="left: 70%; transform: translateX(-50%)">
        <div
          class="w-12 h-12 flex flex-col items-center justify-center rounded-md shadow-md bg-gray-200"
        >
          <span class="text-gray-800 font-bold">{{ upcomingMilestone }}</span>
        </div>
        <div class="text-xs font-semibold mt-1 text-center text-gray-500">
          Day {{ upcomingMilestone }}
        </div>
      </div>
    </div>

    <!-- Challenge info -->
    <div class="bg-indigo-50 rounded-lg p-4" v-if="props.animate">
      <div class="flex items-start">
        <div class="bg-indigo-100 p-2 rounded-full mr-4">
          <svg
            class="w-6 h-6 text-indigo-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M13 10V3L4 14h7v7l9-11h-7z"
            ></path>
          </svg>
        </div>
        <div>
          <h3 class="font-bold text-slate-700">Stay consistent!</h3>
          <p class="text-sm text-slate-600">Come back tomorrow to continue your streak.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Any additional styles we need */
</style>
