import { supabase } from "@/services/supabase";
import dayjs from "dayjs";
import { defineStore } from "pinia";
import { computed, onMounted, ref, watch } from "vue";

const INITIAL_ELO = 300;
const DAILY_CHALLENGE_GOAL = 10;

export const useUserStore = defineStore("user", () => {
  // State
  const currentElo = ref(INITIAL_ELO);
  const currentStreak = ref(0);
  const highestStreak = ref(0);
  const puzzlesSolved = ref(0);
  const puzzlesAttempted = ref(0);

  const dailyChallenge = ref(0);
  const dailyChallengeCurrentDate = ref<string | null>(null);
  const dailyChallengeStreak = ref(0);
  const dailyChallengeLastDayCompleted = ref<string | null>(null);
  console.log("UserStore initialized");

  const init = async () => {
    console.log("onMounted");

    const { data } = await supabase.auth.getSession();

    // Only sign in anonymously if no session exists
    if (!data.session) {
      console.log("No existing session found, creating anonymous user");
      await signInAnonymously();
    } else {
      console.log("Existing session found, using current user");
    }

    const currentDate = new Date().toISOString().split("T")[0];
    const { data: authData } = await supabase.auth.getUser();
    const user = authData?.user;
    let { data: userProfile } = await supabase.from("profiles").select("*")
      .eq(
        "user_id",
        user?.id,
      ).maybeSingle();
    console.log("userProfile", userProfile);
    if (!userProfile) {
      userProfile = await supabase.from("profiles").insert({
        user_id: user?.id,
        elo: INITIAL_ELO,
        current_streak: 0,
        highest_streak: 0,
        daily_challenge_streak: 0,
        daily_challenge_last_day_completed: null,
      }).select("*").single();
    }

    // If user profile data exists, update local state
    if (userProfile) {
      // Check if daily challenge streak should be reset
      if (userProfile.daily_challenge_last_day_completed) {
        const lastCompletedDate = dayjs(
          userProfile.daily_challenge_last_day_completed,
        );
        const yesterday = dayjs().subtract(1, "day");

        // Reset streak if last completed day is before yesterday (missed a day)
        if (lastCompletedDate.isBefore(yesterday, "day")) {
          // Reset streak in database
          await supabase.from("profiles").update({
            daily_challenge_streak: 0,
          }).eq("user_id", user?.id);

          // Update local state
          dailyChallenge.value = 0;
        } else {
          // Keep existing streak
          dailyChallenge.value = userProfile.daily_challenge_streak || 0;
        }
      }

      // Update other user stats from database
      currentElo.value = userProfile.elo || INITIAL_ELO;
      currentStreak.value = userProfile.current_streak || 0;
      highestStreak.value = userProfile.highest_streak || 0;
    }
    if (dailyChallengeCurrentDate.value === null) {
      dailyChallengeCurrentDate.value = currentDate;
    }

    if (dailyChallengeCurrentDate.value !== currentDate) {
      dailyChallenge.value = 0;
      dailyChallengeCurrentDate.value = currentDate;
    }
  };

  // Save state changes to localStorage
  watch(
    [currentElo, currentStreak, highestStreak],
    async ([elo, streak, highest]) => {
      // Update user profile in Supabase
      const { data: authData } = await supabase.auth.getUser();
      const user = authData?.user;

      if (streak > highestStreak.value) {
        highestStreak.value = streak;
      }

      if (user) {
        await supabase.from("profiles").update({
          elo: elo,
          current_streak: streak,
          highest_streak: highest,
          daily_challenge_streak: dailyChallenge.value,
        }).eq("user_id", user.id);

        const { data: correctAttempts } = await supabase.from("puzzle_attempts")
          .select("*")
          .eq("outcome", "correct")
          .gte("created_at", dayjs().startOf("day").toISOString());

        dailyChallenge.value = correctAttempts?.length || 0;

        if (
          dailyChallenge.value > DAILY_CHALLENGE_GOAL &&
          dailyChallengeLastDayCompleted.value !=
            dayjs().toISOString().split("T")[0]
        ) {
          dailyChallengeStreak.value++;
          dailyChallengeLastDayCompleted.value =
            dayjs().toISOString().split("T")[0];
        }
      }
    },
    { immediate: true },
  );

  /**
   * Calculate expected score based on Elo ratings difference
   * @param userRating - Current user Elo rating
   * @param puzzleRating - Puzzle Elo rating
   * @returns Expected score between 0 and 1
   */
  function calculateExpectedScore(
    userRating: number,
    puzzleRating: number,
  ): number {
    return 1 / (1 + Math.pow(10, (puzzleRating - userRating) / 400));
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
    return Math.round(currentRating + kFactor * (actualScore - expectedScore));
  }

  /**
   * Get a new puzzle within ~40 ELO points of the user's current rating
   * and that hasn't been attempted before
   * @returns Promise with puzzle data or null if no suitable puzzle found
   */
  async function getNewPuzzle() {
    try {
      // Get current user
      const { data: authData } = await supabase.auth.getUser();
      const user = authData?.user;

      // Calculate ELO range (current ELO ± 40)
      const minElo = Math.max(300, currentElo.value - 40);
      const maxElo = Math.max(450, currentElo.value + 40);

      if (user) {
        const { data: attemptedPuzzles, error: attemptedError } = await supabase
          .from("puzzle_attempts")
          .select("puzzle_id")
          .eq("user_id", user?.id);
        // Single query with a NOT EXISTS approach
        const { data, error } = await supabase
          .from("puzzles")
          .select("*")
          .gte("Rating", minElo)
          .lte("Rating", maxElo)
          .not(
            "PuzzleId",
            "in",
            `(${attemptedPuzzles?.map((p) => `"${p.puzzle_id}"`).join(",")})`,
          )
          .limit(1)
          .single();

        if (error) {
          console.error("Error fetching puzzle:", error);

          // If no puzzles found within the ELO range that haven't been attempted,
          // try again with a wider range
          if (error.code === "PGRST116") {
            console.log("No new puzzles found in range, widening search...");
            const { data: fallbackData, error: fallbackError } = await supabase
              .from("puzzles")
              .select("*")
              .limit(1)
              .single();

            if (fallbackError) {
              console.error("Error fetching fallback puzzle:", fallbackError);
              return null;
            }

            return fallbackData;
          }

          return null;
        }

        return data;
      } else {
        console.warn("No user found");
        return null;
      }
    } catch (err) {
      console.error("Failed to get new puzzle:", err);
      return null;
    }
  }

  /**
   * Log a puzzle attempt to Supabase
   * @param puzzleId - ID of the puzzle attempted
   * @param initialElo - User's ELO before attempt
   * @param newElo - User's ELO after attempt
   * @param outcome - Result of the attempt (correct/incorrect)
   * @param usedHint - Whether the user used a hint
   * @param usedSolution - Whether the user used the solution
   * @param timeToSolve - Time taken to solve in milliseconds
   * @returns Promise with the insert result
   */
  async function logPuzzleAttempt(
    puzzleId: string,
    initialElo: number,
    newElo: number,
    outcome: "correct" | "incorrect" | "skipped",
    usedHint: boolean,
    usedSolution: boolean,
    timeToSolve: number,
  ): Promise<void> {
    try {
      console.log("logPuzzleAttempt");
      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        console.warn("Cannot log puzzle attempt: No authenticated user");
        return;
      }

      const { error } = await supabase.from("puzzle_attempts").insert({
        puzzle_id: puzzleId,
        user_id: user.id,
        elo_initial: initialElo,
        new_elo: newElo,
        outcome: outcome,
        used_hint: usedHint,
        used_solution: usedSolution,
        time_to_solve: Math.round(timeToSolve),
      });

      if (error) {
        console.error("Error logging puzzle attempt:", error);
      }
    } catch (err) {
      console.error("Failed to log puzzle attempt:", err);
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
    usedSolution: boolean = false,
    timeToSolve: number = 0,
  ): number {
    console.log("updateEloAfterPuzzle");
    const initialElo = currentElo.value;
    const expectedScore = calculateExpectedScore(initialElo, puzzleRating);
    const actualScore = isCorrect ? 1 : 0;
    let newElo = calculateNewElo(initialElo, expectedScore, actualScore);
    if (usedHint || usedSolution) {
      newElo = initialElo;
    } else {
      puzzlesAttempted.value++;
    }
    console.log({ usedHint, usedSolution, newElo, initialElo });
    // Update user stats
    currentElo.value = newElo;

    if (isCorrect && !usedHint && !usedSolution) {
      puzzlesSolved.value++;
      dailyChallenge.value++;
      currentStreak.value++;
      // Update highest streak if current streak is higher
      if (currentStreak.value > highestStreak.value) {
        highestStreak.value = currentStreak.value;
      }
    } else {
      // Reset streak on incorrect answer
      currentStreak.value = 0;
    }

    // Log the attempt to Supabase
    logPuzzleAttempt(
      puzzleId,
      initialElo,
      newElo,
      isCorrect ? "correct" : "incorrect",
      usedHint,
      usedSolution,
      timeToSolve,
    );

    return newElo;
  }

  async function signInAnonymously(): Promise<void> {
    const { data, error } = await supabase.auth.signInAnonymously();
    console.log(data);
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
    dailyChallengeStreak,
    DAILY_CHALLENGE_GOAL,

    // Getters

    // Actions
    init,
    updateEloAfterPuzzle,
    signInAnonymously,
    logPuzzleAttempt,
    getNewPuzzle,
  };
});
