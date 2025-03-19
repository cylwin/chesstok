<script setup lang="ts">
import { ref, onMounted, watch, onBeforeUnmount, computed } from 'vue'
import { TheChessboard } from 'vue3-chessboard'
import 'vue3-chessboard/style.css'
import type { BoardApi, BoardConfig } from 'vue3-chessboard'
import { useUserStore } from '@/stores'
import standardMove from '@/assets/sounds/standard_Move.mp3'
import ringtoneCorrect from '@/assets/sounds/ringtone-correct.mp3'
import boinkWrong from '@/assets/sounds/boink-wrong.mp3'
const props = defineProps<{
  // FEN string representing the puzzle position
  fen: string
  // The winning move in algebraic notation (e.g. "e2e4" or "a7a8q" for promotion)
  winningMove: string
  // The puzzle ID
  puzzleId: string
  // Puzzle rating (Elo) for calculating user's Elo change
  puzzleRating: number
  // Border color for the board
  borderColor: string
  // Whether the puzzle is onboarding
  isOnboarding: boolean
}>()

// Timer state
const elapsedTime = ref<number>(0)
const timerInterval = ref<number | null>(null)
const formattedTime = ref<string>('0.0')

// Format time as MM:SS
const formattedTimeMMSS = computed(() => {
  const totalSeconds = Math.floor(elapsedTime.value)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
})

// Initialize user store
const userStore = useUserStore()

// Board API reference to interact with the chessboard
const boardAPI = ref<BoardApi | null>(null)
// Track if the puzzle is solved
const isSolved = ref(false)
// Track if the puzzle is failed (wrong move)
const isFailed = ref(false)
// Track highlighted squares for hints
const highlightedSquares = ref<string[]>([])
// Track the new Elo after solving
const newElo = ref<number | null>(null)
// Track Elo change after solving
const eloChange = ref<number>(0)
// Track if the user used a hint
const usedHint = ref<boolean>(false)
// Track if the user used the solution
const usedSolution = ref<boolean>(false)

// Configure the chessboard
const boardConfig = ref<BoardConfig>({
  coordinates: true,
  movable: {
    free: false, // Restrict to legal moves only
    color: 'both', // Allow both colors to move (will be updated based on FEN)
    showDests: true, // Show possible destinations
    events: {
      after: checkWinningMove, // Check if move matches winning move after each move
    },
  },
  highlight: {
    lastMove: true,
    check: true,
  },
  // Will highlight squares when showHint is called
  drawable: {
    enabled: true,
    visible: true,
  },
})

// Define emits
const emit = defineEmits<{
  next: []
  solved: [rating: number, newElo: number, eloChange: number]
  failed: [rating: number, newElo: number, eloChange: number]
}>()

// Expose the showHint method to parent component
defineExpose({ showHint })

// Get the orientation based on whose turn it is in the FEN
function getOrientationFromFen(fen: string): 'white' | 'black' {
  const fenParts = fen.split(' ')
  // The active color is the second field in the FEN string
  const activeColor = fenParts[1]
  return activeColor === 'w' ? 'white' : 'black'
}

// Initialize the board when component is mounted
onMounted(() => {
  console.log('Initializing board')
  updateBoardFromProps()
  startTimer() // Start the timer when component mounts
})

onBeforeUnmount(() => {
  console.log('Unmounting board')
  stopTimer() // Clean up timer when component unmounts
})

// Update board when props change
watch(() => props.fen, updateBoardFromProps)
watch(() => props.winningMove, updateBoardFromProps)

const SOUNDS = {
  move: new Audio(standardMove),
  correct: new Audio(ringtoneCorrect),
  incorrect: new Audio(boinkWrong),
  // epic_fail: new Audio('/sounds/epic_fail.mp3'),
}

function playSound(sound: keyof typeof SOUNDS) {
  const audio = SOUNDS[sound]
  if (audio) {
    audio.play()
  }
}

