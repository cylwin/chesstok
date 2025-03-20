<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ref, onMounted } from 'vue'
import ActionButton from '@/components/ActionButton.vue'
import LevelAvatar from '@/components/LevelAvatar.vue'
import confetti from 'canvas-confetti'
import sparkleSound from '@/assets/sounds/magic-sparkle-transition.mp3'

const router = useRouter()
const playerLevel = ref(1)
const showLevelUpAnimation = ref(false)
const levelUpComplete = ref(false)

function continueJourney() {
  router.push('/')
}

function triggerLevelUp() {
  showLevelUpAnimation.value = true

  // Shoot confetti
  const duration = 3000
  const end = Date.now() + duration

  const colors = ['#FFD700', '#FFA500', '#FF4500', '#FF6347']

  ;(function frame() {
    confetti({
      particleCount: 4,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: colors,
    })

    confetti({
      particleCount: 4,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: colors,
    })

    if (Date.now() < end) {
      requestAnimationFrame(frame)
    }
  })()

  // Camera shake effect
  document.body.classList.add('screen-shake')

  // Increment level after animation
  setTimeout(() => {
    playerLevel.value++
    // Remove shake effect
    document.body.classList.remove('screen-shake')

    // Show celebration message
    levelUpComplete.value = true
  }, 2000)
}

onMounted(() => {
  const audio = new Audio(sparkleSound)
  setTimeout(() => {
    audio.play()
  }, 100)
  setTimeout(() => {
    triggerLevelUp()
  }, 1000)
})
</script>

<template>
  <div
    class="min-h-screen bg-gradient-to-b from-indigo-900 to-purple-900 flex flex-col items-center"
  >
    <!-- Treasure chest or reward graphic -->
    <div class="treasure-container relative mb-8 mt-8">
      <img
        src="@/assets/treasures/treasure-chest.png"
        alt="Treasure Chest"
        class="w-48 h-48 object-contain"
      />

      <!-- Glow effect -->
      <div class="absolute inset-0 bg-yellow-500 opacity-20 blur-xl rounded-full"></div>
    </div>

    <!-- Level Badge -->
    <div class="level-display flex items-center mb-8">
      <LevelAvatar :level="playerLevel" class="scale-150" />
      <div class="ml-4 text-white">
        <p class="text-lg opacity-80">Your Chess Level</p>
        <h2 class="text-4xl font-bold">{{ playerLevel || '' }}</h2>
      </div>
    </div>

    <!-- Level Up Message -->
    <div v-if="levelUpComplete" class="level-up-message mb-8 text-center">
      <h1 class="text-5xl font-extrabold text-white mb-4">LEVEL UP!</h1>
      <p class="text-xl text-yellow-300">Your journey to chess mastery has begun!</p>
      <!-- <div class="unlocked-features mt-6 bg-white/10 p-4 rounded-lg backdrop-blur-sm">
        <h3 class="text-xl text-yellow-400 mb-2">New Features Unlocked:</h3>
        <ul class="text-white text-left">
          <li class="flex items-center">
            <span class="text-yellow-300 mr-2">✓</span> Access to more challenging puzzles
          </li>
          <li class="flex items-center">
            <span class="text-yellow-300 mr-2">✓</span> Unlock new achievement badges
          </li>
          <li class="flex items-center">
            <span class="text-yellow-300 mr-2">✓</span> Gain entry to the weekly tournament
          </li>
        </ul>
      </div> -->
    </div>

    <!-- Action Buttons -->
    <div class="action-buttons mt-8 flex flex-col items-center" v-if="levelUpComplete">
      <ActionButton type="skip" label="Continue My Journey" class="mt-4" @click="continueJourney" />
    </div>
  </div>
</template>

<style scoped>
.treasure-container {
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-15px) scale(1.02);
  }
}

/* Screen shake animation */
:global(.screen-shake) {
  animation: shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
}

@keyframes shake {
  10%,
  90% {
    transform: translate3d(-1px, 0, 0);
  }
  20%,
  80% {
    transform: translate3d(2px, 0, 0);
  }
  30%,
  50%,
  70% {
    transform: translate3d(-4px, 0, 0);
  }
  40%,
  60% {
    transform: translate3d(4px, 0, 0);
  }
}

/* Level up message animation */
.level-up-message {
  animation: pop-in 0.7s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
}

@keyframes pop-in {
  0% {
    opacity: 0;
    transform: scale(0.5);
  }
  70% {
    transform: scale(1.1);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

.unlocked-features {
  animation: slide-in 0.5s ease-out 0.3s both;
}

@keyframes slide-in {
  0% {
    opacity: 0;
    transform: translateY(30px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.unlocked-features li {
  opacity: 0;
  animation: fade-in 0.5s ease-out forwards;
}

.unlocked-features li:nth-child(1) {
  animation-delay: 0.6s;
}
.unlocked-features li:nth-child(2) {
  animation-delay: 0.9s;
}
.unlocked-features li:nth-child(3) {
  animation-delay: 1.2s;
}

@keyframes fade-in {
  0% {
    opacity: 0;
    transform: translateX(-20px);
  }
  100% {
    opacity: 1;
    transform: translateX(0);
  }
}
</style>
