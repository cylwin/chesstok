import { defineStore } from "pinia";
import { Preferences } from "@capacitor/preferences";
import { computed, onMounted, onUnmounted, ref } from "vue";
import { supabase } from "@/services/supabase";
import { App } from "@capacitor/app";

// Keys for storage
const KEYS = {
    APP_OPENINGS: "app_openings",
    LAST_RATING_REQUEST: "last_rating_request",
};

// Define types
interface AppOpening {
    timestamp: number;
}

export const useAppStoreReviewStore = defineStore("appStoreReview", () => {
    // State
    const appOpenings = ref<AppOpening[]>([]);
    const lastRatingRequest = ref<number | null>(null);
    const isLoading = ref(true);
    const listenersInitialized = ref(false);

    // Initialize the store
    async function initialize() {
        isLoading.value = true;

        try {
            // Load app openings
            const openingsData = await Preferences.get({
                key: KEYS.APP_OPENINGS,
            });
            if (openingsData.value) {
                appOpenings.value = JSON.parse(openingsData.value);
            }

            // Load last rating request
            const lastRatingData = await Preferences.get({
                key: KEYS.LAST_RATING_REQUEST,
            });
            if (lastRatingData.value) {
                lastRatingRequest.value = parseInt(lastRatingData.value);
            }

            // Set up app state listeners if not already done
            if (!listenersInitialized.value) {
                setupAppStateListeners();
                listenersInitialized.value = true;
            }
        } catch (error) {
            console.error("Failed to initialize app store review data:", error);
        } finally {
            isLoading.value = false;
        }
    }

    // Set up listeners for app state changes
    function setupAppStateListeners() {
        // Listen for when the app comes to the foreground
        App.addListener("appStateChange", ({ isActive }) => {
            if (isActive) {
                // App came to foreground, log an opening
                logOpening();
            }
        });

        // Also log an opening when the app is first launched
        // This captures the initial launch that might be missed by the state change
        logOpening();
    }

    // Clean up listeners when store is no longer needed
    function cleanup() {
        if (listenersInitialized.value) {
            App.removeAllListeners();
            listenersInitialized.value = false;
        }
    }

    // Save app openings to storage
    async function saveAppOpenings() {
        await Preferences.set({
            key: KEYS.APP_OPENINGS,
            value: JSON.stringify(appOpenings.value),
        });
    }

    // Save last rating request timestamp
    async function saveLastRatingRequest() {
        await Preferences.set({
            key: KEYS.LAST_RATING_REQUEST,
            value: lastRatingRequest.value?.toString() || "",
        });
    }

    // Log each app opening
    async function logOpening() {
        const opening = {
            timestamp: Date.now(),
        };

        appOpenings.value.push(opening);
        await saveAppOpenings();
    }

    // Record that we asked for a rating
    async function recordRatingRequest() {
        lastRatingRequest.value = Date.now();
        await saveLastRatingRequest();
    }

    // Clean up old opening data, keep only the most recent 100 entries
    async function cleanupOldData() {
        if (appOpenings.value.length > 100) {
            appOpenings.value = appOpenings.value.slice(-100);
            await saveAppOpenings();
        }
    }

    // Maybe ask for rating - call this function whenever appropriate in your app
    async function maybeAskForRating() {
        const { data: puzzleAttempts, error } = await supabase
            .from("puzzle_attempts")
            .select("id")
            .eq("outcome", "correct");

        const wins = puzzleAttempts?.length ?? 0;

        if (isLoading.value) return false;

        // Condition 1: At least 3 app openings
        const hasMinimumOpenings = appOpenings.value.length >= 3;

        // Condition 2: At least 20 puzzles completed
        const hasCompletedEnoughPuzzles = wins >= 20;

        // Condition 3: Not asked in the last week
        const oneWeekMs = 7 * 24 * 60 * 60 * 1000;
        const notAskedRecently = !lastRatingRequest.value ||
            (Date.now() - lastRatingRequest.value > oneWeekMs);

        if (
            hasMinimumOpenings && hasCompletedEnoughPuzzles &&
            notAskedRecently
        ) {
            await recordRatingRequest();
            return true;
        }
        return false;
    }

    return {
        initialize,
        cleanup,
        logOpening,
        maybeAskForRating,
        cleanupOldData,
        appOpenings,
        isLoading,
    };
});
