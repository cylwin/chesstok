<script setup lang="ts">
import { useRouter } from 'vue-router'
import ActionButton from '@/components/ActionButton.vue'

const router = useRouter()

function continueJourney() {
  router.push('/')
}
</script>

<template>
  <div class="min-h-screen bg-white">
    <!-- Header section with gradient background like HomeView -->
    <div
      class="pt-5 flex items-center justify-center flex-col mb-6 bg-gradient-to-r from-[#6366F1] to-purple-500 text-white px-4 pb-6"
    >
      <div class="w-32 h-32 flex items-center justify-center">
        <!-- Treasure chest without animation -->
        <div class="text-8xl drop-shadow-lg">🎁</div>
      </div>
      <h1 class="text-xl font-bold mt-4 text-center">The Treasure of Chess Wisdom</h1>
      <p class="text-center mt-2">Your First Step to Mastery</p>
    </div>

    <!-- Content sections without animations -->
    <div class="px-5 space-y-5 mb-6">
      <div class="bg-white rounded-lg shadow-md p-4">
        <p class="text-lg font-medium mb-3">
          🔥 You did it! Three puzzles solved, and now… your first Chess Treasure is unlocked.
        </p>

        <p class="mb-3">
          💡 What's inside? Not gold, not power-ups… but something far more valuable.
        </p>

        <p class="text-xl font-bold text-purple-600 my-3 text-center">Knowledge.</p>

        <p class="mb-3">The secret that every grandmaster knows but few beginners understand:</p>

        <p class="text-lg font-bold text-purple-600 my-3 text-center">
          🧠 Puzzles are the fastest way to improve at chess.
        </p>

        <p class="">
          Not openings. Not memorizing moves. Just one thing: finding the right move, at the right
          time.
        </p>
      </div>

      <div class="bg-white rounded-lg shadow-md p-4">
        <h3 class="text-lg font-bold text-[#6366F1] mb-3">⚡ What's Next?</h3>

        <ul class="space-y-3">
          <li class="flex items-start">
            <span class="mr-2">🚀</span>
            <span>Your next challenge is waiting.</span>
          </li>
          <li class="flex items-start">
            <span class="mr-2">🔑</span>
            <span>Every puzzle solved is another key to unlocking the mind of a grandmaster.</span>
          </li>
          <li class="flex items-start">
            <span class="mr-2">🔥</span>
            <span>Your journey starts NOW.</span>
          </li>
        </ul>

        <p class="text-lg font-medium text-purple-600 mt-4 text-center">
          Let's find your next winning move. ♟️💡
        </p>
      </div>

      <div class="flex px-0 mt-6">
        <ActionButton type="skip" label="Continue My Journey" @click="continueJourney" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.reveal-section.reveal-active {
  opacity: 1;
  transform: translateY(0);
}

.bg-gradient-radial {
  background: radial-gradient(circle, var(--tw-gradient-from) 10%, var(--tw-gradient-to) 70%);
}
</style>
