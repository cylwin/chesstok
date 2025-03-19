<template>
  <div class="flex flex-col items-center justify-center h-screen flex-wrap">
    <div v-for="(rank, indexr) in ranks" :key="index">
      <UserEloBadge
        v-for="(material, index) in materials"
        :key="index + indexr * materials.length + 1"
        :gradient="material.gradient"
        :shadowColor="material.boxShadow"
        :label="material.name + ' ' + rank.name"
        :elo="index + indexr * materials.length + 1"
      >
        <img :src="rank.image" />
      </UserEloBadge>
    </div>
  </div>
</template>

<script setup>
import UserEloBadge from '@/components/UserEloBadge.vue'

import wb from '@/assets/levels/wb.svg'
import wk from '@/assets/levels/wk.svg'
import wn from '@/assets/levels/wn.svg'
import wp from '@/assets/levels/wp.svg'
import wq from '@/assets/levels/wq.svg'
import wr from '@/assets/levels/wr.svg'

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
</script>
