<template>
  <PubLocationsMap 
    :pubs="pubs"
    :visits="[]"
    :shared-visits-mode="sharedVisitsMode" 
    :not-found-state="notFoundState"
    :on-close-not-found="navigateToHome"
  />
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getUserProfileByUsername, getPublicVisits } from '@/services/firebaseDataService'
import { getAllPubs } from '@/services/pubDataService'
import PubLocationsMap from './PubLocationsMap.vue'
import type { Pub } from '@/services/firebaseDataService'

const route = useRoute()
const router = useRouter()

const username = computed(() => route.params.username as string)
const pubs = ref<Pub[]>([])
const sharedVisitsMode = ref<{ userId: string; username: string; visits: any[] } | null>(null)
const notFoundState = ref<{ isNotFound: boolean; username: string } | null>(null)

onMounted(async () => {
  // Load pubs first
  try {
    const data = await getAllPubs()
    pubs.value = data
  } catch (err) {
    console.error('Error loading pubs from Firestore:', err)
  }
  
  // Then load user profile and visits
  try {
    // Load user profile by username
    const profile = await getUserProfileByUsername(username.value)
    
    if (!profile) {
      notFoundState.value = { isNotFound: true, username: username.value }
      return
    }
    
    // Check if visits are public
    if (!profile.visitsPublic) {
      notFoundState.value = { isNotFound: true, username: username.value }
      return
    }
    
    // Load public visits
    const visits = await getPublicVisits(profile.uid)
    
    // Pass shared visits data to map component
    sharedVisitsMode.value = {
      userId: profile.uid,
      username: profile.username,
      visits
    }
    
    // Update page title
    document.title = `@${profile.username}'s Visits - Wetherspooning`
  } catch (err: any) {
    console.error('Failed to load shared visits:', err)
    notFoundState.value = { isNotFound: true, username: username.value }
  }
})

const navigateToHome = () => {
  router.push('/')
}
</script>
