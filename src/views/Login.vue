<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { supabase } from '@/services/supabase'
import Footer from '@/components/Footer.vue'
const router = useRouter()
const userStore = useUserStore()

const state = reactive({
  email: '',
  otp: '',
  isEmailSent: false,
  isLoading: false,
  error: null as string | null,
})

const isValidEmail = computed(() => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(state.email)
})

const isValidOtp = computed(() => {
  return state.otp.length >= 6
})

async function handleSendEmail() {
  if (!isValidEmail.value) return

  state.isLoading = true
  state.error = null

  try {
    // First, update user email
    const { error: updateError } = await supabase.auth.updateUser({
      email: state.email,
    })

    if (updateError) {
      console.log('account already exists') // I don't care.
    }

    // Then, sign in with OTP
    const { error: signInError } = await supabase.auth.signInWithOtp({
      email: state.email,
    })

    if (signInError) throw signInError

    state.isEmailSent = true
  } catch (error: any) {
    state.error = error.message
  } finally {
    state.isLoading = false
  }
}

async function handleVerifyOtp() {
  if (!isValidOtp.value) return

  state.isLoading = true
  state.error = null

  try {
    const { data, error } = await supabase.auth.verifyOtp({
      email: state.email,
      token: state.otp,
      type: 'email',
    })

    if (error) throw error

    // If successful, store the user and redirect
    if (data?.user) {
      router.push('/')
    }
  } catch (error: any) {
    state.error = error.message
  } finally {
    state.isLoading = false
  }
}

function continueWithoutAccount() {
  router.push('/')
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-indigo-50 to-white py-8 px-6 flex flex-col">
    <!-- Header -->
    <div class="text-center mb-8">
      <div class="w-28 h-28 mx-auto mb-4">
        <img
          src="@/assets/logo_chesstok_transparent.png"
          alt="ChessTok Logo"
          class="w-full h-full object-contain drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]"
        />
      </div>
      <h1 class="text-2xl font-bold text-indigo-600">
        {{ state.isEmailSent ? 'Verify Your Email' : 'Welcome to ChessTok' }}
      </h1>
      <p class="text-slate-600 mt-2">
        {{
          state.isEmailSent
            ? "We've sent a verification code to your email"
            : 'Create an account to be sure not losing your progression and receiving special tips by email'
        }}
      </p>
    </div>

    <!-- Email Input Form -->
    <div
      v-if="!state.isEmailSent"
      class="max-w-md w-full mx-auto bg-white rounded-xl shadow-md p-6 mb-6"
    >
      <div class="mb-4">
        <label for="email" class="block text-sm font-medium text-slate-700 mb-1"
          >Email address</label
        >
        <input
          id="email"
          v-model="state.email"
          type="email"
          autocomplete="email"
          placeholder="you@example.com"
          class="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          :class="{ 'border-red-300': !isValidEmail && state.email }"
        />
        <p v-if="!isValidEmail && state.email" class="mt-1 text-sm text-red-500">
          Please enter a valid email address
        </p>
      </div>

      <div class="mt-6">
        <button
          @click="handleSendEmail"
          :disabled="!isValidEmail || state.isLoading"
          class="w-full bg-indigo-600 text-white font-medium py-3 px-4 rounded-lg shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <span v-if="state.isLoading">Sending...</span>
          <span v-else>Continue with Email</span>
        </button>
      </div>

      <div class="mt-4 text-center">
        <button
          @click="continueWithoutAccount"
          class="text-indigo-600 text-sm font-medium hover:text-indigo-800"
        >
          Continue without creating an account
        </button>
      </div>
    </div>

    <!-- OTP Verification Form -->
    <div v-else class="max-w-md w-full mx-auto bg-white rounded-xl shadow-md p-6 mb-6">
      <div class="mb-6">
        <label for="otp" class="block text-sm font-medium text-slate-700 mb-1"
          >Verification code</label
        >
        <input
          id="otp"
          v-model="state.otp"
          type="text"
          inputmode="numeric"
          autocomplete="one-time-code"
          placeholder="Enter 6-digit code"
          class="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <p class="mt-2 text-sm text-slate-500">
          Enter the verification code we sent to {{ state.email }}
        </p>
      </div>

      <div class="mt-6">
        <button
          @click="handleVerifyOtp"
          :disabled="!isValidOtp || state.isLoading"
          class="w-full bg-indigo-600 text-white font-medium py-3 px-4 rounded-lg shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <span v-if="state.isLoading">Verifying...</span>
          <span v-else>Verify Code</span>
        </button>
      </div>

      <div class="mt-4 text-center">
        <button
          @click="handleSendEmail"
          class="text-indigo-600 text-sm font-medium hover:text-indigo-800"
          :disabled="state.isLoading"
        >
          Send a new code
        </button>
      </div>
    </div>

    <!-- Error message -->
    <div v-if="state.error" class="max-w-md w-full mx-auto">
      <p class="text-center text-red-500 mb-6">{{ state.error }}</p>
    </div>
    <Footer view="login" />
  </div>
</template>

<style scoped>
/* Additional component-specific styles if needed */
</style>
