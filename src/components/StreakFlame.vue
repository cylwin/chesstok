<script setup lang="ts">
import { computed, watch, ref } from 'vue'
import flame1 from '@/assets/streak_flames/flame_1.png'
import flame2 from '@/assets/streak_flames/flame_2.png'
import flame3 from '@/assets/streak_flames/flame_3.png'

interface StreakFlameProps {
  currentStreak: number
  maxStreak?: number
  thresholds?: number[]
  showValue?: boolean
}

const props = withDefaults(defineProps<StreakFlameProps>(), {
  maxStreak: 5,
  thresholds: () => [5, 15], // Default thresholds for flame images
  showValue: true,
})

// Determines which flame image to use based on current streak
const flameImage = computed(() => {
  if (props.currentStreak < props.thresholds[0]) {
    return flame1
  } else if (props.currentStreak < props.thresholds[1]) {
    return flame2
  } else {
    return flame3
  }
})

// Determine if we should pulse based on proximity to next threshold
const shouldPulse = computed(() => {
  // If at the highest tier already, don't pulse
  if (props.currentStreak >= props.thresholds[props.thresholds.length - 1]) {
    return false
  }

  // Find the next threshold
  const nextThreshold = props.thresholds.find((t) => t > props.currentStreak) || 0

  // Pulse if within 20% of the next threshold
  return (
    nextThreshold > 0 &&
    nextThreshold - props.currentStreak <= Math.max(1, Math.floor(nextThreshold * 0.3))
  )
})

// Track streak changes to trigger intense pulse
const previousStreak = ref(props.currentStreak)
const intensePulse = ref(false)

watch(
  () => props.currentStreak,
  (newValue, oldValue) => {
    if (newValue !== oldValue) {
      intensePulse.value = true
      previousStreak.value = newValue

      // Reset intense pulse after animation completes
      setTimeout(() => {
        intensePulse.value = false
      }, 1000)
    }
  },
)
</script>

<template>
  <div class="streak-flame-container relative">
    <img
      :src="flameImage"
      :class="[
        'streak-flame-image',
        shouldPulse ? 'gentle-pulse' : 'soft-gentle-pulse',
        intensePulse ? 'intense-pulse' : '',
      ]"
      alt="Streak Flame"
      v-if="showValue"
    />
    <div v-if="showValue" class="streak-value">{{ currentStreak }}</div>
  </div>
</template>

<style scoped>
.streak-flame-container {
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  width: 60px;
  height: 60px;
}

.streak-flame-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.streak-value {
  position: absolute;
  top: 70%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-weight: 900;
  font-size: 1.5rem;
  text-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
  z-index: 1;
}

.gentle-pulse {
  animation: gentlePulse 2s infinite;
}

.soft-gentle-pulse {
  animation: softGentlePulse 2s infinite;
}

.intense-pulse {
  animation: intensePulse 1s;
}

@keyframes softGentlePulse {
  0% {
    filter: brightness(1);
    transform: scale(1);
  }
  50% {
    filter: brightness(1.05);
    transform: scale(1.03);
  }
  100% {
    filter: brightness(1);
    transform: scale(1);
  }
}

@keyframes gentlePulse {
  0% {
    filter: brightness(0.9);
    transform: scale(1);
  }
  50% {
    filter: brightness(1.5);
    transform: scale(1.25);
  }
  100% {
    filter: brightness(0.9);
    transform: scale(1);
  }
}

@keyframes intensePulse {
  0% {
    transform: scale(1);
    filter: brightness(1);
  }
  50% {
    transform: scale(1.3);
    filter: brightness(1.5);
  }
  100% {
    transform: scale(1);
    filter: brightness(1);
  }
}
</style>
