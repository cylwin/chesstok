<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import ActionButton from '@/components/ActionButton.vue'
import DailyStreakProgress from '@/components/DailyStreakProgress.vue'
import confetti from 'canvas-confetti'

const router = useRouter()

const continueSolving = () => {
  router.push('/puzzles')
}

// Trigger confetti when the component is mounted
onMounted(() => {
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

      <!-- Daily Streak Progress Component with animation -->
      <DailyStreakProgress :animate="true" />

      <!-- Action buttons -->
      <div class="flex space-x-4 mt-8">
        <ActionButton type="skip" label="Continue Solving" @click="continueSolving" />
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Any additional styles we need */
</style>
