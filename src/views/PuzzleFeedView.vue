<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import ChessPuzzle from '../components/ChessPuzzle.vue'
import ActionButton from '../components/ActionButton.vue'
import UserEloBadge from '../components/UserEloBadge.vue'
import { supabase } from '../services/supabase'
import { useUserStore } from '@/stores'

// Example puzzle with white to play and win
const fen = ref('')
const winningMove = ref('')
const puzzleRating = ref(0)
const currentPuzzleId = ref('')

// Reference to the puzzle component
const puzzleRef = ref<InstanceType<typeof ChessPuzzle> | null>(null)

// Track user feedback messages
const feedbackMessage = ref('')
const showFeedback = ref(false)
const feedbackType = ref<'success' | 'error' | 'info'>('info')

const userStore = useUserStore()

// Get the orientation based on whose turn it is in the FEN
const getOrientationFromFen = computed(() => {
  if (!fen.value) return 'white'
  const fenParts = fen.value.split(' ')
  // The active color is the second field in the FEN string
  const activeColor = fenParts[1]
  return activeColor === 'w' ? 'white' : 'black'
})

// Computed properties for streak display
const streakSegments = computed(() => {
  const segments = []
  const maxSegments = 5
  const currentStreak = userStore.currentStreak

  for (let i = 0; i < maxSegments; i++) {
    segments.push(i < currentStreak)
  }

  return segments
})

// Computed property for daily progress
const dailyProgress = computed(() => {
  const GOAL = 10
  // This would ideally come from the store
  // For now, we'll use a placeholder value
  return {
    completed: Math.min(userStore.dailyChallenge, GOAL),
    total: GOAL,
  }
})

// Computed property for progress percentage
const progressPercentage = computed(() => {
  return (dailyProgress.value.completed / dailyProgress.value.total) * 100
})

function handlePuzzleSolved(rating: number, newElo: number, eloChange: number) {
  // Handle when puzzle is correctly solved
  feedbackMessage.value = `Correct! Elo: ${newElo} (${eloChange > 0 ? '+' : ''}${eloChange})`
  feedbackType.value = 'success'
  showFeedback.value = true

  // Hide feedback after 2 seconds
  setTimeout(() => {
    showFeedback.value = false
  }, 2000)
}

function handlePuzzleFailed(rating: number, newElo: number, eloChange: number) {
  // Handle when puzzle is incorrectly solved
  feedbackMessage.value = `Incorrect! Elo: ${newElo} (${eloChange > 0 ? '+' : ''}${eloChange})`
  feedbackType.value = 'error'
  showFeedback.value = true

  // Hide feedback after 2 seconds
  setTimeout(() => {
    showFeedback.value = false
  }, 2000)
}

async function getNewPuzzle() {
  //fen.value = ''
  //winningMove.value = ''
  //puzzleRating.value = 0
  //currentPuzzleId.value = ''

  const data = await userStore.getNewPuzzle()
  console.log(data)

  if (!data) {
    console.error('Failed to get new puzzle')
    feedbackMessage.value = 'Could not load puzzle. Please try again.'
    feedbackType.value = 'info'
    showFeedback.value = true

    // Hide feedback after 2 seconds
    setTimeout(() => {
      showFeedback.value = false
    }, 2000)
    return null
  }

  console.log(data)
  //setTimeout(() => {
  fen.value = data.FEN
  winningMove.value = data.Moves
  puzzleRating.value = data.Rating || 600
  currentPuzzleId.value = data.PuzzleId || ''
  //}, 1000)

  return data
}

onMounted(async () => {
  getNewPuzzle()
})
</script>

