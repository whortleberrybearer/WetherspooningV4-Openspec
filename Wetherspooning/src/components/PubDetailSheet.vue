<template>
  <Dialog :open="isOpen" @update:open="(val) => $emit('update:isOpen', val)">
    <DialogContent class="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{{ pub?.name }}</DialogTitle>
        <DialogDescription v-if="pub">
          {{ pub.address }}, {{ pub.townCity }}, {{ pub.county }}
        </DialogDescription>
      </DialogHeader>

      <div v-if="pub" class="grid gap-4">
        <!-- Status Badge -->
        <div class="flex gap-2">
          <Badge v-if="isPubClosed" variant="destructive">Closed</Badge>
          <Badge v-else variant="default" class="bg-green-500 hover:bg-green-500/80">Open</Badge>
          <Badge v-if="isVisited(pub.id)" variant="secondary">✓ Visited</Badge>
        </div>

        <!-- Visit Tracking Section (Only for Authenticated Users) -->
        <div v-if="isAuthenticated">
          <div class="grid gap-4">
            <!-- Visit Date -->
            <div class="grid gap-2">
              <Label for="visit-date">Visit Date</Label>
              <Input
                id="visit-date"
                type="date"
                v-model="dateInput"
                :disabled="isSaving"
              />
              <p class="text-xs text-muted-foreground">
                Leave empty if date is unknown
              </p>
            </div>

            <!-- Action Buttons -->
            <div class="flex gap-2">
              <Button 
                @click="handleSave" 
                :disabled="isSaving || !hasChanges"
                class="flex-1"
              >
                <span v-if="!isSaving">{{ isVisited(pub.id) ? 'Update Visit' : 'Save Visit' }}</span>
                <span v-else>Saving...</span>
              </Button>
              
              <Button 
                v-if="isVisited(pub.id)"
                @click="showRemoveDialog = true" 
                variant="destructive"
                :disabled="isSaving"
              >
                Remove
              </Button>
            </div>
          </div>

          <!-- Error Message -->
          <div v-if="errorMessage" class="p-3 bg-destructive/10 border border-destructive rounded-md text-sm mt-3">
            {{ errorMessage }}
          </div>
        </div>

        <!-- Unauthenticated Message -->
        <div v-else class="p-3 bg-muted rounded-md text-sm text-muted-foreground">
          Sign in to track your visits
        </div>
      </div>
    </DialogContent>
  </Dialog>

  <!-- Remove Confirmation Dialog -->
  <Dialog :open="showRemoveDialog" @update:open="(val) => showRemoveDialog = val">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Remove Visit?</DialogTitle>
        <DialogDescription>
          This action cannot be undone. Your visit to {{ pub?.name }} will be permanently removed.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button variant="outline" @click="showRemoveDialog = false" :disabled="isRemoving">
          Cancel
        </Button>
        <Button variant="destructive" @click="handleRemoveVisit" :disabled="isRemoving">
          <span v-if="!isRemoving">Remove</span>
          <span v-else>Removing...</span>
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { useVisits } from '@/composables/useVisits'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

interface Pub {
  id: number
  name: string
  townCity: string
  address: string
  county: string
  region: string
  country: string
  lat: number
  lng: number
  url?: string
  imageUrl?: string
  openState?: string
}

interface Props {
  pub: Pub | null
  isOpen: boolean
}

const props = defineProps<Props>()
defineEmits<{
  'update:isOpen': [value: boolean]
}>()

const { user, isAuthenticated } = useAuth()
const { isVisited, getVisit, addVisit, updateVisit, removeVisit } = useVisits()

const isSaving = ref(false)
const isRemoving = ref(false)
const errorMessage = ref('')
const showRemoveDialog = ref(false)
const dateInput = ref('')

const isPubClosed = computed(() => {
  const state = props.pub?.openState || 'Open'
  return state.toLowerCase().includes('closed')
})

const currentVisit = computed(() => {
  if (!props.pub) return null
  return getVisit(props.pub.id)
})

const hasChanges = computed(() => {
  const currentDate = currentVisit.value?.visitedAt
  if (!currentDate && !dateInput.value) return true // New visit with no date
  if (!currentDate) return dateInput.value !== '' // New visit with date
  
  const currentDateStr = new Date(currentDate).toISOString().split('T')[0]
  return currentDateStr !== dateInput.value
})

// Initialize date input when pub or visit changes
watch([() => props.pub, currentVisit], () => {
  if (!props.pub) {
    dateInput.value = ''
    return
  }
  
  if (currentVisit.value?.visitedAt) {
    try {
      const date = new Date(currentVisit.value.visitedAt)
      dateInput.value = date.toISOString().split('T')[0] || ''
    } catch {
      dateInput.value = ''
    }
  } else if (isVisited(props.pub.id)) {
    // Visit exists but no date
    dateInput.value = ''
  } else {
    // New visit - default to today
    dateInput.value = new Date().toISOString().split('T')[0] || ''
  }
}, { immediate: true })

const handleSave = async () => {
  if (!props.pub || !user.value?.uid) return
  
  isSaving.value = true
  errorMessage.value = ''
  
  try {
    if (isVisited(props.pub.id)) {
      // Update existing visit
      const updates: { visitedAt: string | null } = {
        visitedAt: dateInput.value ? new Date(dateInput.value).toISOString() : null
      }
      await updateVisit(props.pub.id, updates)
    } else {
      // Create new visit
      const options: { visitedAt?: string } = {}
      if (dateInput.value) {
        options.visitedAt = new Date(dateInput.value).toISOString()
      }
      await addVisit(props.pub.id, options, user.value.uid)
    }
  } catch (error: any) {
    errorMessage.value = error.message || 'Failed to save visit'
  } finally {
    isSaving.value = false
  }
}

const handleRemoveVisit = async () => {
  if (!props.pub) return
  
  isRemoving.value = true
  errorMessage.value = ''
  
  try {
    await removeVisit(props.pub.id)
    showRemoveDialog.value = false
  } catch (error: any) {
    errorMessage.value = error.message || 'Failed to remove visit'
  } finally {
    isRemoving.value = false
  }
}
</script>
