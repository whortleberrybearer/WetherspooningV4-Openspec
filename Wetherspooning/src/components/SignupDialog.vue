<template>
  <Dialog :open="isOpen" @update:open="(open) => !open && handleClose()">
    <DialogContent class="sm:max-w-106.25">
      <DialogHeader>
        <DialogTitle>Create an account</DialogTitle>
        <DialogDescription>
          Enter your information below to create your account
        </DialogDescription>
      </DialogHeader>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="grid gap-4">
        <!-- Username Field -->
        <div class="grid gap-2">
          <Label for="username">Username</Label>
          <Input
            id="username"
            ref="usernameInput"
            v-model="username"
            type="text"
            required
            autocomplete="username"
          />
        </div>

        <!-- Email Field -->
        <div class="grid gap-2">
          <Label for="email">Email</Label>
          <Input
            id="email"
            v-model="email"
            type="email"
            required
            autocomplete="email"
            aria-describedby="email-description"
          />
          <p id="email-description" class="text-sm text-muted-foreground">
            We'll use this to contact you. We will not share your email with anyone else.
          </p>
        </div>

        <!-- Password Field -->
        <div class="grid gap-2">
          <Label for="password">Password</Label>
          <Input
            id="password"
            v-model="password"
            type="password"
            required
            autocomplete="new-password"
            aria-describedby="password-description"
          />
          <p id="password-description" class="text-sm text-muted-foreground">
            Must be at least 8 characters long.
          </p>
        </div>

        <!-- Confirm Password Field -->
        <div class="grid gap-2">
          <Label for="confirm-password">Confirm Password</Label>
          <Input
            id="confirm-password"
            v-model="confirmPassword"
            type="password"
            required
            autocomplete="new-password"
            aria-describedby="confirm-password-description"
          />
          <p id="confirm-password-description" class="text-sm text-muted-foreground">
            Please confirm your password.
          </p>
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

        <!-- Success Message -->
        <div
          v-if="success"
          class="p-3 bg-green-500/10 border border-green-500 rounded-md"
          role="alert"
          aria-live="polite"
        >
          <p class="text-sm text-green-600">{{ success }}</p>
        </div>

        <!-- Submit Button -->
        <Button
          type="submit"
          :disabled="!canSubmit || isLoading"
          class="w-full"
        >
          {{ isLoading ? 'Creating account...' : 'Create Account' }}
        </Button>

        <!-- Divider -->
        <div class="relative">
          <div class="absolute inset-0 flex items-center">
            <span class="w-full border-t" />
          </div>
          <div class="relative flex justify-center text-xs uppercase">
            <span class="bg-background px-2 text-muted-foreground">
              Or sign up with
            </span>
          </div>
        </div>

        <!-- Google Sign Up Button -->
        <Button
          type="button"
          variant="outline"
          class="w-full"
          disabled
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
          Sign up with Google
        </Button>
      </form>

      <div class="mt-4 text-center text-sm">
        Already have an account?
        <a href="#" class="underline" @click.prevent="handleNavigateToLogin">
          Sign in
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
  openLogin: []
}>()

const { register, error: authError, clearError } = useAuth()

const username = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const isLoading = ref(false)
const error = ref<string | null>(null)
const success = ref<string | null>(null)
const usernameInput = ref<HTMLInputElement | null>(null)

const canSubmit = computed(() => {
  return (
    username.value.trim() !== '' &&
    email.value.trim() !== '' &&
    password.value.trim() !== '' &&
    confirmPassword.value.trim() !== ''
  )
})

const handleSubmit = async () => {
  if (!canSubmit.value || isLoading.value) return

  // Clear previous errors and success messages
  error.value = null
  success.value = null
  clearError()

  // Validate username length
  if (username.value.trim().length < 3) {
    error.value = 'Username must be at least 3 characters'
    return
  }

  // Validate password length
  if (password.value.length < 8) {
    error.value = 'Password must be at least 8 characters'
    return
  }

  // Validate password confirmation
  if (password.value !== confirmPassword.value) {
    error.value = 'Passwords do not match'
    return
  }

  isLoading.value = true

  try {
    await register(username.value.trim(), email.value.trim(), password.value)
    success.value = 'Account created successfully! Please log in.'
    
    // Wait a moment to show success message, then navigate to login
    setTimeout(() => {
      handleClose()
      emit('openLogin')
    }, 1500)
  } catch (err) {
    error.value = authError.value || 'An error occurred during registration'
  } finally {
    isLoading.value = false
  }
}

const handleClose = () => {
  username.value = ''
  email.value = ''
  password.value = ''
  confirmPassword.value = ''
  error.value = null
  success.value = null
  clearError()
  emit('close')
}

const handleNavigateToLogin = () => {
  handleClose()
  emit('openLogin')
}

// Focus username field when dialog opens
watch(() => props.isOpen, async (isOpen) => {
  if (isOpen) {
    await nextTick()
    usernameInput.value?.focus()
  }
})
</script>
