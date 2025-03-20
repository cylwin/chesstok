<script setup lang="ts">
import { computed, watch, ref } from 'vue'
import NumberFlow, { continuous } from '@number-flow/vue'
import LevelAvatar from '@/components/LevelAvatar.vue'
import { useLevelStore } from '@/stores/levelStore'
interface Props {
  elo: number
  label?: string
}

const props = withDefaults(defineProps<Props>(), {
  label: 'YOUR ELO',
})

const levelStore = useLevelStore()
const eloDisplay = computed(() => props.elo)
const previousElo = ref(props.elo)
const eloDifference = ref<number | null>(null)
const showDifference = ref(false)

watch(eloDisplay, (newVal, oldVal) => {
  if (oldVal !== undefined && newVal !== oldVal) {
    previousElo.value = oldVal
    eloDifference.value = newVal - oldVal
    showDifference.value = true

    setTimeout(() => {
      showDifference.value = false
    }, 2000)
  }
})
</script>

<template>
  <div class="flex items-center">
    <LevelAvatar :level="levelStore.currentLevel" />
    <div class="relative">
      <div class="font-black text-slate-800">{{ label }}</div>
      <div class="text-primary font-black text-xl flex items-center">
        <NumberFlow :value="eloDisplay" :plugins="[continuous]" />
        <transition name="fade-slide">
          <span
            v-if="showDifference && eloDifference !== null"
            class="ml-2 font-bold elo-difference text-white px-1 rounded-sm"
            :class="eloDifference > 0 ? 'bg-green-500' : 'bg-red-500'"
          >
            {{ eloDifference > 0 ? '+' : '' }}{{ eloDifference }} elo
          </span>
        </transition>
      </div>
    </div>
  </div>
</template>

<style scoped>
.elo-badge {
  overflow: hidden;
}

.elo-badge::after {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0) 70%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.elo-badge:hover::after {
  opacity: 1;
}

.elo-difference {
  animation: pulse 0.5s ease-in-out;
}

@keyframes pulse {
  0% {
    transform: scale(0.8);
    opacity: 0;
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}
</style>
