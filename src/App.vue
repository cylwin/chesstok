<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterLink, RouterView } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { supabase } from '@/services/supabase'

onMounted(async () => {
  const userStore = useUserStore()

  // Check if user is already authenticated
  const { data } = await supabase.auth.getSession()

  // Only sign in anonymously if no session exists
  if (!data.session) {
    console.log('No existing session found, creating anonymous user')
    await userStore.signInAnonymously()
  } else {
    console.log('Existing session found, using current user')
  }
})
</script>

<template>
  <div class="flex flex-col min-h-screen">
    <!-- Top Bar -->
    <div class="app-container min-h-screen overflow-hidden">
      <div
        class="top-bar bg-gradient-to-r from-[#6366F1] to-purple-500 text-white p-4 flex justify-between items-center relative"
      >
        <div class="flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-7 w-7 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M11 17l-5-5m0 0l5-5m-5 5h12"
            />
          </svg>
          <span class="font-extrabold text-xl tracking-tight">ChessPulse</span>
        </div>
      </div>

      <main class="flex-1">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<style>
/* Additional styles that enhance Tailwind */
.router-link-active:after {
  width: 100% !important;
}

.app-container {
  background: linear-gradient(to bottom, #ffffff, #f8fafc);
  box-shadow:
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
  position: relative;
  overflow: hidden;
}

.app-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 5px;
  background: linear-gradient(90deg, #6366f1, #8b5cf6, #f97316, #10b981);
  z-index: 10;
}
</style>
