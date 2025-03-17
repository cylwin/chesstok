import { defineStore } from "pinia";
import { ref } from "vue";

export const usePaywallStore = defineStore("paywall", () => {
    // Track whether the paywall is activated
    const isPaywallActivated = ref(false);

    // Function to check if paywall should be shown
    function shouldShowPaywall() {
        return isPaywallActivated.value;
    }

    return {
        isPaywallActivated,
        shouldShowPaywall,
    };
});
