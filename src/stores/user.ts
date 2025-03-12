import { supabase } from '@/services/supabase'
import { defineStore } from 'pinia'
import { ref, computed, watch, onMounted } from 'vue'

export const useUserStore = defineStore('user', () => {
  // Load initial state from localStorage if available
  const loadFromStorage = <T>(key: string, defaultValue: T): T => {
    const storedValue = localStorage.getItem(`chess-patterns:${key}`)
    return storedValue ? JSON.parse(storedValue) : defaultValue
  }

  // State
  const initialElo = 300
  const currentElo = ref(loadFromStorage('currentElo', initialElo))
  const currentStreak = ref(loadFromStorage('currentStreak', 0))
  const highestStreak = ref(loadFromStorage('highestStreak', 0))
  const puzzlesSolved = ref(loadFromStorage('puzzlesSolved', 0))
  const puzzlesAttempted = ref(loadFromStorage('puzzlesAttempted', 0))
  const dailyChallenge = ref(loadFromStorage('dailyChallenge', 0))
  const dailyChallengeCurrentDate = ref<string | null>(
    loadFromStorage('dailyChallengeCurrentDate', null),
  )

  onMounted(() => {
    const currentDate = new Date().toISOString().split('T')[0]
    if (dailyChallengeCurrentDate.value === null) {
      dailyChallengeCurrentDate.value = currentDate
    }

    if (dailyChallengeCurrentDate.value !== currentDate) {
      dailyChallenge.value = 0
      dailyChallengeCurrentDate.value = currentDate
    }
  })

  // Save state changes to localStorage
  watch(
    [currentElo, currentStreak, highestStreak, puzzlesSolved, puzzlesAttempted],
    ([elo, streak, highest, solved, attempted]) => {
      localStorage.setItem('chess-patterns:currentElo', JSON.stringify(elo))
      localStorage.setItem('chess-patterns:currentStreak', JSON.stringify(streak))
      localStorage.setItem('chess-patterns:highestStreak', JSON.stringify(highest))
      localStorage.setItem('chess-patterns:puzzlesSolved', JSON.stringify(solved))
      localStorage.setItem('chess-patterns:puzzlesAttempted', JSON.stringify(attempted))
      localStorage.setItem('chess-patterns:dailyChallenge', JSON.stringify(dailyChallenge.value))
      localStorage.setItem(
        'chess-patterns:dailyChallengeCurrentDate',
        JSON.stringify(dailyChallengeCurrentDate.value),
      )
    },
  )

  // Getters
  const winRate = computed(() => {
    if (puzzlesAttempted.value === 0) return 0
    return Math.round((puzzlesSolved.value / puzzlesAttempted.value) * 100)
  })

  /**
   * Calculate expected score based on Elo ratings difference
   * @param userRating - Current user Elo rating
   * @param puzzleRating - Puzzle Elo rating
   * @returns Expected score between 0 and 1
   */
  function calculateExpectedScore(userRating: number, puzzleRating: number): number {
    return 1 / (1 + Math.pow(10, (puzzleRating - userRating) / 400))
  }

  /**
   * Calculate new Elo rating based on current rating, expected score and actual result
   * @param currentRating - Current user Elo rating
   * @param expectedScore - Expected score calculated from Elo difference
   * @param actualScore - Actual result (1 for win, 0 for loss)
   * @param kFactor - K-factor for Elo calculation (default: 20)
   * @returns New Elo rating
   */
  function calculateNewElo(
    currentRating: number,
    expectedScore: number,
    actualScore: number,
    kFactor: number = 20,
  ): number {
    return Math.round(currentRating + kFactor * (actualScore - expectedScore))
  }

  /**
   * Get a new puzzle within ~40 ELO points of the user's current rating
   * and that hasn't been attempted before
   * @returns Promise with puzzle data or null if no suitable puzzle found
   */
  async function getNewPuzzle() {
    try {
      // Get current user
      const { data: authData } = await supabase.auth.getUser()
      const user = authData?.user

      // Calculate ELO range (current ELO ± 40)
      const minElo = Math.max(100, currentElo.value - 40)
      const maxElo = currentElo.value + 40

      if (user) {
        const { data: attemptedPuzzles, error: attemptedError } = await supabase
          .from('puzzle_attempts')
          .select('puzzle_id')
          .eq('user_id', user?.id)
        // Single query with a NOT EXISTS approach
        const { data, error } = await supabase
          .from('puzzles')
          .select('*')
          .gte('Rating', minElo)
          .lte('Rating', maxElo)
          .not('PuzzleId', 'in', `(${attemptedPuzzles?.map((p) => `'${p.puzzle_id}'`).join(',')})`)
          .limit(1)
          .single()

        if (error) {
          console.error('Error fetching puzzle:', error)

          // If no puzzles found within the ELO range that haven't been attempted,
          // try again with a wider range
          if (error.code === 'PGRST116') {
            console.log('No new puzzles found in range, widening search...')
            const { data: fallbackData, error: fallbackError } = await supabase
              .from('puzzles')
              .select('*')
              .limit(1)
              .single()

            if (fallbackError) {
              console.error('Error fetching fallback puzzle:', fallbackError)
              return null
            }

            return fallbackData
          }

          return null
        }

        return data
      } else {
        console.warn('No user found')
        return null
      }
    } catch (err) {
      console.error('Failed to get new puzzle:', err)
      return null
    }
  }

  /**
   * Log a puzzle attempt to Supabase
   * @param puzzleId - ID of the puzzle attempted
   * @param initialElo - User's ELO before attempt
   * @param newElo - User's ELO after attempt
   * @param outcome - Result of the attempt (correct/incorrect)
   * @param usedHint - Whether the user used a hint
   * @param timeToSolve - Time taken to solve in milliseconds
   * @returns Promise with the insert result
   */
  async function logPuzzleAttempt(
    puzzleId: string,
    initialElo: number,
    newElo: number,
    outcome: 'correct' | 'incorrect' | 'skipped',
    usedHint: boolean,
    timeToSolve: number,
  ): Promise<void> {
    try {
      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        console.warn('Cannot log puzzle attempt: No authenticated user')
        return
      }

      const { error } = await supabase.from('puzzle_attempts').insert({
        puzzle_id: puzzleId,
        user_id: user.id,
        elo_initial: initialElo,
        new_elo: newElo,
        outcome: outcome,
        used_hint: usedHint,
        time_to_solve: Math.round(timeToSolve),
      })

      if (error) {
        console.error('Error logging puzzle attempt:', error)
      }
    } catch (err) {
      console.error('Failed to log puzzle attempt:', err)
    }
  }

  /**
   * Update user's Elo rating after solving a puzzle
   * @param puzzleId - ID of the puzzle
   * @param puzzleRating - Elo rating of the puzzle
   * @param isCorrect - Whether the user solved the puzzle correctly
   * @param usedHint - Whether the user used a hint
   * @param timeToSolve - Time taken to solve in milliseconds
   */
  function updateEloAfterPuzzle(
    puzzleId: string,
    puzzleRating: number,
    isCorrect: boolean,
    usedHint: boolean = false,
    timeToSolve: number = 0,
  ): number {
    const initialElo = currentElo.value
    const expectedScore = calculateExpectedScore(initialElo, puzzleRating)
    const actualScore = isCorrect ? 1 : 0
    const newElo = calculateNewElo(initialElo, expectedScore, actualScore)

    // Update user stats
    currentElo.value = newElo
    puzzlesAttempted.value++

    if (isCorrect) {
      puzzlesSolved.value++
      dailyChallenge.value++
      currentStreak.value++
      // Update highest streak if current streak is higher
      if (currentStreak.value > highestStreak.value) {
        highestStreak.value = currentStreak.value
      }
    } else {
      // Reset streak on incorrect answer
      currentStreak.value = 0
    }

    // Log the attempt to Supabase
    logPuzzleAttempt(
      puzzleId,
      initialElo,
      newElo,
      isCorrect ? 'correct' : 'incorrect',
      usedHint,
      timeToSolve,
    )

    return newElo
  }

  /**
   * Skip the current puzzle (no Elo change)
   * @param puzzleId - ID of the puzzle being skipped
   * @param puzzleRating - Rating of the puzzle being skipped
   */
  async function skipPuzzle(puzzleId: string, puzzleRating: number): Promise<void> {
    // Reset streak when skipping
    currentStreak.value = 0
    puzzlesAttempted.value++

    // Log the skipped attempt
    await logPuzzleAttempt(
      puzzleId,
      currentElo.value,
      currentElo.value, // No ELO change when skipping
      'skipped',
      false,
      0,
    )
  }

  /**
   * Reset user stats to initial values
   */
  function resetStats(): void {
    currentElo.value = initialElo
    currentStreak.value = 0
    highestStreak.value = 0
    puzzlesSolved.value = 0
    puzzlesAttempted.value = 0
  }

  async function signInAnonymously(): Promise<void> {
    const { data, error } = await supabase.auth.signInAnonymously()
    console.log(data)
  }

  return {
    // State
    currentElo,
    currentStreak,
    highestStreak,
    puzzlesSolved,
    puzzlesAttempted,
    dailyChallenge,
    dailyChallengeCurrentDate,

    // Getters
    winRate,

    // Actions
    updateEloAfterPuzzle,
    skipPuzzle,
    resetStats,
    signInAnonymously,
    logPuzzleAttempt,
    getNewPuzzle,
  }
})
