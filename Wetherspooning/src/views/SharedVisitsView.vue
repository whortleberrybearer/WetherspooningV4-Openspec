<template>
  <div class="h-screen flex flex-col">
    <!-- Loading State -->
    <div v-if="isLoading" class="flex-1 flex items-center justify-center">
      <div class="flex flex-col items-center gap-4">
        <svg class="h-8 w-8 animate-spin text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p class="text-sm text-muted-foreground">Loading visits...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="flex-1 flex items-center justify-center">
      <div class="max-w-md mx-auto px-4 py-8 text-center">
        <h2 class="text-2xl font-bold mb-2">{{ errorTitle }}</h2>
        <p class="text-muted-foreground mb-4">{{ error }}</p>
        <button
          @click="navigateToHome"
          class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
        >
          Return to home
        </button>
      </div>
    </div>

    <!-- Shared Visits Display -->
    <div v-else class="flex-1 overflow-hidden">
      <PubLocationsMap :shared-visits-mode="sharedVisitsMode" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { getUserProfileByUsername, getPublicVisits } from '@/services/firebaseDataService'
import PubLocationsMap from './PubLocationsMap.vue'

const route = useRoute()
const router = useRouter()
const { isAuthenticated } = useAuth()

const username = computed(() => route.params.username as string)
const isLoading = ref(true)
const error = ref('')
const errorTitle = ref('')
const sharedVisitsMode = ref<{ userId: string; username: string; visits: any[] } | null>(null)

onMounted(async () => {
  try {
    // Load user profile by username
    const profile = await getUserProfileByUsername(username.value)
    
    if (!profile) {
      errorTitle.value = 'User not found'
      error.value = `No user found with username @${username.value}`
      isLoading.value = false
      return
    }
    
    // Check if visits are public
    if (!profile.visitsPublic) {
      errorTitle.value = 'Not found'
      error.value = `No user found with username @${username.value}`
      isLoading.value = false
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
    
    isLoading.value = false
  } catch (err: any) {
    console.error('Failed to load shared visits:', err)
    errorTitle.value = 'Error'
    error.value = err.message || 'Failed to load visits'
    isLoading.value = false
  }
})

const navigateToOwnVisits = () => {
  router.push('/')
}

const navigateToStartTracking = () => {
  router.push('/')
}

const navigateToHome = () => {
  router.push('/')
}
</script>
