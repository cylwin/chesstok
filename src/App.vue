<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, ref } from 'vue'
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { usePaywallStore } from '@/stores/paywall'
import { useAppStoreReviewStore } from '@/stores/appstoreReview'
import { Capacitor } from '@capacitor/core'

const router = useRouter()
const isIOS = ref(false)

const paywallStore = usePaywallStore()
const appReviewStore = useAppStoreReviewStore()

onMounted(async () => {
  const userStore = useUserStore()
  await userStore.init()
  console.log('userStore.onboardingCompleted', userStore.onboardingCompleted)
  if (!userStore.onboardingCompleted) {
    router.push('/welcome')
  }

  // Use Capacitor's platform detection
  isIOS.value = Capacitor.getPlatform() === 'ios'
})

onBeforeUnmount(() => {
  appReviewStore.cleanup()
})

const route = useRoute()
const isHomeView = computed(() => {
  return route.name === 'home'
})
const isOnboardingView = computed(() => {
  return route.name === 'onboarding'
})
const isWelcomeView = computed(() => {
  return route.name === 'welcome'
})

const goToHome = () => {
  router.push('/')
}

const goToPremium = () => {
  router.push('/premium')
}
</script>

<template>
  <div class="flex flex-col min-h-screen">
    <!-- Top Bar -->
    <div class="app-container min-h-screen overflow-hidden">
      <div
        v-if="isIOS && !isHomeView && !isWelcomeView"
        class="h-12 bg-gradient-to-r from-[#6366F1] to-purple-500"
      ></div>
      <div
        class="top-bar bg-gradient-to-r from-[#6366F1] to-purple-500 text-white flex justify-between items-center relative p-4"
        v-if="!isHomeView && !isWelcomeView"
      >
        <div class="flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-7 w-7 mr-2 cursor-pointer"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            @click="goToHome"
            v-if="!isOnboardingView"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M11 17l-5-5m0 0l5-5m-5 5h12"
            />
          </svg>
          <span class="font-extrabold text-xl tracking-wide">ChessTok</span>
        </div>

        <!-- Premium Button -->
        <button
          @click="goToPremium"
          v-if="paywallStore.isPaywallActivated"
          class="bg-yellow-400 text-gray-800 font-bold text-sm py-1.5 px-3 rounded-full flex items-center transition-all hover:bg-yellow-500"
        >
          <span class="mr-1">⭐</span>
          <span>Premium</span>
        </button>
      </div>
      <main class="flex-1">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<style>
/* Additional styles that enhance Tailwind */
.router-link-active:after {
  width: 100% !important;
}

.app-container {
  background: linear-gradient(to bottom, #ffffff, #f8fafc);
  box-shadow:
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
  position: relative;
  overflow: hidden;
}

.app-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 5px;
  background: linear-gradient(90deg, #6366f1, #8b5cf6, #f97316, #10b981);
  z-index: 10;
}
</style>
