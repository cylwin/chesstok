<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import ChessPuzzle from '../components/ChessPuzzle.vue'
import UserEloBadge from '../components/UserEloBadge.vue'
import StreakFlame from '../components/StreakFlame.vue'
import ProgressBar from '../components/ProgressBar.vue'
import { useUserStore, useTimerStore, usePuzzleStore } from '@/stores'
import { useRouter } from 'vue-router'
import confetti from 'canvas-confetti'

// Reference to the puzzle component
const puzzleRef = ref<InstanceType<typeof ChessPuzzle> | null>(null)

const userStore = useUserStore()
const timerStore = useTimerStore()
const puzzleStore = usePuzzleStore()
const router = useRouter()

// Get the orientation based on whose turn it is in the FEN
const getOrientationFromFen = computed(() => {
  if (!puzzleStore.fen) return 'white'
  const fenParts = puzzleStore.fen.split(' ')
  // The active color is the second field in the FEN string
  const activeColor = fenParts[1]
  return activeColor === 'w' ? 'white' : 'black'
})

// Define streak thresholds for the flame images
const streakThresholds = [5, 15, 30]

// Computed property for daily progress
const dailyProgress = computed(() => {
  // This would ideally come from the store
  // For now, we'll use a placeholder value
  return {
    completed: Math.min(userStore.dailyChallenge, userStore.DAILY_CHALLENGE_GOAL),
    total: userStore.DAILY_CHALLENGE_GOAL,
  }
})

// Computed property for progress percentage
const progressPercentage = computed(() => {
  return (dailyProgress.value.completed / dailyProgress.value.total) * 100
})

onMounted(async () => {
  timerStore.startNewPuzzle()
  if (!puzzleStore.currentPuzzleId) {
    puzzleStore.getNewPuzzle()
  }
})

const verb = computed(() => {
  const MAP_VERB = {
    mateIn1: 'mate',
    hangingPiece: 'take',
    other: 'move',
  }
  return MAP_VERB[puzzleStore.currentPuzzleTheme as keyof typeof MAP_VERB] || 'move'
})
function triggerConfetti() {
  const duration = 1500
  const end = Date.now() + duration

  // Run the confetti animation
  const interval = setInterval(() => {
    if (Date.now() > end) {
      return clearInterval(interval)
    }
  }, 50)
}

function handlePuzzleSolved(rating: number, newElo: number, eloChange: number) {
  const colorsSchemes = [
    ['#6366f1', '#10b981', '#f97316'],
    ['#FFD700', '#FF3E9D', '#00FFDD'],
    ['#39FF14', '#FE01FF', '#FFFF00'],
    ['#FF2E63', '#5465FF', '#1FFF20'],
  ]
  if (Math.random() < 0.2) {
    confetti({
      particleCount: 70,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: colorsSchemes[Math.floor(Math.random() * colorsSchemes.length)],
    })

    confetti({
      particleCount: 70,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: colorsSchemes[Math.floor(Math.random() * colorsSchemes.length)],
    })
  }

  puzzleStore.setFeedback('Correct!', 'success')

  puzzleStore.handlePuzzleSolved(rating, newElo, eloChange)
}
</script>

