<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue'

// Props for component configuration
const props = defineProps({
  // Current level
  level: {
    type: Number,
    required: true,
  },
  // Current XP amount
  currentXp: {
    type: Number,
    required: true,
  },
  // XP needed to level up
  neededXp: {
    type: Number,
    required: true,
  },
  // If true, animates the progress; if false, displays immediately
  animate: {
    type: Boolean,
    default: false,
  },
})

// Animated progress value
const animatedProgress = ref(0)

const progressPercentage = computed(() => {
  // Limit percentage to 100% maximum
  return Math.min((animatedProgress.value / props.neededXp) * 100, 100)
})

// Function to animate the progress
const animateProgress = (startAt = 0) => {
  // If animation is disabled, set the value directly
  if (!props.animate) {
    animatedProgress.value = props.currentXp
    return
  }

  // Calculate duration based on the value to animate (with a reasonable maximum)
  const duration = Math.min(2000, props.currentXp * 50)
  const start = startAt
  const end = props.currentXp
  const startTime = Date.now()

  const animate = () => {
    const now = Date.now()
    const elapsed = now - startTime

    if (elapsed < duration) {
      animatedProgress.value = start + (end - start) * (elapsed / duration)
      requestAnimationFrame(animate)
    } else {
      animatedProgress.value = end
    }
  }

  animate()
}

// Reset animation if progress value changes
watch(
  () => props.currentXp,
  (_, oldValue) => {
    animateProgress(oldValue)
  },
)

// Initialize on display
onMounted(() => {
  animateProgress()
})
</script>

<template>
  <h2 class="text-xl font-bold text-slate-700 flex-1">Level Progress</h2>
  <div
    class="bg-white rounded-xl shadow-md px-6 py-2 my-2 w-full border border-indigo-200 bg-gradient-to-b from-white to-indigo-50/80"
  >
    <div class="relative h-16 mb-4">
      <!-- Level box at the start -->
      <div class="absolute top-2 left-0 z-10">
        <div
          class="w-12 h-12 flex flex-col items-center justify-center rounded-md shadow-md bg-gradient-to-r from-[#6366f1] to-[#4f46e5]"
        >
          <span class="text-white font-bold text-lg">{{ level }}</span>
        </div>
        <div class="text-xs font-semibold mt-1 text-center text-[#4f46e5]">Current</div>
      </div>

      <!-- Progress bar background -->
      <div
        class="absolute top-1/2 left-10 right-10 h-3 bg-gray-200 transform -translate-y-1/2 rounded-full"
      >
        <!-- Fill based on current progress -->
        <div
          class="h-full bg-gradient-to-r from-[#6366f1] to-[#4f46e5] rounded-full"
          :style="{
            width: `${progressPercentage}%`,
          }"
        ></div>
      </div>
      <div class="flex justify-center items-center absolute top-2/3 left-10 right-10">
        <div class="bg-blue-100 text-[#6366f1] px-3 py-1 rounded-full font-bold text-xs">
          {{ Math.floor(animatedProgress) }} / {{ neededXp }} XP
        </div>
      </div>
      <!-- Next level box at the end -->
      <div class="absolute top-1 right-6" style="transform: translateX(50%)">
        <div
          class="w-12 h-12 flex flex-col items-center justify-center rounded-md shadow-md"
          :class="{
            'bg-gray-200': props.currentXp < props.neededXp,
            'bg-gradient-to-r from-[#6366f1] to-[#4f46e5]': props.currentXp >= props.neededXp,
          }"
        >
          <span
            class="font-bold text-lg"
            :class="{
              'text-gray-400': props.currentXp < props.neededXp,
              'text-white': props.currentXp >= props.neededXp,
            }"
          >
            {{ level + 1 }}
          </span>
        </div>
        <div
          class="text-xs font-semibold mt-1 text-center"
          :class="{
            'text-gray-500': props.currentXp < props.neededXp,
            'text-[#4f46e5]': props.currentXp >= props.neededXp,
          }"
        >
          Next
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Additional styles if needed */
</style>
