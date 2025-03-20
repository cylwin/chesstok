<template>
  <div
    class="relative w-12 h-12 elo-badge rounded-xl flex items-center justify-center text-white font-bold mr-3 rotate-3 transition-transform"
    :style="{
      background: `linear-gradient(135deg, ${material.gradient[0]} 0%, ${material.gradient[1]} 100%)`,
      boxShadow: `0 4px 6px -1px ${material.boxShadow}`,
      transform: `rotate(3deg) rotateY(${isFlipping ? '180deg' : '0deg'})`,
    }"
    @transitionend="isFlipping = false"
  >
    <img :src="rank.image" :style="{ transform: `rotateY(${isFlipping ? '180deg' : '0deg'})` }" />
  </div>
</template>

<script setup lang="ts">
import wb from '@/assets/levels/wb.svg'
import wk from '@/assets/levels/wk.svg'
import wn from '@/assets/levels/wn.svg'
import wp from '@/assets/levels/wp.svg'
import wq from '@/assets/levels/wq.svg'
import wr from '@/assets/levels/wr.svg'
import { computed, ref, watch, onMounted } from 'vue'

const ranks = [
  { name: 'Pawn', image: wp },
  { name: 'Knight', image: wn },
  { name: 'Bishop', image: wb },
  { name: 'Rook', image: wr },
  { name: 'Queen', image: wq },
  { name: 'King', image: wk },
]
const materials = [
  {
    name: 'Wooden',
    gradient: ['#8B5A2B', '#A67C52'],
    boxShadow: 'rgba(139, 90, 43, 0.3)',
  },
  {
    name: 'Iron',
    gradient: ['#4D4D4D', '#6A6A6A'],
    boxShadow: 'rgba(77, 77, 77, 0.3)',
  },
  {
    name: 'Silver',
    gradient: ['#C0C0C0', '#E0E0E0'],
    boxShadow: 'rgba(192, 192, 192, 0.3)',
  },
  {
    name: 'Golden',
    gradient: ['#FFD700', '#FFB300'],
    boxShadow: 'rgba(255, 215, 0, 0.3)',
  },
  {
    name: 'Jade',
    gradient: ['#00A36C', '#50C878'],
    boxShadow: 'rgba(0, 163, 108, 0.3)',
  },
  {
    name: 'Opal',
    gradient: ['#89CFF0', '#FFD1DC'],
    boxShadow: 'rgba(137, 207, 240, 0.3)',
  },
  {
    name: 'Ruby',
    gradient: ['#9B111E', '#D70040'],
    boxShadow: 'rgba(155, 17, 30, 0.3)',
  },
  {
    name: 'Sapphire',
    gradient: ['#0F52BA', '#4169E1'],
    boxShadow: 'rgba(15, 82, 186, 0.3)',
  },
  {
    name: 'Emerald',
    gradient: ['#046307', '#50C878'],
    boxShadow: 'rgba(4, 99, 7, 0.3)',
  },
  {
    name: 'Diamond',
    gradient: ['#B9F2FF', '#E0FFFF'],
    boxShadow: 'rgba(185, 242, 255, 0.3)',
  },
]

const props = defineProps({
  level: {
    type: Number,
    required: true,
  },
})

const isFlipping = ref(false)
const isInitialRender = ref(true)

onMounted(() => {
  // Mark initial render complete after mount
  setTimeout(() => {
    isInitialRender.value = false
  }, 0)
})

watch(
  () => props.level,
  () => {
    // Only trigger animation if not the initial render
    if (!isInitialRender.value) {
      isFlipping.value = true
    }
  },
)

const rank = computed(() => {
  if (props.level <= 60) {
    return ranks[Math.floor(props.level / 10)]
  } else {
    return ranks[5]
  }
})

const material = computed(() => {
  if (props.level <= 60) {
    return materials[props.level % 10]
  } else {
    return materials[9]
  }
})
</script>

<style scoped>
.transition-transform {
  transition: transform 0.6s;
}

img {
  transition: transform 0.6s;
  backface-visibility: visible;
}
</style>
