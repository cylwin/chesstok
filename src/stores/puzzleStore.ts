import { defineStore } from "pinia";
import { ref } from "vue";
import { supabase } from "../services/supabase";
import { useTimerStore, useUserStore } from "@/stores";

const parseTheme = (themes: string) => {
    if (themes.includes("mateIn1")) {
        return "mateIn1";
    }
    if (themes.includes("hangingPiece")) {
        return "hangingPiece";
    }
    return "other";
};

export const usePuzzleStore = defineStore("puzzle", () => {
    // State
    const fen = ref("");
    const winningMove = ref("");
    const puzzleRating = ref(0);
    const currentPuzzleId = ref("");
    const currentPuzzleTheme = ref("");
    // Feedback state
    const feedbackMessage = ref("");
    const showFeedback = ref(false);
    const feedbackType = ref<"success" | "error" | "info">("info");

    // Store the next puzzle to accelerate loading
    const nextPuzzle = ref<any>(null);

    /**
     * Get a new chess puzzle
     * Uses preloaded puzzle if available, otherwise fetches a new one
     */
    async function getNewPuzzle() {
        console.log("Getting new puzzle", {
            preloaded: nextPuzzle.value?.PuzzleId,
        });
        const timerStore = useTimerStore();
        const userStore = useUserStore();

        // Start a new puzzle timer
        timerStore.startNewPuzzle();

        // Use the preloaded puzzle if available
        let data: any = nextPuzzle.value ? { ...nextPuzzle.value } : null;
        nextPuzzle.value = null;

        // If no preloaded puzzle, fetch one
        if (!data) {
            console.log("No preloaded puzzle, fetching new one");
            data = await userStore.getNewPuzzle();
        }

        if (!data) {
            console.error("Failed to get new puzzle");
            setFeedback("Could not load puzzle. Please try again.", "info");
            return null;
        }

        // Set current puzzle data
        fen.value = data.FEN;
        winningMove.value = data.Moves;
        puzzleRating.value = data.Rating || 600;
        currentPuzzleId.value = data.PuzzleId || "";
        currentPuzzleTheme.value = parseTheme(data.Themes);
        // Preload the next puzzle
        userStore.getNewPuzzle().then((puzzleData) => {
            console.log("Preloaded next puzzle", puzzleData);
            nextPuzzle.value = puzzleData;
            console.log("Preloaded next puzzle");
        });
        console.log("New puzzle loaded");

        return data;
    }

    /**
     * Get a specific puzzle by ID
     */
    async function getPuzzleById(puzzleId: string) {
        // Fetch the specific puzzle
        const { data, error } = await supabase
            .from("puzzles")
            .select("*")
            .eq("PuzzleId", puzzleId)
            .single();

        if (error || !data) {
            console.error("Failed to get puzzle by ID", error);
            setFeedback("Could not load puzzle. Please try again.", "info");
            return null;
        }

        // Set current puzzle data
        fen.value = data.FEN;
        winningMove.value = data.Moves;
        puzzleRating.value = data.Rating || 600;
        currentPuzzleId.value = data.PuzzleId || "";
        currentPuzzleTheme.value = parseTheme(data.Themes);

        return data;
    }

    /**
     * Set feedback message and type, with automatic hiding after delay
     */
    function setFeedback(
        message: string,
        type: "success" | "error" | "info",
        autoHide = true,
    ) {
        feedbackMessage.value = message;
        feedbackType.value = type;
        showFeedback.value = true;

        if (autoHide) {
            // Hide feedback after 2 seconds
            setTimeout(() => {
                showFeedback.value = false;
            }, 2000);
        }
    }

    /**
     * Handle when a puzzle is correctly solved
     */
    function handlePuzzleSolved(
        rating: number,
        newElo: number,
        eloChange: number,
    ) {
        const timerStore = useTimerStore();

        // Record puzzle completion time
        const solveTime = timerStore.recordPuzzleCompletion();
    }

    /**
     * Handle when a puzzle is incorrectly solved
     */
    function handlePuzzleFailed(
        rating: number,
        newElo: number,
        eloChange: number,
    ) {
        const timerStore = useTimerStore();

        // Record puzzle attempt time
        const solveTime = timerStore.recordPuzzleCompletion();

        setFeedback("Incorrect!", "error");
    }

    return {
        // State
        fen,
        winningMove,
        puzzleRating,
        currentPuzzleId,
        feedbackMessage,
        showFeedback,
        feedbackType,
        currentPuzzleTheme,
        nextPuzzle,

        // Actions
        getNewPuzzle,
        getPuzzleById,
        setFeedback,
        handlePuzzleSolved,
        handlePuzzleFailed,
    };
});
