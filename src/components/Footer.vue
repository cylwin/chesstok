<template>
  <!-- Legal Disclaimers -->
  <div class="mt-auto pt-2 mb-2">
    <div class="max-w-md mx-auto text-center text-xs text-slate-500">
      <template v-if="isLoginScreen">
        <p class="mb-2">
          By continuing, you agree to our
          <a href="/terms" class="text-indigo-600 hover:underline">Terms of Service</a> and
          <a href="/privacy" class="text-indigo-600 hover:underline">Privacy Policy</a>
        </p>
        <p class="mb-2">App content and materials are designed for users 13+ years old</p>
        <p>
          Apple and the Apple logo are trademarks of Apple Inc. App Store is a service mark of Apple
          Inc.
        </p>
      </template>

      <template v-else>
        <p class="mb-2">
          <a href="/terms" class="text-indigo-600 hover:underline">Terms</a> ·
          <a href="/privacy" class="text-indigo-600 hover:underline">Privacy</a> ·
          <a href="/contact" class="text-indigo-600 hover:underline">Contact</a>
        </p>
        <p>© {{ new Date().getFullYear() }} ChessTok. All rights reserved.</p>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue'

const props = defineProps({
  view: {
    type: String,
    default: 'home',
  },
})

const isLoginScreen = props.view === 'login'
</script>
