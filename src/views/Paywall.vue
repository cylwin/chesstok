<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const selectedPlan = ref('annual')

const goBack = () => {
  router.back()
}

const subscribeNow = () => {
  // This would be connected to a payment processor in a real implementation
  console.log(`Selected plan: ${selectedPlan.value}`)
  // After successful payment, redirect to the appropriate page
}
</script>

<template>
  <div
    class="flex flex-col items-center p-5 bg-gradient-to-b from-indigo-50 to-purple-50 min-h-screen"
  >
    <!-- Header -->
    <div class="text-center mb-4 mt-2">
      <h1 class="text-3xl font-extrabold text-indigo-600 mb-2">
        Learn Faster. Play Smarter. Win More.
      </h1>
      <p class="text-lg text-gray-600 max-w-lg mx-auto">
        You've made great progress already—but imagine how far you could go...
      </p>
    </div>

    <!-- Benefits -->
    <div class="bg-white rounded-2xl shadow-lg p-4 w-full max-w-2xl mb-8">
      <h2 class="text-xl font-bold text-indigo-600 mb-2">Why Upgrade to Premium?</h2>

      <div class="space-y-2">
        <div class="flex items-start">
          <span class="text-green-500 mr-2 text-xl">✅</span>
          <div>
            <span class="font-semibold">Unlimited Chess Puzzles:</span>
            <span class="text-gray-600">
              Boost your tactical vision and start seeing moves others don't.</span
            >
          </div>
        </div>

        <div class="flex items-start">
          <span class="text-green-500 mr-2 text-xl">✅</span>
          <div>
            <span class="font-semibold">No Ads:</span>
            <span class="text-gray-600">
              Stay focused on your game, without any interruptions.</span
            >
          </div>
        </div>

        <!-- <div class="flex items-start">
          <span class="text-green-500 mr-2 text-xl">✅</span>
          <div>
            <span class="font-semibold">Gain the Competitive Edge:</span>
            <span class="text-gray-600">
              Avoid regret when your friends start winning more games.</span
            >
          </div>
        </div> -->
      </div>
    </div>

    <!-- CTA Button -->
    <div class="mb-4">
      <div class="text-center mb-4">
        <span class="text-2xl font-bold text-indigo-500">🔥 Ready to Level Up?</span>
      </div>
    </div>

    <!-- Pricing Cards -->
    <div class="flex flex-row gap-4 w-full max-w-6xl mb-8 justify-center">
      <!-- Monthly Plan -->
      <div
        class="relative bg-white rounded-3xl shadow-lg p-4 flex flex-col items-center transform hover:scale-105 flex-1 max-w-[30%]"
        :class="{ 'ring-2 ring-indigo-200': selectedPlan === 'monthly' }"
        @click="selectedPlan = 'monthly'"
      >
        <div
          class="bg-indigo-400 text-white px-3 py-0.5 rounded-full font-bold text-xs absolute -top-2"
        >
          FLEXIBLE
        </div>
        <h2 class="text-xl font-bold text-indigo-500 mt-3">Monthly</h2>
        <div class="text-base font-bold text-gray-700 mt-1">
          $6.99<span class="text-xs text-gray-500">/mo</span>
        </div>
        <div class="text-xl font-bold text-gray-700 mt-2">$6.99</div>
        <div class="mt-3 w-full">
          <div
            class="w-6 h-6 rounded-full border-2 border-indigo-500 flex items-center justify-center mx-auto"
            :class="{ 'bg-green-500 border-green-500': selectedPlan === 'monthly' }"
          >
            <svg
              v-if="selectedPlan === 'monthly'"
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5 text-white"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
        </div>
      </div>

      <!-- Annual Plan -->
      <div
        class="relative bg-indigo-500 rounded-3xl shadow-xl p-4 flex flex-col items-center transform hover:scale-105 z-10 scale-105 flex-1 max-w-[30%]"
        :class="{ 'ring-3 ring-yellow-300': selectedPlan === 'annual' }"
        @click="selectedPlan = 'annual'"
      >
        <div
          class="bg-yellow-400 text-gray-800 px-3 py-0.5 rounded-full font-bold text-xs absolute -top-2"
        >
          POPULAR
        </div>
        <h2 class="text-xl font-bold text-white mt-3">Annual</h2>
        <div class="text-base font-bold text-indigo-100 mt-1">
          $2.50<span class="text-xs text-indigo-200">/mo</span>
        </div>
        <div class="text-xl font-bold text-white mt-2">$29.99</div>
        <div class="mt-3 w-full">
          <div
            class="w-6 h-6 rounded-full border-2 border-yellow-300 flex items-center justify-center mx-auto"
            :class="{ 'bg-green-500 border-green-500': selectedPlan === 'annual' }"
          >
            <svg
              v-if="selectedPlan === 'annual'"
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5 text-white"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
        </div>
      </div>

      <!-- Lifetime Plan -->
      <div
        class="relative bg-white rounded-3xl shadow-lg p-4 flex flex-col items-center transform hover:scale-105 flex-1 max-w-[30%]"
        :class="{ 'ring-2 ring-indigo-200': selectedPlan === 'lifetime' }"
        @click="selectedPlan = 'lifetime'"
      >
        <div
          class="bg-indigo-400 text-white px-3 py-0.5 rounded-full font-bold text-xs absolute -top-2"
        >
          BEST VALUE
        </div>
        <h2 class="text-xl font-bold text-indigo-500 mt-3">Lifetime</h2>
        <div class="text-base font-bold text-gray-700 mt-1">One-time</div>
        <div class="text-xl font-bold text-gray-700 mt-2">$49.99</div>
        <div class="mt-3 w-full">
          <div
            class="w-6 h-6 rounded-full border-2 border-indigo-500 flex items-center justify-center mx-auto"
            :class="{ 'bg-green-500 border-green-500': selectedPlan === 'lifetime' }"
          >
            <svg
              v-if="selectedPlan === 'lifetime'"
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5 text-white"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Add any component-specific styles here */
</style>