<template>
  <!-- Streak Bar -->
  <div class="p-5 bg-white border-b border-slate-100 chess-pattern">
    <div class="flex justify-between items-center mb-3">
      <span class="text-sm font-black text-slate-700">CURRENT STREAK</span>
      <span class="text-sm font-black text-primary">{{ userStore.currentStreak }}/5</span>
    </div>
    <div class="flex justify-center">
      <div
        v-for="(active, index) in streakSegments"
        :key="index"
        :class="[
          'streak-segment',
          active
            ? 'bg-gradient-to-r from-[#10B981] to-teal-400 shadow-md'
            : 'bg-slate-200 shadow-inner',
          index === userStore.currentStreak - 1 ? 'pulse' : '',
        ]"
      ></div>
    </div>
  </div>

  <!-- Player & Puzzle Info -->
  <div class="px-5 flex justify-between">
    <div class="flex items-center">
      <div>
        <UserEloBadge :elo="userStore.currentElo" />
      </div>
    </div>
    <div class="flex items-center">
      <div>
        <div class="font-black text-slate-800 text-right">PUZZLE ELO</div>
        <div class="text-accent font-black text-xl text-right">{{ puzzleRating }}</div>
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
  <div class="pb-1">
    <div class="timer rounded-lg flex justify-center items-center glowing-border">
      <div class="text-xl font-bold text-slate-800 flex items-center">
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
        <span>17:03</span>
      </div>
    </div>
  </div>

  <!-- Chess Puzzle Component -->
  <div class="relative">
    <div
      v-if="showFeedback"
      class="absolute top-32 left-1/2 transform -translate-x-1/2 px-8 text-2xl py-4 rounded-lg shadow-lg text-white font-bold z-20"
      :class="{
        'bg-green-500': feedbackType === 'success',
        'bg-red-500': feedbackType === 'error',
        'bg-blue-500': feedbackType === 'info',
      }"
    >
      {{ feedbackMessage }}
    </div>
    <ChessPuzzle
      ref="puzzleRef"
      :fen="fen"
      :winning-move="winningMove"
      :puzzle-rating="puzzleRating"
      :puzzle-id="currentPuzzleId"
      @next="getNewPuzzle"
      @solved="handlePuzzleSolved"
      @failed="handlePuzzleFailed"
      v-if="fen"
    />
  </div>

  <!-- Instructions -->
  <div class="px-5 py-3" v-if="fen">
    <div
      class="instruction-box text-center font-bold text-lg text-slate-800 bg-yellow-100 py-2 px-4 rounded-lg shadow-inner border border-yellow-200"
    >
      {{ getOrientationFromFen === 'white' ? 'Black' : 'White' }} to move and win
    </div>
  </div>

  <!-- Progress Bar -->
  <div class="px-5 pb-8 progress-container">
    <div class="w-full bg-slate-200 rounded-full h-3 shadow-inner">
      <div class="progress-bar" :style="{ width: `${progressPercentage}%` }"></div>
    </div>
    <div class="flex justify-between mt-3 font-black">
      <span class="text-slate-600">DAILY PROGRESS</span>
      <span class="text-primary" v-if="dailyProgress.completed < dailyProgress.total"
        >{{ dailyProgress.completed }}/{{ dailyProgress.total }} PUZZLES</span
      >
      <span class="text-primary" v-else>COMPLETED</span>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap');

.chess-piece {
  position: absolute;
  opacity: 0.07;
  z-index: 0;
  transform: rotate(10deg);
}

.chess-piece-1 {
  top: 10%;
  left: -10%;
  width: 150px;
  height: 150px;
}

.chess-piece-2 {
  bottom: 10%;
  right: -10%;
  width: 150px;
  height: 150px;
  transform: rotate(-15deg);
}

.chess-piece-3 {
  top: 40%;
  right: -5%;
  width: 100px;
  height: 100px;
  transform: rotate(25deg);
}

.chess-piece-4 {
  bottom: 30%;
  left: -5%;
  width: 100px;
  height: 100px;
  transform: rotate(-20deg);
}

.streak-segment {
  width: 24px;
  height: 10px;
  border-radius: 5px;
  margin: 0 3px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.streak-segment::after {
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

.chess-pattern {
  position: relative;
}

.chess-pattern::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image:
    linear-gradient(45deg, rgba(0, 0, 0, 0.05) 25%, transparent 25%),
    linear-gradient(-45deg, rgba(0, 0, 0, 0.05) 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, rgba(0, 0, 0, 0.05) 75%),
    linear-gradient(-45deg, transparent 75%, rgba(0, 0, 0, 0.05) 75%);
  background-size: 20px 20px;
  background-position:
    0 0,
    0 10px,
    10px -10px,
    -10px 0px;
  z-index: -1;
  opacity: 0.5;
}

.elo-badge {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  box-shadow: 0 4px 6px -1px rgba(99, 102, 241, 0.3);
  position: relative;
  overflow: hidden;
}

.elo-badge::after {
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

.elo-badge:hover::after {
  opacity: 1;
}

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

.progress-container {
  position: relative;
}

.progress-container::before {
  content: '';
  position: absolute;
  top: -10px;
  left: 0;
  width: 100%;
  height: calc(100% + 20px);
  background: url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%236366F1' fill-opacity='0.03' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='3'/%3E%3Ccircle cx='13' cy='13' r='3'/%3E%3C/g%3E%3C/svg%3E");
  z-index: -1;
}

.top-bar {
  position: relative;
  overflow: hidden;
}

.top-bar::after {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0) 70%);
  animation: pulse-light 5s infinite;
}

.chess-knight {
  position: absolute;
  width: 24px;
  height: 24px;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236366F1' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M17 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2Z'/%3E%3Cpath d='M13 21V7l-6 6'/%3E%3C/svg%3E");
  background-size: contain;
  background-repeat: no-repeat;
  opacity: 0.2;
  z-index: 0;
}

.chess-knight-1 {
  top: 10px;
  right: 10px;
  transform: rotate(15deg);
}

.chess-knight-2 {
  bottom: 10px;
  left: 10px;
  transform: rotate(-15deg);
}

.pulse {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(99, 102, 241, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(99, 102, 241, 0);
  }
}
</style>
