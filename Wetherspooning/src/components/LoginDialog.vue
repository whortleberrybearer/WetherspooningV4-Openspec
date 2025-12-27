<template>
  <Teleport to="body">
    <Transition name="dialog">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-100 flex items-center justify-center"
        @click.self="handleClose"
      >
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/50" @click="handleClose"></div>
        
        <!-- Dialog -->
        <div
          class="relative bg-background border border-border rounded-lg shadow-lg w-full max-w-md mx-4 p-6"
          role="dialog"
          aria-labelledby="login-dialog-title"
          aria-modal="true"
          @keydown.esc="handleClose"
        >
          <!-- Header -->
          <div class="flex items-center justify-between mb-4">
            <h2 id="login-dialog-title" class="text-xl font-semibold">Login</h2>
            <button
              @click="handleClose"
              class="p-2 hover:bg-accent rounded-md transition-colors"
              aria-label="Close dialog"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <!-- Error Message -->
          <div
            v-if="error"
            class="mb-4 p-3 bg-destructive/10 border border-destructive rounded-md"
            role="alert"
            aria-live="polite"
          >
            <p class="text-sm text-destructive">{{ error }}</p>
          </div>

          <!-- Form -->
          <form @submit.prevent="handleSubmit">
            <!-- Username Field -->
            <div class="mb-4">
              <label for="username" class="block text-sm font-medium mb-2">
                Username
              </label>
              <input
                id="username"
                ref="usernameInput"
                v-model="username"
                type="text"
                class="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter username"
                required
                autocomplete="username"
              />
            </div>

            <!-- Password Field -->
            <div class="mb-6">
              <label for="password" class="block text-sm font-medium mb-2">
                Password
              </label>
              <input
                id="password"
                v-model="password"
                type="password"
                class="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter password"
                required
                autocomplete="current-password"
              />
            </div>

            <!-- Submit Button -->
            <button
              type="submit"
              :disabled="!canSubmit || isLoading"
              class="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {{ isLoading ? 'Logging in...' : 'Login' }}
            </button>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { useAuth } from '@/composables/useAuth'

interface Props {
  isOpen: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
}>()

const { login, error: authError, clearError } = useAuth()

const username = ref('')
const password = ref('')
const isLoading = ref(false)
const usernameInput = ref<HTMLInputElement | null>(null)

const error = computed(() => authError.value)

const canSubmit = computed(() => {
  return username.value.trim() !== '' && password.value.trim() !== ''
})

const handleSubmit = async () => {
  if (!canSubmit.value || isLoading.value) return

  isLoading.value = true
  
  try {
    await login(username.value, password.value)
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
  username.value = ''
  password.value = ''
  clearError()
  emit('close')
}

// Focus username input when dialog opens
watch(() => props.isOpen, async (newValue) => {
  if (newValue) {
    await nextTick()
    usernameInput.value?.focus()
  }
})
</script>

<style scoped>
.dialog-enter-active,
.dialog-leave-active {
  transition: opacity 0.2s ease;
}

.dialog-enter-from,
.dialog-leave-to {
  opacity: 0;
}

.dialog-enter-active > div:last-child,
.dialog-leave-active > div:last-child {
  transition: transform 0.2s ease;
}

.dialog-enter-from > div:last-child,
.dialog-leave-to > div:last-child {
  transform: scale(0.95);
}
</style>
