<template>
  <PubLocationsMap 
    :visits="sharedVisits"
    :shared-username="sharedUsername"
  />
  
  <!-- Not Found Dialog - rendered outside to avoid layout issues -->
  <UserNotFoundDialog
    :is-open="notFoundState?.isNotFound ?? false"
    :username="notFoundState?.username ?? ''"
  />
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getUserProfileByUsername, getPublicVisits } from '@/services/firebaseDataService'
import PubLocationsMap from './PubLocationsMap.vue'
import UserNotFoundDialog from '@/components/UserNotFoundDialog.vue'

const route = useRoute()
const router = useRouter()

const username = computed(() => route.params.username as string)
const sharedVisits = ref<any[]>([])
const sharedUsername = ref<string>('')
const notFoundState = ref<{ isNotFound: boolean; username: string } | null>(null)

onMounted(async () => {
  console.log('SharedVisitsView mounted, loading data for:', username.value)
  try {
    // Load user profile by username
    const profile = await getUserProfileByUsername(username.value)
    console.log('Profile loaded:', profile)
    
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
    console.log('Visits loaded:', visits.length, 'visits')
    
    // Set shared visits and username
    sharedVisits.value = visits
    sharedUsername.value = profile.username
    console.log('sharedVisits set:', sharedVisits.value)
    
    // Update page title
    document.title = `@${profile.username}'s Visits - Wetherspooning`
  } catch (err: any) {
    console.error('Failed to load shared visits:', err)
    notFoundState.value = { isNotFound: true, username: username.value }
  }
})
</script>
