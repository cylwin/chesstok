<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import ActionButton from '@/components/ActionButton.vue'
import { useUserStore } from '@/stores/user'
import confetti from 'canvas-confetti'

const router = useRouter()
const userStore = useUserStore()

// We'll animate this value from 0 to the actual streak value
const animatedStreak = ref(0)
const streakMilestones = ref<number[]>([7, 14, 30, 45, 60, 70, 80, 90, 100])

const dailyChallengeStreak = computed(() => {
  return userStore.dailyChallengeStreak
})

// Computed property to determine the next milestone
const nextMilestone = computed(() => {
  return (
    streakMilestones.value.find((milestone) => milestone > dailyChallengeStreak.value) ||
    dailyChallengeStreak.value + 7
  )
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

const continueSolving = () => {
  router.push('/puzzles')
}

// Trigger confetti when the component is mounted
onMounted(() => {
  // Animate the streak counter
  const duration = 2000
  const start = 0
  const end = dailyChallengeStreak.value
  const startTime = Date.now()

  const animateStreak = () => {
    const now = Date.now()
    const elapsed = now - startTime

    if (elapsed < duration) {
      animatedStreak.value = start + (end - start) * (elapsed / duration)
      requestAnimationFrame(animateStreak)
    } else {
      animatedStreak.value = end
    }
  }

  animateStreak()

  // Trigger confetti
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
  })
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-indigo-50 to-white py-8 px-4">
    <div class="max-w-lg mx-auto">
      <!-- Congratulations header -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-indigo-600 mb-2">Challenge Complete!</h1>
        <p class="text-lg text-slate-600">Great job! You've completed today's daily challenge.</p>
      </div>

      <!-- 14 Day Challenge progress visualization (as seen in the image) -->
      <div class="bg-white rounded-xl shadow-md p-6 mb-8">
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
              <span class="text-gray-800 font-bold">{{ nextMilestone }}</span>
            </div>
            <div class="text-xs font-semibold mt-1 text-center text-gray-500">
              Day {{ nextMilestone }}
            </div>
          </div>
        </div>

        <!-- Challenge info -->
        <div class="bg-indigo-50 rounded-lg p-4 mb-6">
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
              <p class="text-sm text-slate-600">
                Come back tomorrow to continue your streak. Every 7 days unlocks new achievements!
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Action buttons -->
      <div class="flex space-x-4">
        <ActionButton type="skip" label="Continue Solving" @click="continueSolving" />
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Any additional styles we need */
</style>
