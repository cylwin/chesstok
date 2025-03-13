import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

export const useTimerStore = defineStore('timer', () => {
  // Load initial state from localStorage if available
  const loadFromStorage = <T>(key: string, defaultValue: T): T => {
    const storedValue = localStorage.getItem(`chess-patterns:${key}`)
    return storedValue ? JSON.parse(storedValue) : defaultValue
  }

  // State
  const elapsedTime = ref(loadFromStorage('elapsedTime', 0)) // Time in seconds
  const isRunning = ref(false)
  const startTime = ref<number | null>(null)
  const timerId = ref<number | null>(null)
  const bestTime = ref<number | null>(loadFromStorage('bestTime', null)) // Best puzzle solving time
  const averageTime = ref<number | null>(loadFromStorage('averageTime', null)) // Average puzzle solving time
  const totalTimeSolved = ref(loadFromStorage('totalTimeSolved', 0)) // Total time spent solving puzzles
  const puzzleStartTime = ref<number | null>(null) // Timestamp when the current puzzle started

  // Save state changes to localStorage
  watch(
    [elapsedTime, bestTime, averageTime, totalTimeSolved],
    ([elapsed, best, average, total]) => {
      localStorage.setItem('chess-patterns:elapsedTime', JSON.stringify(elapsed))
      localStorage.setItem('chess-patterns:bestTime', JSON.stringify(best))
      localStorage.setItem('chess-patterns:averageTime', JSON.stringify(average))
      localStorage.setItem('chess-patterns:totalTimeSolved', JSON.stringify(total))
    },
  )

  // Getters
  const formattedTime = computed(() => {
    const totalSeconds = elapsedTime.value
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60

    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  })

  const formattedBestTime = computed(() => {
    if (bestTime.value === null) return '--:--'

    const minutes = Math.floor(bestTime.value / 60)
    const seconds = bestTime.value % 60

    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  })

  const formattedAverageTime = computed(() => {
    if (averageTime.value === null) return '--:--'

    const minutes = Math.floor(averageTime.value / 60)
    const seconds = Math.round(averageTime.value % 60)

    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  })

  // Methods
  function startTimer() {
    if (isRunning.value) return

    // Set puzzle start time if starting a new puzzle
    if (!puzzleStartTime.value) {
      puzzleStartTime.value = Date.now()
    }

    startTime.value = Date.now() - elapsedTime.value * 1000
    isRunning.value = true

    // Start the timer
    timerId.value = window.setInterval(() => {
      elapsedTime.value = Math.floor((Date.now() - startTime.value!) / 1000)
    }, 1000)
  }

  function pauseTimer() {
    if (!isRunning.value) return

    // Clear the interval
    if (timerId.value !== null) {
      clearInterval(timerId.value)
      timerId.value = null
    }

    isRunning.value = false
  }

  function resetTimer() {
    // Clear the interval
    if (timerId.value !== null) {
      clearInterval(timerId.value)
      timerId.value = null
    }

    elapsedTime.value = 0
    isRunning.value = false
    startTime.value = null
    puzzleStartTime.value = null
  }

  function recordPuzzleCompletion() {
    if (!puzzleStartTime.value) return 0

    const puzzleSolveTime = Math.floor((Date.now() - puzzleStartTime.value) / 1000)

    // Update best time
    if (bestTime.value === null || puzzleSolveTime < bestTime.value) {
      bestTime.value = puzzleSolveTime
    }

    // Update average time
    if (averageTime.value === null) {
      averageTime.value = puzzleSolveTime
    } else {
      const completedPuzzles =
        totalTimeSolved.value > 0 ? Math.round(totalTimeSolved.value / averageTime.value) : 0

      const newTotalPuzzles = completedPuzzles + 1
      averageTime.value = (averageTime.value * completedPuzzles + puzzleSolveTime) / newTotalPuzzles
    }

    // Update total solve time
    totalTimeSolved.value += puzzleSolveTime

    // Reset for next puzzle
    puzzleStartTime.value = null

    return puzzleSolveTime
  }

  function startNewPuzzle() {
    resetTimer()
    puzzleStartTime.value = Date.now()
    startTimer()
  }

  // Return store properties and methods
  return {
    elapsedTime,
    isRunning,
    formattedTime,
    formattedBestTime,
    formattedAverageTime,
    startTimer,
    pauseTimer,
    resetTimer,
    recordPuzzleCompletion,
    startNewPuzzle,
    bestTime,
    averageTime,
    totalTimeSolved,
  }
})
