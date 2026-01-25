<template>
  <Dialog :open="isOpen" @update:open="handleClose">
    <DialogContent class="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Account Settings</DialogTitle>
      </DialogHeader>

      <div class="grid gap-4 py-4">
        <!-- Account Information -->
        <div class="grid gap-2">
          <div class="flex flex-col gap-1">
            <span class="text-sm font-medium">Username</span>
            <span class="text-sm text-muted-foreground">{{ user?.username }}</span>
          </div>
          <div v-if="user?.email" class="flex flex-col gap-1">
            <span class="text-sm font-medium">Email</span>
            <span class="text-sm text-muted-foreground">{{ user.email }}</span>
          </div>
        </div>

        <!-- Change Password Section -->
        <div class="border-t pt-4">
          <h3 class="text-sm font-medium mb-3">Change Password</h3>
          <div class="grid gap-3">
            <div class="grid gap-2">
              <label for="current-password" class="text-sm font-medium">
                Current Password
              </label>
              <input
                id="current-password"
                v-model="currentPassword"
                type="password"
                :disabled="isChangingPassword"
                @keydown.enter="handlePasswordChange"
                class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
              <p v-if="passwordError && passwordErrorField === 'current'" class="text-sm text-destructive">
                {{ passwordError }}
              </p>
            </div>
            <div class="grid gap-2">
              <label for="new-password" class="text-sm font-medium">
                New Password
              </label>
              <input
                id="new-password"
                v-model="newPassword"
                type="password"
                :disabled="isChangingPassword"
                @keydown.enter="handlePasswordChange"
                class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
              <p v-if="passwordError && passwordErrorField === 'new'" class="text-sm text-destructive">
                {{ passwordError }}
              </p>
            </div>
            <div class="grid gap-2">
              <label for="confirm-password" class="text-sm font-medium">
                Confirm New Password
              </label>
              <input
                id="confirm-password"
                v-model="confirmPassword"
                type="password"
                :disabled="isChangingPassword"
                @keydown.enter="handlePasswordChange"
                class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
              <p v-if="!isPasswordFormValid && newPassword && confirmPassword && newPassword !== confirmPassword" class="text-sm text-muted-foreground">
                Passwords do not match.
              </p>
            </div>
            <div class="flex justify-end">
              <button
                type="button"
                @click="handlePasswordChange"
                :disabled="!isPasswordFormValid || isChangingPassword"
                class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
              >
                <svg v-if="isChangingPassword" class="mr-2 h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Change Password
              </button>
            </div>
            <div v-if="passwordSuccess" role="alert" aria-live="polite" class="flex items-center gap-2 text-sm text-green-600">
              <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              Password changed successfully
            </div>
          </div>
        </div>

        <!-- Delete Account Section -->
        <div class="border-t pt-4">
          <p class="text-sm text-muted-foreground mb-3">
            Permanently delete your account and all associated data.
          </p>
          <div class="flex justify-end">
            <button
              type="button"
              @click="showDeleteConfirm = true"
              class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-destructive text-destructive-foreground hover:bg-destructive/90 h-10 px-4 py-2"
            >
              Delete Account
            </button>
          </div>
        </div>

        <!-- Error Message -->
        <p v-if="errorMessage" class="text-sm text-destructive">
          {{ errorMessage }}
        </p>
      </div>
    </DialogContent>
  </Dialog>

  <!-- Delete Confirmation Dialog with Re-authentication -->
  <DeleteAccountConfirmDialog
    :is-open="showDeleteConfirm"
    @close="showDeleteConfirm = false"
    @success="handleReauthSuccess"
  />

  <!-- Loading Overlay -->
  <div
    v-if="isDeleting"
    class="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center"
  >
    <div class="bg-card rounded-lg p-6 shadow-lg flex flex-col items-center gap-4">
      <svg class="h-8 w-8 animate-spin text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <p class="text-sm font-medium">Deleting account...</p>
    </div>
  </div>

  <!-- Success Message -->
  <div
    v-if="showSuccess"
    class="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center"
  >
    <div class="bg-card rounded-lg p-6 shadow-lg flex flex-col items-center gap-4">
      <svg class="h-8 w-8 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
      </svg>
      <p class="text-sm font-medium">Account deleted</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useAuth } from '@/composables/useAuth'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import DeleteAccountConfirmDialog from './DeleteAccountConfirmDialog.vue'

const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  'update:isOpen': [value: boolean]
}>()

const { user, deleteAccount, changePassword } = useAuth()

const showDeleteConfirm = ref(false)
const isDeleting = ref(false)
const showSuccess = ref(false)
const errorMessage = ref('')

// Password change form state
const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const isChangingPassword = ref(false)
const passwordError = ref('')
const passwordErrorField = ref<'current' | 'new' | ''>('')
const passwordSuccess = ref(false)

// Computed property to validate password form
const isPasswordFormValid = computed(() => {
  return (
    currentPassword.value.length > 0 &&
    newPassword.value.length >= 8 &&
    confirmPassword.value.length > 0 &&
    newPassword.value === confirmPassword.value
  )
})

const handleClose = () => {
  if (isDeleting.value) return
  
  emit('update:isOpen', false)
  errorMessage.value = ''
}

const handleReauthSuccess = async () => {
  // Close both dialogs immediately
  showDeleteConfirm.value = false
  emit('update:isOpen', false)
}

// Handle password change
const handlePasswordChange = async () => {
  if (!isPasswordFormValid.value || isChangingPassword.value) return

  // Validate new password length
  if (newPassword.value.length < 8) {
    passwordError.value = 'Password must be at least 8 characters long.'
    passwordErrorField.value = 'new'
    return
  }

  isChangingPassword.value = true
  passwordError.value = ''
  passwordErrorField.value = ''
  passwordSuccess.value = false

  try {
    await changePassword(currentPassword.value, newPassword.value)
    
    // Success - show message and clear form
    passwordSuccess.value = true
    currentPassword.value = ''
    newPassword.value = ''
    confirmPassword.value = ''

    // Hide success message after 2 seconds
    setTimeout(() => {
      passwordSuccess.value = false
    }, 2000)
  } catch (error: any) {
    // Handle errors
    if (error.message.includes('Incorrect password')) {
      passwordError.value = error.message
      passwordErrorField.value = 'current'
      currentPassword.value = ''
    } else {
      passwordError.value = error.message || 'Failed to update password. Please try again.'
      passwordErrorField.value = 'new'
    }
  } finally {
    isChangingPassword.value = false
  }
}

// Reset state when dialog is closed
watch(() => props.isOpen, (newValue) => {
  if (!newValue) {
    showDeleteConfirm.value = false
    isDeleting.value = false
    showSuccess.value = false
    errorMessage.value = ''
    // Clear password form state
    currentPassword.value = ''
    newPassword.value = ''
    confirmPassword.value = ''
    passwordError.value = ''
    passwordErrorField.value = ''
    passwordSuccess.value = false
    isChangingPassword.value = false
  }
})
</script>
