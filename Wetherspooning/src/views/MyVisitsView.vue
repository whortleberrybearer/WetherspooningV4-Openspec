<template>
  <PubLocationsMap 
    :pubs="pubs"
    :visits="visits"
    :error="error"
  />
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { useVisits } from '@/composables/useVisits'
import { getAllPubs } from '@/services/pubDataService'
import PubLocationsMap from './PubLocationsMap.vue'
import type { Pub } from '@/services/firebaseDataService'

const { user, isAuthenticated } = useAuth()
const { loadVisits, clearVisits, visits } = useVisits()

const pubs = ref<Pub[]>([])
const error = ref<string>('')

// Load pubs data
const loadPubs = async () => {
  try {
    const data = await getAllPubs()
    pubs.value = data
  } catch (err) {
    const errorMsg = 'Failed to load pub locations. Please check your connection and try again.'
    error.value = errorMsg
    console.error('Error loading pubs from Firestore:', err)
  }
}

// Watch authentication state to load visits on login/logout
watch(isAuthenticated, async (authenticated) => {
  if (authenticated && user.value?.uid) {
    await loadVisits(user.value.uid)
  } else {
    clearVisits()
  }
})

onMounted(async () => {
  // Load pubs first
  await loadPubs()
  
  // Load authenticated user's visits if logged in
  if (isAuthenticated.value && user.value?.uid) {
    await loadVisits(user.value.uid)
  }
})
</script>
