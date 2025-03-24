<script setup lang="ts">
import { useRouter } from 'vue-router'
import ActionButton from '@/components/ActionButton.vue'
import DailyChallenge from '@/components/DailyChallenge.vue'
import WeeklyProgress from '@/components/WeeklyProgress.vue'
import LevelProgress from '@/components/LevelProgress.vue'
import Footer from '@/components/Footer.vue'
import { usePaywallStore } from '@/stores/paywall'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const paywallStore = usePaywallStore()
const userStore = useUserStore()
const goToPuzzles = () => {
  router.push('/puzzles')
}

const goToPremium = () => {
  router.push('/premium')
}

const goToStats = () => {
  router.push('/stats')
}
</script>

<template>
  <div class="">
    <div
      class="pt-5 flex items-center justify-between mb-4 bg-gradient-to-r from-[#6366F1] to-purple-500 text-white relative overflow-hidden animate-gradient"
    >
      <!-- Animated background sparkles -->
      <div class="absolute inset-0 overflow-hidden">
        <div class="sparkle-1"></div>
        <div class="sparkle-2"></div>
        <div class="sparkle-3"></div>
      </div>

      <!-- Subtle glow effect -->
      <div
        class="absolute inset-0 bg-gradient-to-tr from-purple-500/20 to-indigo-500/20 animate-pulse-slow"
      ></div>

      <div
        class="w-32 h-32 flex-shrink-0 ml-4 mr-5 mb-5 relative z-10 hover:scale-105 transition-transform duration-300"
      >
        <img
          src="@/assets/logo_chesstok_transparent.png"
          alt="ChessTok Logo"
          class="w-full h-full object-contain drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] animate-float"
        />
      </div>
      <div class="flex-1 p-5 relative z-10">
        <h1 class="text-xl font-bold mb-2 animate-slide-in">
          Welcome! <span class="inline-block animate-wave">👋</span>
        </h1>
        <p class="animate-fade-in">
          Train your tactical vision with our puzzle feed. <br /><b class="text-yellow-100"
            >Play, solve, and improve!</b
          >
        </p>
      </div>
    </div>

    <!-- Premium Button -->
    <div class="px-4 mb-6" v-if="paywallStore.isPaywallActivated">
      <button
        @click="goToPremium"
        class="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-800 font-bold py-3 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center"
      >
        <span class="mr-2">⭐</span>
        <span>Upgrade to Premium</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5 ml-2"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>

    <!-- Create Account Box -->
    <div class="px-4 mb-6">
      <div
        class="relative bg-gradient-to-br from-indigo-50 to-slate-100 rounded-xl border border-indigo-200 shadow-md p-4 overflow-hidden"
      >
        <!-- Decorative elements -->
        <div
          class="absolute top-0 right-0 -mt-4 -mr-4 w-20 h-20 bg-yellow-400/20 rounded-full blur-2xl"
        ></div>
        <div
          class="absolute bottom-0 left-0 -mb-4 -ml-4 w-16 h-16 bg-indigo-400/20 rounded-full blur-xl"
        ></div>

        <!-- Alert icon and message -->
        <div class="flex items-start mb-3">
          <div class="flex-shrink-0 bg-indigo-100 p-1.5 rounded-full">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5 text-indigo-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-slate-800">Don't lose your progress!</h3>
            <p class="mt-1 text-xs text-slate-600">
              Create an account to save your ratings, puzzles solved, and maintain your winning
              streak.
            </p>
          </div>
        </div>

        <!-- Button -->
        <button
          @click="router.push('/login')"
          class="w-full bg-gradient-to-r from-emerald-400 to-teal-500 text-white font-bold py-3 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center group overflow-hidden relative"
        >
          <span
            class="absolute inset-0 bg-white/10 group-hover:bg-white/20 transition-all duration-300"
          ></span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6 mr-2 text-white/90"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
            />
          </svg>
          <span>Create Your Account</span>
          <span
            class="ml-2 bg-white/20 rounded-full w-6 h-6 flex items-center justify-center group-hover:bg-white/30 transition-all duration-300"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </span>
        </button>

        <!-- Optional badge -->
        <div
          class="absolute top-1 right-1 bg-yellow-400 text-xs text-slate-800 font-bold px-2 py-1 rounded-full shadow-sm z-10"
        >
          FREE!
        </div>
      </div>
    </div>

    <!-- Daily Challenge Section -->
    <div class="mb-4 px-4" v-if="userStore.onboardingCompleted">
      <h2 class="text-xl font-bold text-slate-700 flex-1">Level Progress</h2>
      <div
        class="bg-white rounded-xl shadow-md px-6 py-2 my-2 w-full border border-indigo-200 bg-gradient-to-b from-white to-indigo-50/80"
      >
        <LevelProgress />
      </div>
    </div>
    <div class="mb-4 px-4">
      <DailyChallenge v-if="userStore.onboardingCompleted" />
    </div>
    <div class="flex px-5">
      <ActionButton type="skip" label="Start Solving!" @click="goToPuzzles" />
      <!-- <ActionButton type="hint" label="HINT" @click="goToPuzzles" /> -->
    </div>
    <div class="mt-8 mb-4 px-4">
      <WeeklyProgress v-if="userStore.onboardingCompleted" />
    </div>
    <div class="flex px-5 mb-4">
      <ActionButton
        type="hint"
        label="VIEW STATS"
        @click="goToStats"
        v-if="userStore.onboardingCompleted"
      />
    </div>
    <Footer view="home" />
  </div>
</template>

<style scoped>
@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}

@keyframes wave {
  0%,
  100% {
    transform: rotate(0);
  }
  25% {
    transform: rotate(10deg);
  }
  75% {
    transform: rotate(-5deg);
  }
}

@keyframes sparkle {
  0%,
  100% {
    opacity: 0;
    transform: scale(0);
  }
  50% {
    opacity: 0.8;
    transform: scale(1);
  }
}

.animate-float {
  animation: float 3s ease-in-out infinite;
}

.animate-wave {
  animation: wave 2s ease-in-out infinite;
  transform-origin: bottom center;
}

.animate-pulse-slow {
  animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.animate-gradient {
  background-size: 200% 200%;
  animation: gradientShift 8s ease infinite;
}

.animate-slide-in {
  animation: slideIn 0.8s ease-out forwards;
}

.animate-fade-in {
  animation: fadeIn 1s ease-out forwards;
}

@keyframes gradientShift {
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

@keyframes slideIn {
  from {
    transform: translateX(-20px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.sparkle-1,
.sparkle-2,
.sparkle-3 {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0) 70%);
  pointer-events: none;
}

.sparkle-1 {
  width: 100px;
  height: 100px;
  top: 10%;
  left: 20%;
  animation: sparkle 4s ease-in-out infinite;
  animation-delay: 0s;
}

.sparkle-2 {
  width: 80px;
  height: 80px;
  top: 60%;
  left: 50%;
  animation: sparkle 5s ease-in-out infinite;
  animation-delay: 1s;
}

.sparkle-3 {
  width: 60px;
  height: 60px;
  top: 30%;
  left: 80%;
  animation: sparkle 6s ease-in-out infinite;
  animation-delay: 2s;
}
</style>
