<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue'

// Props pour rendre le composant configurable
const props = defineProps({
  // La valeur actuelle de progression
  current: {
    type: Number,
    required: true,
  },
  // La valeur cible à atteindre
  target: {
    type: Number,
    required: true,
  },
  // Si true, anime la progression; si false, affiche immédiatement
  animate: {
    type: Boolean,
    default: false,
  },
})

// Valeur animée de la progression
const animatedProgress = ref(0)

const progressPercentage = computed(() => {
  // Limiter le pourcentage à 100% maximum
  return Math.min((animatedProgress.value / props.target) * 100, 100)
})

// Fonction pour animer la progression
const animateProgress = (startAt = 0) => {
  // Si l'animation est désactivée, définir directement la valeur
  if (!props.animate) {
    animatedProgress.value = props.current
    return
  }

  // Calculer la durée en fonction de la valeur à animer (mais avec un maximum raisonnable)
  const duration = Math.min(2000, props.current * 100)
  const start = startAt
  const end = props.current
  const startTime = Date.now()

  const animate = () => {
    const now = Date.now()
    const elapsed = now - startTime

    if (elapsed < duration) {
      animatedProgress.value = start + (end - start) * (elapsed / duration)
      requestAnimationFrame(animate)
    } else {
      animatedProgress.value = end
    }
  }

  animate()
}

// Réinitialiser l'animation si la valeur de progression change
watch(
  () => props.current,
  (_, oldValue) => {
    animateProgress(oldValue)
  },
)

// Initialiser à l'affichage
onMounted(() => {
  animateProgress()
})
</script>

<template>
  <div class="bg-white rounded-xl shadow-md px-6 py-2 my-2 w-full">
    <div class="flex justify-between items-center mb-4"></div>
    <div class="relative h-16 mb-4">
      <!-- Fond de la barre de progression -->
      <div
        class="absolute top-1/2 left-0 right-0 h-3 bg-gray-200 transform -translate-y-1/2 rounded-full"
      >
        <!-- Remplissage basé sur la progression actuelle -->
        <div
          class="h-full bg-gradient-to-r from-[#F59E0B] to-[#D97706] rounded-full"
          :style="{
            width: `${progressPercentage}%`,
          }"
        ></div>
      </div>

      <div
        class="absolute -top-2 left-0 bg-amber-100 text-amber-800 px-3 py-1 rounded-full font-bold text-sm"
      >
        {{ Math.floor(animatedProgress) }} / {{ target }}
      </div>

      <!-- Coffre au trésor à la fin -->
      <div class="absolute top-1 right-6" style="transform: translateX(50%)">
        <div
          class="w-12 h-12 flex flex-col items-center justify-center rounded-md shadow-md"
          :class="{
            'bg-gray-200': props.current < props.target,
            'bg-gradient-to-r from-yellow-300 to-yellow-500': props.current >= props.target,
          }"
        >
          <!-- New treasure chest SVG -->
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 256 256"
            :class="{
              'text-gray-400': props.current < props.target,
              'text-amber-800': props.current >= props.target,
            }"
          >
            <path
              fill="currentColor"
              d="M184 40H72a56.06 56.06 0 0 0-56 56v96a16 16 0 0 0 16 16h192a16 16 0 0 0 16-16V96a56.06 56.06 0 0 0-56-56m40 56v8h-32V56.8A40.07 40.07 0 0 1 224 96m-88 40h-16v-32h16Zm-24 16h32a8 8 0 0 0 8-8v-24h24v72H80v-72h24v24a8 8 0 0 0 8 8m40-48v-8a8 8 0 0 0-8-8h-32a8 8 0 0 0-8 8v8H80V56h96v48ZM64 56.8V104H32v-8a40.07 40.07 0 0 1 32-39.2M32 120h32v72H32Zm192 72h-32v-72h32z"
            />
          </svg>
        </div>
        <div
          class="text-xs font-semibold mt-1 text-center"
          :class="{
            'text-gray-500': props.current < props.target,
            'text-amber-600': props.current >= props.target,
          }"
        >
          Treasure
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Styles supplémentaires si nécessaire */
</style>
