<template>
  <Dialog :open="isOpen" @update:open="(open) => !open && handleClose()">
    <DialogContent class="sm:max-w-106.25">
      <DialogHeader>
        <DialogTitle>Login to your account</DialogTitle>
        <DialogDescription>
          Enter your email below to login to your account
        </DialogDescription>
      </DialogHeader>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="grid gap-4">
        <!-- Email Field -->
        <div class="grid gap-2">
          <Label for="email">Email</Label>
          <Input
            id="email"
            ref="emailInput"
            v-model="email"
            type="email"
            placeholder="m@example.com"
            required
            autocomplete="email"
          />
        </div>

        <!-- Password Field -->
        <div class="grid gap-2">
          <div class="flex items-center">
            <Label for="password">Password</Label>
            <a 
              href="#" 
              class="ml-auto inline-block text-sm underline-offset-4 hover:underline"
              @click.prevent="handleForgotPassword"
            >
              Forgot your password?
            </a>
          </div>
          <Input
            id="password"
            v-model="password"
            type="password"
            required
            autocomplete="current-password"
          />
        </div>

        <!-- Error Message -->
        <div
          v-if="error"
          class="p-3 bg-destructive/10 border border-destructive rounded-md"
          role="alert"
          aria-live="polite"
        >
          <p class="text-sm text-destructive">{{ error }}</p>
        </div>

        <!-- Submit Button -->
        <Button
          type="submit"
          :disabled="!canSubmit || isLoading"
          class="w-full"
        >
          {{ isLoading ? 'Logging in...' : 'Login' }}
        </Button>

        <!-- Divider -->
        <div class="relative">
          <div class="absolute inset-0 flex items-center">
            <span class="w-full border-t" />
          </div>
          <div class="relative flex justify-center text-xs uppercase">
            <span class="bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>

        <!-- Google Sign In Button -->
        <Button
          type="button"
          variant="outline"
          class="w-full"
          @click="handleGoogleSignIn"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="mr-2 h-4 w-4">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Login with Google
        </Button>
      </form>

      <div class="mt-4 text-center text-sm">
        Don't have an account?
        <a href="#" class="underline" @click.prevent="handleNavigateToSignup">
          Sign up
        </a>
      </div>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/composables/useAuth'

interface Props {
  isOpen: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
  openSignup: []
  openPasswordReset: []
}>()

const { login, error: authError, clearError } = useAuth()

const email = ref('')
const password = ref('')
const isLoading = ref(false)
const emailInput = ref<HTMLInputElement | null>(null)

const error = computed(() => authError.value)

const canSubmit = computed(() => {
  return email.value.trim() !== '' && password.value.trim() !== ''
})

const handleSubmit = async () => {
  if (!canSubmit.value || isLoading.value) return

  isLoading.value = true
  
  try {
    // Use email as username for login
    await login(email.value, password.value)
    // Success - close dialog and reset form
    handleClose()
  } catch (err) {
    // Error is already set in auth state
    // Clear password field on failed login
    password.value = ''
  } finally {
    isLoading.value = false
  }
}

const handleClose = () => {
  // Clear form
  email.value = ''
  password.value = ''
  clearError()
  emit('close')
}

const handleGoogleSignIn = () => {
  // TODO: Implement Google Sign In
  console.log('Google Sign In clicked')
}

const handleNavigateToSignup = () => {
  handleClose()
  emit('openSignup')
}
const handleForgotPassword = () => {
  handleClose()
  emit('openPasswordReset')
}


// Focus email input when dialog opens
watch(() => props.isOpen, async (newValue) => {
  if (newValue) {
    await nextTick()
    emailInput.value?.focus()
  }
})
</script>
