<template>
  <PubLocationsMap 
    :visits="visits"
  />
</template>

<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { useVisits } from '@/composables/useVisits'
import PubLocationsMap from './PubLocationsMap.vue'

const { user, isAuthenticated } = useAuth()
const { loadVisits, clearVisits, visits } = useVisits()

// Watch authentication state to load visits on login/logout
watch(isAuthenticated, async (authenticated) => {
  if (authenticated && user.value?.uid) {
    await loadVisits(user.value.uid)
  } else {
    clearVisits()
  }
})

onMounted(async () => {
  // Load authenticated user's visits if logged in
  if (isAuthenticated.value && user.value?.uid) {
    await loadVisits(user.value.uid)
  }
})
</script>