// Set up the board with the provided FEN and orientation
function updateBoardFromProps() {
  console.log('updateBoardFromProps')
  isSolved.value = false
  isFailed.value = false
  newElo.value = null
  eloChange.value = 0
  resetTimer() // Reset the timer
  startTimer() // Start a new timer

  if (!boardAPI.value) return
  boardAPI.value.resetBoard()
  // Set the board position from FEN
  boardAPI.value.setPosition(props.fen)

  // Set the orientation based on active color in FEN
  const orientation = getOrientationFromFen(props.fen)
  if (orientation === 'white') {
    boardAPI.value?.toggleOrientation()
  }
  const move = props.winningMove.split(' ')[0]
  setTimeout(() => {
    boardAPI.value?.move(move)
    playSound('move')
  }, 400)

  boardConfig.value.movable = {
    ...boardConfig.value.movable,
    color: orientation === 'white' ? 'white' : 'black',
  }

  // Clear any highlighted squares
  clearHints()
}

// Function to show hint by highlighting the piece to move
function showHint() {
  console.log('showHint')
  if (!boardAPI.value || isSolved.value) return
  console.log({ usedHint: usedHint.value })
  usedHint.value = true
  // The winning move is in format like "e2e4"
  // The first two characters represent the source square
  const sourceSquare = props.winningMove.split(' ')[1].substring(0, 2)

  // Clear previous hints
  clearHints()

  boardAPI.value.drawMove(sourceSquare as any, sourceSquare as any, 'red')
  console.log('showHint done')
}

function showSolution() {
  if (!boardAPI.value) return
  const sourceSquare = props.winningMove.split(' ')[1].substring(0, 2)
  const targetSquare = props.winningMove.split(' ')[1].substring(2, 4)

  clearHints()
  boardAPI.value.drawMove(sourceSquare as any, targetSquare as any, 'red')
}

// Function to clear hints
function clearHints() {
  if (!boardAPI.value) return
  boardAPI.value.hideMoves()
}

// Check if the move matches the winning move
function checkWinningMove(from: any, to: any, capture: any) {
  if (!boardAPI.value) return

  // Get the last move from the history
  const history = boardAPI.value.getHistory()
  if (history.length === 0) return

  // Check if the move matches the winning move
  if (from + to === props.winningMove.split(' ')[1]) {
    // Correct move!
    isSolved.value = true
    stopTimer() // Stop the timer on success
    playSound('correct')
    // Calculate Elo change using the user store
    const oldElo = userStore.currentElo
    const currentNewElo = userStore.updateEloAfterPuzzle(
      props.puzzleId,
      props.puzzleRating,
      true,
      usedHint.value,
      usedSolution.value,
      elapsedTime.value,
    )
    newElo.value = currentNewElo
    eloChange.value = currentNewElo - oldElo

    // Emit solved event with puzzle rating and new Elo
    emit('solved', props.puzzleRating, currentNewElo, eloChange.value)

    // Wait 1.5 seconds before emitting next
    setTimeout(
      () => {
        usedHint.value = false
        usedSolution.value = false
        emit('next')
      },
      props.isOnboarding ? 2000 : 1200,
    )
  } else {
    // Wrong move!
    isFailed.value = true
    stopTimer() // Stop the timer on failure
    playSound('incorrect')
    // Calculate Elo change using the user store
    const oldElo = userStore.currentElo
    const currentNewElo = userStore.updateEloAfterPuzzle(
      props.puzzleId,
      props.puzzleRating,
      false,
      usedHint.value,
      usedSolution.value,
      elapsedTime.value,
    )
    console.log('userStore.updateEloAfterPuzzle result : ', { currentNewElo })
    newElo.value = currentNewElo
    eloChange.value = currentNewElo - oldElo

    emit('failed', props.puzzleRating, currentNewElo, eloChange.value)
    console.log({ usedHint: usedHint.value, usedSolution: usedSolution.value })
    if (!usedHint.value) {
      setTimeout(() => {
        updateBoardFromProps()
        usedHint.value = true
        setTimeout(() => {
          showHint()
        }, 500)
      }, 1500)
    } else if (!usedSolution.value) {
      setTimeout(() => {
        updateBoardFromProps()
        usedSolution.value = true
        setTimeout(() => {
          showSolution()
        }, 500)
      }, 1500)
    } else {
      setTimeout(() => {
        emit('next')
      }, 1500)
    }
  }
}

