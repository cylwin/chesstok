<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import ChessPuzzle from '../components/ChessPuzzle.vue'
import ActionButton from '../components/ActionButton.vue'
import TreasureProgress from '../components/TreasureProgress.vue'
import { usePuzzleStore } from '@/stores'
import { useUserStore } from '@/stores/user'
import { useRouter } from 'vue-router'
import confetti from 'canvas-confetti'

const puzzleRef = ref<InstanceType<typeof ChessPuzzle> | null>(null)
const puzzleStore = usePuzzleStore()
const userStore = useUserStore()
const router = useRouter()
const treasureProgress = ref(0)

// Fixed puzzles for onboarding
const onboardingPuzzles = ['01GC2', '074Yd', '1aIgX']
const currentPuzzleIndex = ref(0)

// Get the orientation based on whose turn it is in the FEN
const getOrientationFromFen = computed(() => {
  if (!puzzleStore.fen) return 'white'
  const fenParts = puzzleStore.fen.split(' ')
  return fenParts[1] === 'w' ? 'white' : 'black'
})

const verb = computed(() => {
  const MAP_VERB = {
    mateIn1: 'mate',
    hangingPiece: 'take',
    other: 'move',
  }
  return MAP_VERB[puzzleStore.currentPuzzleTheme as keyof typeof MAP_VERB] || 'move'
})

function hint() {
  puzzleRef.value?.showHint()
}

onMounted(async () => {
  // Load the first puzzle
  puzzleStore.getPuzzleById(onboardingPuzzles[0])
})
const errorIndex = ref(0)
const onboardingFeedbackMessage = computed(() => {
  const MAP_FEEDBACK = {
    success: [
      'Boom! You played it like a grandmaster!',
      'Amazing! A surprise reward is waiting… Keep going to claim it!',
      'Brilliant! That was a masterstroke!',
    ],
    error: [
      'So close! A small adjustment and you’ll crack this like a pro.',
      'This position has fooled even the best. Now that you see it, go for it!',
      'You just fell for one of the most common beginner mistakes… But I can tell you’re better than that!',
      'You’re so close! A grandmaster would have played… this 👀 Try again!',
      'Not bad! That was a classic trap…',
      'Wait! You almost had it! One more move and you’ll nail it!',
    ],
  }
  if (puzzleStore.feedbackType === 'error') {
    if (
      errorIndex.value >= MAP_FEEDBACK[puzzleStore.feedbackType as keyof typeof MAP_FEEDBACK].length
    ) {
      errorIndex.value = 0
    }
    return (
      MAP_FEEDBACK[puzzleStore.feedbackType as keyof typeof MAP_FEEDBACK][errorIndex.value] ||
      'Try again!'
    )
  }
  return (
    MAP_FEEDBACK[puzzleStore.feedbackType as keyof typeof MAP_FEEDBACK][currentPuzzleIndex.value] ||
    'Congrats! Keep going!'
  )
})

function handlePuzzleNext() {
  console.log('handlePuzzleNext')
  currentPuzzleIndex.value++
  if (currentPuzzleIndex.value >= onboardingPuzzles.length) {
    userStore.onboardingCompleted = true
    console.log('onboarding completed')
    userStore.updateUserProfile()
    router.push('/level-up')
  } else {
    // Load next puzzle
    puzzleStore.getPuzzleById(onboardingPuzzles[currentPuzzleIndex.value])
  }
}

const defaultsConfetti = {
  spread: 360,
  ticks: 50,
  gravity: 0,
  decay: 0.94,
  startVelocity: 30,
  colors: ['FFE400', 'FFBD00', 'E89400', 'FFCA6C', 'FDFFB8'],
}

function shootStars() {
  confetti({
    ...defaultsConfetti,
    particleCount: 40,
    scalar: 1.2,
    origin: { x: 0.5, y: 0.5 },
    shapes: ['star'],
  })

  confetti({
    ...defaultsConfetti,
    particleCount: 10,
    scalar: 0.75,
    origin: { x: 0.5, y: 0.5 },
    shapes: ['circle'],
  })
}

function handlePuzzleSolved(rating: number, newElo: number, eloChange: number) {
  puzzleStore.handlePuzzleSolved(rating, newElo, eloChange)
  treasureProgress.value++
  if (currentPuzzleIndex.value >= onboardingPuzzles.length) {
    setTimeout(shootStars, 0)
    setTimeout(shootStars, 100)
    setTimeout(shootStars, 200)
  } else {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: {
        y: 0.7,
        x: 0.5,
      },
      colors: ['#6366f1', '#10b981', '#f97316'],
    })
  }
  puzzleStore.setFeedback('Correct!', 'success')
}
</script>

<template>
  <!-- Simple instruction box -->
  <div class="py-1 px-5">
    <div
      v-if="puzzleStore.showFeedback"
      class="text-center font-bold text-md text-white py-1 px-4 mb-2 rounded-lg shadow-inner border flex items-center justify-center gap-2 h-[48px]"
      :class="{
        'bg-gradient-to-r from-green-500 to-green-400 border-green-700':
          puzzleStore.feedbackType === 'success',
        'bg-gradient-to-r from-red-500 to-red-400 border-red-700':
          puzzleStore.feedbackType === 'error',
        'bg-gradient-to-r from-blue-500 to-blue-400 border-blue-700':
          puzzleStore.feedbackType === 'info',
      }"
    >
      {{ onboardingFeedbackMessage }}
    </div>
    <div v-else class="h-[48px] mb-2"></div>
    <div
      v-if="puzzleStore.fen"
      class="instruction-box text-center font-bold text-md text-slate-800 bg-yellow-100 py-1 px-4 rounded-lg shadow-inner border border-yellow-200 flex items-center mx-auto w-auto inline-flex"
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

  <!-- Chess Puzzle Component -->
  <div class="relative">
    <ChessPuzzle
      ref="puzzleRef"
      :fen="puzzleStore.fen"
      :winning-move="puzzleStore.winningMove"
      :puzzle-rating="puzzleStore.puzzleRating"
      :puzzle-id="puzzleStore.currentPuzzleId"
      :is-onboarding="true"
      :borderColor="
        puzzleStore.showFeedback
          ? puzzleStore.feedbackType === 'success'
            ? 'green'
            : puzzleStore.feedbackType === 'error'
              ? 'red'
              : 'black'
          : 'black'
      "
      @solved="handlePuzzleSolved"
      @failed="puzzleStore.handlePuzzleFailed"
      @next="handlePuzzleNext"
      v-if="puzzleStore.fen"
    />
  </div>
  <div class="flex px-5">
    <ActionButton type="hint" label="Hint" @click="hint" />
  </div>
  <div class="flex px-5">
    <TreasureProgress
      v-if="currentPuzzleIndex >= 1"
      :current="treasureProgress"
      :target="onboardingPuzzles.length"
      :animate="true"
    />
  </div>
</template>

<style scoped>
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
</style>
