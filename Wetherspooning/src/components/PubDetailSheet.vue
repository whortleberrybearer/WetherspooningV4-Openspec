<template>
  <Dialog :open="isOpen" @update:open="(val) => $emit('update:isOpen', val)">
    <DialogContent class="sm:max-w-125 max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <div class="flex items-center gap-2">
          <DialogTitle class="flex-1">{{ pub?.name }}</DialogTitle>
          <Badge 
            v-if="pub?.openState && pub.openState !== 'Open'" 
            :class="getStateBadgeClass(pub.openState)"
          >
            {{ pub.openState }}
          </Badge>
        </div>
        <DialogDescription v-if="pub">
          {{ pub.address }}
        </DialogDescription>
      </DialogHeader>

      <div v-if="pub" class="grid gap-4">
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

            <!-- Rating -->
            <div class="grid gap-2">
              <Label for="rating">Rating (optional)</Label>
              <StarRating 
                v-model="rating"
                :disabled="isSaving"
              />
            </div>

            <!-- Notes -->
            <div class="grid gap-2">
              <Label for="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                v-model="notes"
                :disabled="isSaving"
                placeholder="Add your thoughts about this visit..."
                rows="4"
                :maxlength="500"
                class="resize-none"
              />
              <p class="text-xs text-muted-foreground">
                {{ notes.length }} / 500
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
import { Textarea } from '@/components/ui/textarea'
import StarRating from '@/components/StarRating.vue'
import { isPubClosed as checkIfPubClosed } from '@/utils/pubUtils'

interface Pub {
  id: string
  name: string
  townCity: string
  address: string
  county: string
  region?: string
  country?: string
  position: {
    lat: number
    lng: number
  } | null
  url?: string
  imageUrl?: string
  openState?: string
}

interface Props {
  pub: Pub | null
  isOpen: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:isOpen': [value: boolean]
}>()

const { user, isAuthenticated } = useAuth()
const { isVisited, getVisit, addVisit, updateVisit, removeVisit } = useVisits()

const isSaving = ref(false)
const isRemoving = ref(false)
const errorMessage = ref('')
const showRemoveDialog = ref(false)
const dateInput = ref('')
const rating = ref<number | undefined>(undefined)
const notes = ref('')

const isPubClosed = computed(() => {
  return props.pub ? checkIfPubClosed(props.pub) : false
})

const getStateBadgeClass = (openState: string): string => {
  if (openState === 'Closed') return 'bg-red-500 text-white hover:bg-red-600'
  if (openState === 'Temporary Closed') return 'bg-orange-500 text-white hover:bg-orange-600'
  if (openState.startsWith('Opening')) return 'bg-orange-500 text-white hover:bg-orange-600'
  if (openState.startsWith('Reopening')) return 'bg-orange-500 text-white hover:bg-orange-600'
  return 'bg-gray-500 text-white hover:bg-gray-600'
}

const currentVisit = computed(() => {
  if (!props.pub) return null
  return getVisit(props.pub.id)
})

const hasChanges = computed(() => {
  const visit = currentVisit.value
  
  // For new visits, allow saving if any field is set
  if (!visit) {
    return true
  }
  
  // Check date changes
  const currentDate = visit.visitedAt
  const currentDateStr = currentDate ? new Date(currentDate).toISOString().split('T')[0] : ''
  const dateChanged = currentDateStr !== dateInput.value
  
  // Check rating changes
  const ratingChanged = (visit.rating ?? undefined) !== rating.value
  
  // Check notes changes
  const currentNotes = visit.notes ?? ''
  const notesChanged = currentNotes !== notes.value
  
  return dateChanged || ratingChanged || notesChanged
})

// Initialize inputs when pub or visit changes
watch([() => props.pub, currentVisit], () => {
  if (!props.pub) {
    dateInput.value = ''
    rating.value = undefined
    notes.value = ''
    return
  }
  
  const visit = currentVisit.value
  
  // Initialize date
  if (visit?.visitedAt) {
    try {
      const date = new Date(visit.visitedAt)
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
  
  // Initialize rating
  rating.value = visit?.rating ?? undefined
  
  // Initialize notes
  notes.value = visit?.notes ?? ''
}, { immediate: true })

// Clear error when dialog closes
watch(() => props.isOpen, (isOpen) => {
  if (!isOpen) {
    errorMessage.value = ''
  }
})

const handleSave = async () => {
  if (!props.pub || !user.value?.uid) return
  
  isSaving.value = true
  errorMessage.value = ''
  
  try {
    if (isVisited(props.pub.id)) {
      // Update existing visit
      const updates: { visitedAt: string | null, rating?: number | null, notes?: string | null } = {
        visitedAt: dateInput.value ? new Date(dateInput.value).toISOString() : null
      }
      if (rating.value !== undefined) {
        updates.rating = rating.value
      } else {
        updates.rating = null
      }
      if (notes.value.trim()) {
        updates.notes = notes.value.trim()
      } else {
        updates.notes = null
      }
      await updateVisit(props.pub.id, updates)
    } else {
      // Create new visit
      const options: { visitedAt?: string, rating?: number, notes?: string } = {}
      if (dateInput.value) {
        options.visitedAt = new Date(dateInput.value).toISOString()
      }
      if (rating.value !== undefined) {
        options.rating = rating.value
      }
      if (notes.value.trim()) {
        options.notes = notes.value.trim()
      }
      await addVisit(props.pub.id, options, user.value.uid)
    }
    // Close the dialog after successful save
    emit('update:isOpen', false)
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
    // Close the main dialog after successful removal
    emit('update:isOpen', false)
  } catch (error: any) {
    errorMessage.value = error.message || 'Failed to remove visit'
  } finally {
    isRemoving.value = false
  }
}
</script>
