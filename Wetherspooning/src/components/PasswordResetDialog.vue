<template>
  <Dialog :open="isOpen" @update:open="(open) => !open && handleClose()">
    <DialogContent class="sm:max-w-106.25">
      <DialogHeader>
        <DialogTitle>Reset Password</DialogTitle>
        <DialogDescription>
          Enter your email and we'll send you a link to reset your password
        </DialogDescription>
      </DialogHeader>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="grid gap-4">
        <!-- Email Field -->
        <div class="grid gap-2">
          <Label for="reset-email">Email</Label>
          <Input
            id="reset-email"
            ref="emailInput"
            v-model="email"
            type="email"
            placeholder="m@example.com"
            required
            autocomplete="email"
          />
        </div>

        <!-- Success Message -->
        <div
          v-if="successMessage"
          class="p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-md"
          role="status"
          aria-live="polite"
        >
          <p class="text-sm text-green-700 dark:text-green-300">{{ successMessage }}</p>
        </div>

        <!-- Error Message -->
        <div
          v-if="errorMessage"
          class="p-3 bg-destructive/10 border border-destructive rounded-md"
          role="alert"
          aria-live="polite"
        >
          <p class="text-sm text-destructive">{{ errorMessage }}</p>
        </div>

        <!-- Submit Button -->
        <Button
          type="submit"
          :disabled="!canSubmit || isLoading"
          class="w-full"
        >
          {{ isLoading ? 'Sending...' : 'Send Reset Email' }}
        </Button>
      </form>

      <!-- Back to Login Link -->
      <div class="mt-4 text-center text-sm">
        <a href="#" class="underline" @click.prevent="handleBackToLogin">
          Back to Login
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

const { sendPasswordReset } = useAuth()

const email = ref('')
const isLoading = ref(false)
const successMessage = ref('')
const errorMessage = ref('')
const emailInput = ref<HTMLInputElement | null>(null)

const canSubmit = computed(() => {
  return email.value.trim() !== '' && email.value.includes('@')
})

const handleSubmit = async () => {
  if (!canSubmit.value || isLoading.value) return

  isLoading.value = true
  successMessage.value = ''
  errorMessage.value = ''
  
  try {
    await sendPasswordReset(email.value)
    // Success
    successMessage.value = 'Password reset email sent! Check your inbox.'
    email.value = ''
  } catch (err: any) {
    // Display error message
    errorMessage.value = err.message || 'An error occurred. Please try again.'
  } finally {
    isLoading.value = false
  }
}

const handleClose = () => {
  // Clear form and messages
  email.value = ''
  successMessage.value = ''
  errorMessage.value = ''
  emit('close')
}

const handleBackToLogin = () => {
  handleClose()
  emit('openLogin')
}

// Focus email input when dialog opens
watch(() => props.isOpen, async (newValue) => {
  if (newValue) {
    await nextTick()
    emailInput.value?.focus()
  }
})

// Clear error when user modifies email
watch(email, () => {
  if (errorMessage.value) {
    errorMessage.value = ''
  }
})
</script>
