<script setup lang="ts">
import { useRouter } from 'vue-router'
import ActionButton from '@/components/ActionButton.vue'
const router = useRouter()

const goToPuzzles = () => {
  router.push('/puzzles')
}
</script>

<template>
  <div class="p-5 flex gap-4">
    <ActionButton type="hint" label="HINT" @click="goToPuzzles" />
    <ActionButton type="skip" label="Start Solving!" @click="goToPuzzles" />
  </div>
</template>

<style></style>
