<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useLevelStore } from '@/stores/levelStore'
import { ref, onMounted, computed } from 'vue'
import ActionButton from '@/components/ActionButton.vue'
import LevelAvatar from '@/components/LevelAvatar.vue'
import confetti from 'canvas-confetti'
import sparkleSound from '@/assets/sounds/magic-sparkle-transition.mp3'

const router = useRouter()
const levelStore = useLevelStore()
const playerLevel = ref(levelStore.currentLevel)
const showLevelUpAnimation = ref(false)
const levelUpComplete = ref(false)
const initialLevel = ref(levelStore.currentLevel)

function continueJourney() {
  if (initialLevel.value === 1) {
    router.push('/login')
  } else {
    router.push('/puzzles')
  }
}

const messageToDisplay = computed(() => {
  if (initialLevel.value === 1) {
    return 'Your journey to chess mastery has begun!'
  }
  const levelUpMessages = [
    "You're thinking like a true tactician! Every puzzle solved sharpens your instincts. Keep going—your next breakthrough is just ahead!",
    'You’re gaining momentum! Grandmasters don’t memorize—they see patterns. Solve more puzzles and unlock your chess intuition!',
    'Your tactical vision is evolving! The best players don’t guess, they calculate. Keep sharpening your mind!',
    'You’ve reached a new milestone! The deeper you go, the faster you think. Let’s push your skills even further!',
    'You’re seeing the board differently now, aren’t you? Every puzzle solved rewires your brain for victory!',
    'Your instincts are getting sharper! Chess isn’t about playing more—it’s about thinking better. Keep training!',
    'You’ve entered the next league of thinkers! The best players don’t wait for opportunities, they create them. Keep solving!',
    'You’re learning to see what others miss. Keep training, and soon you’ll predict moves before they happen!',
    'Double digits! You’re no longer a beginner—your tactical skills are leveling up fast. Let’s go deeper!',
    'Your mind is adapting to chess like never before! Every puzzle solved makes future games easier. Keep the streak alive!',
    'Your calculation speed is increasing! The more you train, the less you rely on luck. Keep sharpening your edge!',
    'You’re entering the realm of serious players! The best are just a few puzzles ahead—catch up!',
    'Your puzzle mastery is reaching new heights! Patterns and traps are becoming second nature. Let’s go further!',
    'You’re building the mind of a grandmaster. Every position you crack brings you closer to true mastery. Keep going!',
  ]
  return levelUpMessages[(initialLevel.value - 1) % levelUpMessages.length]
})

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
  playerLevel.value = levelStore.currentLevel - 1
  initialLevel.value = levelStore.currentLevel - 1
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
        v-if="initialLevel === 1"
        src="@/assets/treasures/treasure-chest.png"
        alt="Treasure Chest"
        class="w-48 h-48 object-contain"
      />
      <img
        v-else
        src="@/assets/treasures/levelup.png"
        alt="Level Up"
        class="w-60 h-60 object-contain"
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
      <p class="text-xl text-yellow-300">{{ messageToDisplay }}</p>
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