<template>
  <!-- Player & Puzzle Info -->
  <div class="px-5 mt-4 flex justify-between">
    <div class="flex items-center">
      <div>
        <UserEloBadge :elo="userStore.currentElo" />
      </div>
    </div>
    <div class="flex items-center">
      <div>
        <div class="font-black text-slate-800 text-right">PUZZLE ELO</div>
        <div class="text-accent font-black text-xl text-right">{{ puzzleStore.puzzleRating }}</div>
      </div>
      <div
        class="w-12 h-12 puzzle-badge rounded-xl flex items-center justify-center text-white font-bold ml-3 -rotate-3"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
      </div>
    </div>
  </div>
  <div class="mt-1 py-1 px-5 flex justify-between">
    <div v-if="!puzzleStore.showFeedback">
      <div
        v-if="puzzleStore.fen"
        class="instruction-box text-center font-bold text-md text-slate-800 bg-yellow-100 py-1 px-2 rounded-lg shadow-inner border border-yellow-200 flex items-center"
      >
        <div
          class="w-4 h-4 bg-white rounded-md border border-slate-300 mr-2"
          v-if="getOrientationFromFen === 'black'"
        ></div>
        <div
          class="w-4 h-4 bg-black rounded-md border border-slate-300 mr-2"
          v-else-if="getOrientationFromFen === 'white'"
        ></div>
        {{ getOrientationFromFen === 'white' ? 'Black' : 'White' }} to {{ verb }}
      </div>
    </div>
    <div
      v-if="puzzleStore.showFeedback"
      class="text-center font-bold text-md text-white py-1 px-2 rounded-lg shadow-inner border flex items-center justify-center gap-2"
      :class="{
        'bg-gradient-to-r from-green-500 to-green-400 border-green-700 shadow-green-500/30':
          puzzleStore.feedbackType === 'success',
        'bg-gradient-to-r from-red-500 to-red-400 border-red-700 shadow-red-500/30':
          puzzleStore.feedbackType === 'error',
        'bg-gradient-to-r from-blue-500 to-blue-400 border-blue-700 shadow-blue-500/30':
          puzzleStore.feedbackType === 'info',
      }"
    >
      <svg
        v-if="puzzleStore.feedbackType === 'success'"
        xmlns="http://www.w3.org/2000/svg"
        class="h-5 w-5"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fill-rule="evenodd"
          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
          clip-rule="evenodd"
        />
      </svg>
      <svg
        v-if="puzzleStore.feedbackType === 'error'"
        xmlns="http://www.w3.org/2000/svg"
        class="h-5 w-5"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fill-rule="evenodd"
          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
          clip-rule="evenodd"
        />
      </svg>
      {{ puzzleStore.feedbackMessage }}
    </div>
    <div
      class="timer rounded-lg flex justify-center items-center bg-slate-100 py-1 px-2 shadow-sm shadow-slate-300/30"
    >
      <div class="text-md font-bold text-slate-800 flex items-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-4 w-4 mr-1.5 text-slate-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span>{{ timerStore.formattedTime }}</span>
      </div>
    </div>
  </div>

  <!-- Chess Puzzle Component -->
  <div class="relative">
    <ChessPuzzle
      ref="puzzleRef"
      :is-onboarding="false"
      :fen="puzzleStore.fen"
      :winning-move="puzzleStore.winningMove"
      :puzzle-rating="puzzleStore.puzzleRating"
      :puzzle-id="puzzleStore.currentPuzzleId"
      :borderColor="
        puzzleStore.showFeedback
          ? puzzleStore.feedbackType === 'success'
            ? 'green'
            : puzzleStore.feedbackType === 'error'
              ? 'red'
              : 'black'
          : 'black'
      "
      @next="puzzleStore.getNewPuzzle"
      @solved="handlePuzzleSolved"
      @failed="puzzleStore.handlePuzzleFailed"
      v-if="puzzleStore.fen"
    />
  </div>

  <!-- Progress Bar -->
  <div class="flex px-5 pb-8 items-start">
    <div class="flex-1 pt-6 pr-4">
      <ProgressBar
        :completed="dailyProgress.completed"
        :total="dailyProgress.total"
        label="DAILY PROGRESS"
        suffix="PUZZLES"
      />
    </div>
    <StreakFlame :currentStreak="userStore.currentStreak" :thresholds="streakThresholds" />
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap');

.puzzle-badge {
  background: linear-gradient(135deg, #f97316 0%, #fb923c 100%);
  box-shadow: 0 4px 6px -1px rgba(249, 115, 22, 0.3);
  position: relative;
  overflow: hidden;
}

.puzzle-badge::after {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0) 70%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.puzzle-badge:hover::after {
  opacity: 1;
}

.instruction-box {
  position: relative;
  z-index: 1;
  overflow: hidden;
}

.instruction-box::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(249, 115, 22, 0.1) 0%, rgba(249, 115, 22, 0) 70%);
  z-index: -1;
  animation: pulse-light 3s infinite;
}

@keyframes pulse-light {
  0% {
    opacity: 0.5;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.5;
  }
}

.progress-bar {
  height: 10px;
  border-radius: 5px;
  background: linear-gradient(90deg, #22d3ee 0%, #10b981 100%);
  position: relative;
  overflow: hidden;
}

.progress-bar::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.2) 50%,
    rgba(255, 255, 255, 0) 100%
  );
  transform: translateX(-100%);
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  100% {
    transform: translateX(100%);
  }
}
</style>
