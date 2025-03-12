<script setup lang="ts">
defineProps<{
  type: 'hint' | 'skip'
  label: string
}>()

defineEmits<{
  (e: 'click'): void
}>()
</script>

<template>
  <button
    @click="$emit('click')"
    class="fancy-button flex-1 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center shadow-lg"
    :class="{
      'btn-hint border border-slate-600': type === 'hint',
      'btn-skip border border-indigo-500': type === 'skip',
    }"
  >
    <!-- Hint Icon -->
    <svg
      v-if="type === 'hint'"
      xmlns="http://www.w3.org/2000/svg"
      class="h-6 w-6 mr-2 text-yellow-300"
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

    <!-- Skip Icon -->
    <svg
      v-if="type === 'skip'"
      xmlns="http://www.w3.org/2000/svg"
      class="h-6 w-6 mr-2 text-yellow-300"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M13 5l7 7-7 7M5 5l7 7-7 7"
      />
    </svg>

    <span class="text-lg">{{ label }}</span>
  </button>
</template>

<style scoped>
.fancy-button {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  z-index: 1;
}

.fancy-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(45deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.2));
  z-index: -1;
}

.fancy-button:hover {
  transform: translateY(-3px);
  box-shadow:
    0 10px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.fancy-button:active {
  transform: translateY(1px);
}

.btn-hint {
  background: linear-gradient(135deg, #334155 0%, #1e293b 100%);
  position: relative;
  z-index: 1;
}

.btn-hint::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.05' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='3'/%3E%3Ccircle cx='13' cy='13' r='3'/%3E%3C/g%3E%3C/svg%3E");
  border-radius: inherit;
  z-index: -1;
}

.btn-skip {
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
  position: relative;
  z-index: 1;
}

.btn-skip::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.05' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='3'/%3E%3Ccircle cx='13' cy='13' r='3'/%3E%3C/g%3E%3C/svg%3E");
  border-radius: inherit;
  z-index: -1;
}
</style>
