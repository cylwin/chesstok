<script setup lang="ts">
import { useRouter } from 'vue-router'
import ActionButton from '@/components/ActionButton.vue'
import DailyChallenge from '@/components/DailyChallenge.vue'
import WeeklyProgress from '@/components/WeeklyProgress.vue'

const router = useRouter()

const goToPuzzles = () => {
  router.push('/puzzles')
}

const goToPremium = () => {
  router.push('/premium')
}
</script>

<template>
  <div class="">
    <div
      class="pt-5 flex items-center justify-between mb-8 bg-gradient-to-r from-[#6366F1] to-purple-500 text-white"
    >
      <div class="w-32 h-32 flex-shrink-0 ml-4 mr-5 mb-5">
        <img
          src="@/assets/logo_chesstok_transparent.png"
          alt="ChessTok Logo"
          class="w-full h-full object-contain"
        />
      </div>
      <div class="flex-1 p-5">
        <h1 class="text-xl font-bold mb-2">Welcome!</h1>
        <p class="">
          Train your tactical vision with our puzzle feed. <br /><b>Play, solve, and improve!</b>
        </p>
      </div>
    </div>

    <!-- Premium Button -->
    <div class="px-4 mb-6">
      <button
        @click="goToPremium"
        class="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-800 font-bold py-3 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center"
      >
        <span class="mr-2">⭐</span>
        <span>Upgrade to Premium</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5 ml-2"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>

    <!-- Daily Challenge Section -->
    <div class="mb-4 px-4">
      <DailyChallenge />
    </div>
    <div class="flex px-5">
      <ActionButton type="skip" label="Start Solving!" @click="goToPuzzles" />
      <!-- <ActionButton type="hint" label="HINT" @click="goToPuzzles" /> -->
    </div>
    <div class="mt-8 mb-4 px-4">
      <WeeklyProgress />
    </div>
    <div class="flex px-5 mb-4">
      <ActionButton type="hint" label="STATS" @click="goToPuzzles" />
    </div>
  </div>
</template>

<style></style>
