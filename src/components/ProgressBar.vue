<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  completed: number
  total: number
  label?: string
  className?: string
  suffix?: string
}

const props = withDefaults(defineProps<Props>(), {
  label: 'DAILY PROGRESS',
  className: '',
  suffix: '',
})

const progressPercentage = computed(() => {
  return (props.completed / props.total) * 100
})
</script>

<template>
  <div :class="`progress-container ${className}`">
    <div class="w-full bg-slate-200 rounded-full h-3 shadow-inner">
      <div class="progress-bar" :style="{ width: `${progressPercentage}%` }"></div>
    </div>
    <div class="flex justify-between mt-1 font-black">
      <span class="text-slate-600">{{ label }}</span>
      <span class="text-primary" v-if="completed < total"
        >{{ completed }}/{{ total }} {{ suffix }}</span
      >
      <span class="text-primary" v-else>COMPLETED</span>
    </div>
  </div>
</template>

<style scoped>
.progress-bar {
  height: 10px;
  border-radius: 5px;
  background: linear-gradient(90deg, #22d3ee 0%, #10b981 100%);
  position: relative;
  overflow: hidden;
}

.progress-bar::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.2) 50%,
    rgba(255, 255, 255, 0) 100%
  );
  transform: translateX(-100%);
  animation: shimmer 2s infinite;
}

.progress-container {
  position: relative;
}

.progress-container::before {
  content: '';
  position: absolute;
  top: -10px;
  left: 0;
  width: 100%;
  height: calc(100% + 20px);
  background: url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%236366F1' fill-opacity='0.03' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='3'/%3E%3Ccircle cx='13' cy='13' r='3'/%3E%3C/g%3E%3C/svg%3E");
  z-index: -1;
}

@keyframes shimmer {
  100% {
    transform: translateX(100%);
  }
}
</style>
