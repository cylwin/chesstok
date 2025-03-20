<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue'
import { useLevelStore } from '../stores/levelStore'

// Get level data from store instead of props
const levelStore = useLevelStore()

// Only keep the animate prop since it's a UI preference
const props = defineProps({
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
  return Math.min((animatedProgress.value / levelStore.totalXPtoNextLevel) * 100, 100)
})

// Function to animate the progress
const animateProgress = (startAt = 0) => {
  // If animation is disabled, set the value directly
  if (!props.animate) {
    animatedProgress.value = levelStore.currentXPInLevel
    return
  }

  // Calculate duration based on the value to animate (with a reasonable maximum)
  const duration = Math.min(2000, levelStore.currentXPInLevel * 50)
  const start = startAt
  const end = levelStore.currentXPInLevel
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
  () => levelStore.currentXPInLevel,
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
  <div class="relative h-16 mb-4">
    <!-- Level box at the start -->
    <div class="absolute top-4 left-0 z-10">
      <div
        class="w-8 h-8 flex flex-col items-center justify-center rounded-md shadow-md bg-gradient-to-r from-[#6366f1] to-[#4f46e5]"
      >
        <span class="text-white font-bold text-lg">{{ levelStore.currentLevel }}</span>
      </div>
    </div>

    <!-- Progress bar background -->
    <div
      class="absolute top-1/2 left-7 right-9 h-3 bg-gray-200 transform -translate-y-1/2 rounded-full"
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
        {{ Math.floor(animatedProgress) }} / {{ levelStore.totalXPtoNextLevel }} XP
      </div>
    </div>
    <!-- Next level box at the end -->
    <div class="absolute top-4 right-6" style="transform: translateX(50%)">
      <div
        class="w-8 h-8 flex flex-col items-center justify-center rounded-md shadow-md"
        :class="{
          'bg-gray-200': levelStore.currentXPInLevel < levelStore.neededXPtoNextLevel,
          'bg-gradient-to-r from-[#6366f1] to-[#4f46e5]':
            levelStore.currentXPInLevel >= levelStore.neededXPtoNextLevel,
        }"
      >
        <span
          class="font-bold text-lg"
          :class="{
            'text-gray-400': levelStore.currentXPInLevel < levelStore.neededXPtoNextLevel,
            'text-white': levelStore.currentXPInLevel >= levelStore.neededXPtoNextLevel,
          }"
        >
          {{ levelStore.currentLevel + 1 }}
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Additional styles if needed */
</style>
