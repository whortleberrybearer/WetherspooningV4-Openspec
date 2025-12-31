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
import { ref, watch } from 'vue'
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

const { user, deleteAccount } = useAuth()

const showDeleteConfirm = ref(false)
const isDeleting = ref(false)
const showSuccess = ref(false)
const errorMessage = ref('')

const handleClose = () => {
  if (isDeleting.value) return
  
  emit('update:isOpen', false)
  errorMessage.value = ''
}

const handleReauthSuccess = async () => {
  showDeleteConfirm.value = false
  isDeleting.value = true
  errorMessage.value = ''

  try {
    await deleteAccount()
    
    // Show success message
    showSuccess.value = true
    
    // Wait 2 seconds then close everything
    setTimeout(() => {
      showSuccess.value = false
      isDeleting.value = false
      emit('update:isOpen', false)
    }, 2000)
  } catch (error: any) {
    isDeleting.value = false
    errorMessage.value = error.message || 'Failed to delete account. Please try again.'
  }
}

// Reset state when dialog is closed
watch(() => props.isOpen, (newValue) => {
  if (!newValue) {
    showDeleteConfirm.value = false
    isDeleting.value = false
    showSuccess.value = false
    errorMessage.value = ''
  }
})
</script>
