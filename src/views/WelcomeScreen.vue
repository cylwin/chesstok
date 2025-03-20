<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ref, onMounted } from 'vue'
import ActionButton from '@/components/ActionButton.vue'

const router = useRouter()
const showContent = ref(false)

function startSolving() {
  router.push('/onboarding')
}

onMounted(() => {
  // Trigger animations after component mount
  setTimeout(() => {
    showContent.value = true
  }, 300)
})
</script>

<template>
  <div
    class="min-h-screen bg-gradient-to-b from-indigo-900 to-purple-900 flex flex-col items-center pt-6 px-6"
  >
    <!-- Chess image at the top -->
    <div class="image-container relative mb-2 mt-0">
      <img
        src="@/assets/treasures/daily-challenge.png"
        alt="Chess Puzzles"
        class="h-60 object-contain"
      />
      <!-- Subtle glow effect -->
      <!-- <div class="absolute inset-0 bg-indigo-200 opacity-20 blur-xl rounded-full"></div> -->
    </div>

    <!-- Welcome content -->
    <div :class="['welcome-content max-w-md', { 'show-content': showContent }]">
      <h1 class="text-3xl md:text-4xl font-extrabold text-white mb-6 leading-tight">
        The Fastest Way to Get Better at Chess?
      </h1>

      <div class="text-content space-y-4">
        <p class="text-xl text-yellow-300 font-medium">
          💡 Forget memorizing openings.<br />
          💡 Forget complex theory.
        </p>

        <p class="text-lg text-white">The secret to rapid improvement? <b>Solving puzzles.</b></p>

        <p class="text-lg text-white">
          Every puzzle you solve rewires your brain to find the best move—instantly.
        </p>
      </div>

      <!-- Action Button -->
      <div class="action-button mt-8 pulse-animation w-full">
        <ActionButton class="w-full" type="skip" label="Start Solving" @click="startSolving" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.image-container {
  animation: float 6s ease-in-out infinite;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-15px) scale(1.03);
  }
}

.welcome-content {
  opacity: 0;
  transform: translateY(20px);
  transition:
    opacity 0.8s ease-out,
    transform 0.8s ease-out;
}

.show-content {
  opacity: 1;
  transform: translateY(0);
}

.text-content p {
  opacity: 0;
  transform: translateY(10px);
  animation: fadeIn 0.5s ease-out forwards;
}

.text-content p:nth-child(1) {
  animation-delay: 0.3s;
}
.text-content p:nth-child(2) {
  animation-delay: 0.6s;
}
.text-content p:nth-child(3) {
  animation-delay: 0.9s;
}
.text-content p:nth-child(4) {
  animation-delay: 1.2s;
}

@keyframes fadeIn {
  0% {
    opacity: 0;
    transform: translateY(10px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.pulse-animation {
  animation: pulse 2s infinite;
  animation-delay: 1.5s;
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}
</style>
