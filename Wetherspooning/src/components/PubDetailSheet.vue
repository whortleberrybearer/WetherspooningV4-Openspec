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
          <!-- Not Visited State -->
          <div v-if="!isVisited(pub.id)" class="grid gap-3">
            <Button 
              @click="handleMarkVisited" 
              :disabled="isLoading"
              class="w-full"
            >
              <span v-if="!isLoading">Mark as Visited</span>
              <span v-else>Saving...</span>
            </Button>
          </div>

          <!-- Visited State -->
          <div v-else class="grid gap-4">
            <!-- Visit Date -->
            <div class="grid gap-2">
              <Label for="visit-date">Visit Date</Label>
              <Input
                id="visit-date"
                type="date"
                :value="visitDateValue"
                @change="handleDateChange"
                :disabled="isUpdating"
              />
              <p class="text-xs text-muted-foreground">
                Leave empty if date is unknown
              </p>
            </div>

            <!-- Remove Visit Button -->
            <Button 
              @click="showRemoveDialog = true" 
              variant="destructive"
              class="w-full"
              :disabled="isRemoving"
            >
              Remove Visit
            </Button>
          </div>

          <!-- Error Message -->
          <div v-if="errorMessage" class="p-3 bg-destructive/10 border border-destructive rounded-md text-sm">
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

const isLoading = ref(false)
const isUpdating = ref(false)
const isRemoving = ref(false)
const errorMessage = ref('')
const showRemoveDialog = ref(false)
const notesModel = ref('')

const isPubClosed = computed(() => {
  const state = props.pub?.openState || 'Open'
  return state.toLowerCase().includes('closed')
})

const currentVisit = computed(() => {
  if (!props.pub) return null
  return getVisit(props.pub.id)
})

const visitDateValue = computed(() => {
  if (!currentVisit.value?.visitedAt) return ''
  try {
    const date = new Date(currentVisit.value.visitedAt)
    return date.toISOString().split('T')[0]
  } catch {
    return ''
  }
})

// Update notes model when visit changes
watch(currentVisit, (visit) => {
  notesModel.value = visit?.notes || ''
}, { immediate: true })

const handleMarkVisited = async () => {
  if (!props.pub || !user.value?.uid) return
  
  isLoading.value = true
  errorMessage.value = ''
  
  try {
    await addVisit(props.pub.id, {}, user.value.uid)
  } catch (error: any) {
    errorMessage.value = error.message || 'Failed to mark as visited'
  } finally {
    isLoading.value = false
  }
}

const handleDateChange = async (event: Event) => {
  if (!props.pub) return
  
  const input = event.target as HTMLInputElement
  const dateValue = input.value
  
  isUpdating.value = true
  errorMessage.value = ''
  
  try {
    if (dateValue) {
      // Convert to ISO date string
      const isoDate = new Date(dateValue).toISOString()
      await updateVisit(props.pub.id, { visitedAt: isoDate })
    } else {
      // Clear date (unknown)
      await updateVisit(props.pub.id, { visitedAt: null })
    }
  } catch (error: any) {
    errorMessage.value = error.message || 'Failed to update date'
  } finally {
    isUpdating.value = false
  }
}

const handleNotesUpdate = async () => {
  if (!props.pub) return
  if (notesModel.value === currentVisit.value?.notes) return
  
  isUpdating.value = true
  errorMessage.value = ''
  
  try {
    await updateVisit(props.pub.id, { notes: notesModel.value })
  } catch (error: any) {
    errorMessage.value = error.message || 'Failed to update notes'
    // Revert on error
    notesModel.value = currentVisit.value?.notes || ''
  } finally {
    isUpdating.value = false
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
