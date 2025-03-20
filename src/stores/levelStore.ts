import { defineStore } from "pinia";
import { computed, ref } from "vue";

// Constants
const BASE_XP_LEVEL_1 = 30;
const XP_MULTIPLIER = 1.6;

export const useLevelStore = defineStore("level", () => {
    // State
    const totalXP = ref(0);

    // Calculate XP needed for a specific level
    function getXPForLevel(level: number): number {
        if (level <= 1) return 0;

        let xpNeeded = BASE_XP_LEVEL_1;
        for (let i = 2; i < level; i++) {
            xpNeeded += Math.floor(
                BASE_XP_LEVEL_1 * Math.pow(XP_MULTIPLIER, i - 1),
            );
        }
        return xpNeeded;
    }
    const totalXPtoNextLevel = computed(() => {
        return getXPForLevel(currentLevel.value + 1);
    });

    // Computed properties
    const currentLevel = computed(() => {
        let level = 1;
        while (totalXP.value >= getXPForLevel(level + 1)) {
            level++;
        }
        return level;
    });

    const neededXPtoNextLevel = computed(() => {
        return getXPForLevel(currentLevel.value + 1) -
            getXPForLevel(currentLevel.value);
    });

    const currentXPInLevel = computed(() => {
        return totalXP.value - getXPForLevel(currentLevel.value);
    });

    const levelProgress = computed(() => {
        return currentXPInLevel.value / neededXPtoNextLevel.value;
    });

    // Actions
    function addXP(amount: number) {
        const previousLevel = currentLevel.value;
        totalXP.value += amount;

        // Return info about level up if it happened
        const newLevel = currentLevel.value;
        const didLevelUp = newLevel > previousLevel;

        return {
            didLevelUp,
            newLevel: didLevelUp ? newLevel : null,
            prevLevel: didLevelUp ? previousLevel : null,
        };
    }

    return {
        // State
        totalXP,

        // Computed
        currentLevel,
        currentXPInLevel,
        neededXPtoNextLevel,
        levelProgress,
        totalXPtoNextLevel,
        // Actions
        addXP,
    };
});