// Handle the API when the board is created
function onBoardCreated(api: BoardApi) {
  boardAPI.value = api
  updateBoardFromProps()
}

// Start the timer
function startTimer() {
  if (timerInterval.value) return

  // Reset timer values
  elapsedTime.value = 0
  formattedTime.value = '0.0'

  // Start interval to update timer every 100ms
  timerInterval.value = window.setInterval(() => {
    elapsedTime.value += 0.1
    formattedTime.value = elapsedTime.value.toFixed(1)
  }, 100)
}

// Stop the timer
function stopTimer() {
  if (timerInterval.value) {
    window.clearInterval(timerInterval.value)
    timerInterval.value = null
  }
}

// Reset the timer
function resetTimer() {
  stopTimer()
  elapsedTime.value = 0
  formattedTime.value = '0.0'
}
</script>

<template>
  <div class="relative w-full max-w-[600px] mx-auto">
    <!-- Chess Board -->
    <div class="px-5 pb-3">
      <div
        class="chess-board rounded-xl relative"
        :class="{
          'shadow-green-500/50 shadow-md': props.borderColor === 'green',
          'shadow-red-500/50 shadow-md': props.borderColor === 'red',
          'shadow-slate-700/30 shadow-sm': props.borderColor === 'black',
        }"
      >
        <div
          class="absolute top-0 left-0 w-full h-full rounded-xl border-4 z-10 pointer-events-none"
          :class="{
            'border-green-500 shadow-green-500/20 shadow-sm': props.borderColor === 'green',
            'border-red-500 shadow-red-500/20 shadow-sm': props.borderColor === 'red',
            'border-slate-700 shadow-slate-700/20 shadow-sm': props.borderColor === 'black',
          }"
        ></div>
        <TheChessboard
          class="rounded-xl"
          :board-config="boardConfig"
          :fen="fen"
          @board-created="onBoardCreated"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes gradient {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

.glowing-border {
  position: relative;
}

.glowing-border::after {
  content: '';
  position: absolute;
  top: -3px;
  left: -3px;
  right: -3px;
  bottom: -3px;
  background: linear-gradient(45deg, #6366f1, #f97316, #10b981, #6366f1);
  z-index: -1;
  border-radius: inherit;
  background-size: 400% 400%;
  animation: gradient 15s ease infinite;
  filter: blur(3px);
  opacity: 0.7;
}
</style>

<style>
cg-board {
  background-image: url('data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4PSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIgogICAgIHZpZXdCb3g9IjAgMCA4IDgiIHNoYXBlLXJlbmRlcmluZz0iY3Jpc3BFZGdlcyI+CjxnIGlkPSJhIj4KICA8ZyBpZD0iYiI+CiAgICA8ZyBpZD0iYyI+CiAgICAgIDxnIGlkPSJkIj4KICAgICAgICA8cmVjdCB3aWR0aD0iMSIgaGVpZ2h0PSIxIiBmaWxsPSIjRTRFNUU2IiBpZD0iZSIvPgogICAgICAgIDx1c2UgeD0iMSIgeT0iMSIgaHJlZj0iI2UiIHg6aHJlZj0iI2UiLz4KICAgICAgICA8cmVjdCB5PSIxIiB3aWR0aD0iMSIgaGVpZ2h0PSIxIiBmaWxsPSIjNUJBNUM2IiBpZD0iZiIvPgogICAgICAgIDx1c2UgeD0iMSIgeT0iLTEiIGhyZWY9IiNmIiB4OmhyZWY9IiNmIi8+CiAgICAgIDwvZz4KICAgICAgPHVzZSB4PSIyIiBocmVmPSIjZCIgeDpocmVmPSIjZCIvPgogICAgPC9nPgogICAgPHVzZSB4PSI0IiBocmVmPSIjYyIgeDpocmVmPSIjYyIvPgogIDwvZz4KICA8dXNlIHk9IjIiIGhyZWY9IiNiIiB4OmhyZWY9IiNiIi8+CjwvZz4KPHVzZSB5PSI0IiBocmVmPSIjYSIgeDpocmVmPSIjYSIvPgo8L3N2Zz4K') !important;
}
</style>
