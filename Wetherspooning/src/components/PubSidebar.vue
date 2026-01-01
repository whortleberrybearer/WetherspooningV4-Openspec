<template>
  <div
    :class="[
      'fixed top-0 left-0 h-full bg-background border-r border-border transition-transform duration-300 z-50 flex flex-col',
      'w-80 md:w-96',
      isOpen ? 'translate-x-0' : '-translate-x-full'
    ]"
  >
    <!-- Header -->
    <div class="flex items-center justify-between p-4 border-b border-border">
      <div class="flex flex-col gap-2 flex-1">
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-semibold">Wetherspooning</h2>
          <button
            @click="$emit('close')"
            class="p-2 hover:bg-accent rounded-md transition-colors"
            aria-label="Close sidebar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <!-- Login/User Menu -->
        <div class="flex items-center gap-2">
          <button
            v-if="!isAuthenticated"
            @click="showLoginDialog = true"
            class="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Login
          </button>
          <UserMenu v-else />
        </div>
        
        <label class="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            :checked="showClosedPubs"
            @change="$emit('toggleClosedPubs')"
            class="w-4 h-4 rounded border-border text-primary focus:ring-primary focus:ring-2"
          />
          <span class="text-sm text-muted-foreground">Show Closed Pubs</span>
        </label>
      </div>
    </div>

    <!-- Login Dialog -->
    <LoginDialog 
      :is-open="showLoginDialog" 
      @close="showLoginDialog = false"
      @open-signup="handleOpenSignup"
    />
    
    <!-- Signup Dialog -->
    <SignupDialog 
      :is-open="showSignupDialog" 
      @close="showSignupDialog = false"
      @open-login="handleOpenLogin"
    />

    <!-- Content -->
    <div class="flex-1 overflow-y-auto p-4">
      <div v-for="(counties, countryName) in groupedPubs" :key="countryName" class="mb-4">
        <!-- Country Group -->
        <button
          @click="toggleCountry(countryName)"
          class="w-full flex items-center justify-between p-3 hover:bg-accent rounded-md transition-colors text-left"
        >
          <div class="flex items-center gap-2">
            <svg
              :class="['transition-transform duration-200', expandedCountries.has(countryName) ? 'rotate-90' : '']"
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
            <span class="font-semibold">{{ countryName }}</span>
          </div>
          <span :class="['text-sm', isAuthenticated ? 'text-muted-foreground' : 'text-muted-foreground']">{{ getCountryTotal(counties) }}</span>
        </button>

        <!-- Counties within Country -->
        <div v-if="expandedCountries.has(countryName)" class="ml-4 mt-2 space-y-2">
          <div v-for="(pubs, countyName) in counties" :key="countyName">
            <!-- County Group -->
            <button
              @click="toggleCounty(countryName, countyName)"
              class="w-full flex items-center justify-between p-2 hover:bg-accent rounded-md transition-colors text-left"
            >
              <div class="flex items-center gap-2">
                <svg
                  :class="['transition-transform duration-200', expandedCounties.has(`${countryName}-${countyName}`) ? 'rotate-90' : '']"
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
                <span class="text-sm font-medium">{{ countyName }}</span>
              </div>
              <span :class="['text-xs', isAuthenticated ? 'text-muted-foreground' : 'text-muted-foreground']">{{ getCountyTotal(pubs) }}</span>
            </button>

            <!-- Pubs within County -->
            <div v-if="expandedCounties.has(`${countryName}-${countyName}`)" class="ml-6 mt-1 space-y-1">
              <div
                v-for="pub in pubs"
                :key="pub.id"
                :class="[
                  'w-full text-left p-2 hover:bg-accent rounded-md transition-colors flex items-start justify-between gap-2',
                  isPubClosed(pub) ? 'opacity-50' : ''
                ]"
              >
                <button
                  @click="$emit('selectPub', pub)"
                  class="flex-1 text-left"
                >
                  <div :class="['text-sm flex items-center gap-1', isPubClosed(pub) ? 'text-muted-foreground' : '']">
                    <span v-if="pub.isHotel" title="Hotel">🏨</span>
                    <span v-if="pub.inAirport" title="Airport">✈️</span>
                    <span v-if="pub.inTrainStation" title="Train Station">🚂</span>
                    <span>{{ pub.name }}</span>
                  </div>
                  <div class="text-xs text-muted-foreground">{{ pub.townCity }}</div>
                </button>
                
                <!-- Visit tracking icon/date -->
                <button
                  v-if="isAuthenticated"
                  @click.stop="openPubTracking(pub)"
                  class="flex items-center gap-1 text-xs hover:bg-accent/50 rounded px-2 py-1 transition-colors"
                  :title="isVisited(pub.id) ? 'Edit visit' : 'Track visit'"
                >
                  <template v-if="isVisited(pub.id)">
                    <span class="text-green-600">{{ formatVisitDate(getVisitDate(pub.id)) }}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-green-600">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                  </template>
                  <template v-else>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-muted-foreground">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="8" x2="12" y2="16"></line>
                      <line x1="8" y1="12" x2="16" y2="12"></line>
                    </svg>
                  </template>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  
  <!-- Login Dialog -->
  <LoginDialog 
    :isOpen="showLoginDialog" 
    @close="showLoginDialog = false"
    @openSignup="handleOpenSignup" 
  />
  
  <!-- Signup Dialog -->
  <SignupDialog 
    :isOpen="showSignupDialog" 
    @close="showSignupDialog = false"
    @openLogin="handleOpenLogin" 
  />
  
  <!-- Pub Detail Dialog for Visit Tracking -->
  <PubDetailSheet
    v-if="selectedPubForTracking"
    :isOpen="showPubDetailDialog"
    @update:isOpen="showPubDetailDialog = $event"
    :pub="selectedPubForTracking"
  />
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { useVisits } from '@/composables/useVisits'
import LoginDialog from '@/components/LoginDialog.vue'
import SignupDialog from '@/components/SignupDialog.vue'
import UserMenu from '@/components/UserMenu.vue'
import PubDetailSheet from '@/components/PubDetailSheet.vue'

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
  isHotel?: boolean
  inAirport?: boolean
  inTrainStation?: boolean
}

interface Props {
  pubs: Pub[]
  isOpen: boolean
  showClosedPubs: boolean
}

const props = defineProps<Props>()
defineEmits<{
  close: []
  selectPub: [pub: Pub]
  toggleClosedPubs: []
}>()

const { user, isAuthenticated } = useAuth()
const { getGroupCounts, loadVisits, clearVisits, isVisited, getVisitDate } = useVisits()
const showLoginDialog = ref(false)
const showSignupDialog = ref(false)
const selectedPubForTracking = ref<Pub | null>(null)
const showPubDetailDialog = ref(false)

const handleOpenSignup = () => {
  showLoginDialog.value = false
  showSignupDialog.value = true
}

const handleOpenLogin = () => {
  showSignupDialog.value = false
  showLoginDialog.value = true
}

// Watch authentication state to load/clear visit data
watch(isAuthenticated, async (authenticated) => {
  if (authenticated && user.value?.uid) {
    // Load visits when user logs in using Firebase UID
    await loadVisits(user.value.uid)
  } else {
    // Clear visits when user logs out
    clearVisits()
  }
})

const expandedCountries = ref(new Set<string>())
const expandedCounties = ref(new Set<string>())

/**
 * Helper function to check if a pub is closed
 */
const isPubClosed = (pub: Pub): boolean => {
  const state = pub.openState || 'Open'
  return state.toLowerCase().includes('closed')
}

/**
 * Filter pubs based on toggle state.
 * Toggle ON: show all pubs
 * Toggle OFF: show only open pubs
 */
const filteredPubs = computed(() => {
  if (props.showClosedPubs) {
    return props.pubs
  }
  return props.pubs.filter(pub => !isPubClosed(pub))
})

/**
 * Groups pubs hierarchically by country → county → pub, with alphabetical sorting at each level.
 * Computed property ensures efficient re-computation only when pubs array changes.
 */
const groupedPubs = computed(() => {
  const grouped: Record<string, Record<string, Pub[]>> = {}

  // Group filtered pubs by country and county
  filteredPubs.value.forEach((pub) => {
    if (!grouped[pub.country]) {
      grouped[pub.country] = {}
    }
    if (!grouped[pub.country]![pub.county]) {
      grouped[pub.country]![pub.county] = []
    }
    grouped[pub.country]![pub.county]!.push(pub)
  })

  // Sort countries alphabetically and filter out empty groups
  const sortedCountries: Record<string, Record<string, Pub[]>> = {}
  Object.keys(grouped)
    .sort()
    .forEach((country) => {
      const counties: Record<string, Pub[]> = {}
      
      // Sort counties within each country alphabetically
      Object.keys(grouped[country]!)
        .sort()
        .forEach((county) => {
          // Only include county if it has pubs after filtering
          const countyPubs = grouped[country]![county]!.sort((a, b) =>
            a.townCity.localeCompare(b.townCity)
          )
          if (countyPubs.length > 0) {
            counties[county] = countyPubs
          }
        })
      
      // Only include country if it has counties with pubs
      if (Object.keys(counties).length > 0) {
        sortedCountries[country] = counties
      }
    })

  return sortedCountries
})

/**
 * Toggles the expansion state of a country group.
 */
const toggleCountry = (country: string) => {
  if (expandedCountries.value.has(country)) {
    expandedCountries.value.delete(country)
  } else {
    expandedCountries.value.add(country)
  }
}

/**
 * Toggles the expansion state of a county group.
 */
const toggleCounty = (country: string, county: string) => {
  const key = `${country}-${county}`
  if (expandedCounties.value.has(key)) {
    expandedCounties.value.delete(key)
  } else {
    expandedCounties.value.add(key)
  }
}

/**
 * Calculates display count for a country based on toggle state and authentication.
 * - Authenticated: "✓ Visited X/Y (Z closed)" or "✓ Visited X/Y" or "Visited 0/Y"
 * - Not authenticated: "Y pubs" or "Y (Z closed)"
 */
const getCountryTotal = (counties: Record<string, Pub[]>) => {
  const allPubs = Object.values(counties).flat()
  
  if (isAuthenticated.value) {
    // Show visit progress for authenticated users
    const { visited, total } = getGroupCounts(allPubs)
    const visitText = visited > 0 ? `✓ Visited ${visited}/${total}` : `Visited ${visited}/${total}`
    
    // Add closed count if showing closed pubs
    if (props.showClosedPubs) {
      const closedCount = allPubs.filter(isPubClosed).length
      return closedCount > 0 ? `${visitText} (${closedCount} closed)` : visitText
    }
    
    return visitText
  } else {
    // Show total counts for unauthenticated users
    const total = allPubs.length
    const closedCount = allPubs.filter(isPubClosed).length
    
    if (props.showClosedPubs) {
      return closedCount > 0 ? `${total} (${closedCount} closed)` : `${total}`
    } else {
      return `${total}`
    }
  }
}

/**
 * Calculates display count for a county based on toggle state and authentication.
 * - Authenticated: "✓ Visited X/Y (Z closed)" or "✓ Visited X/Y" or "Visited 0/Y"
 * - Not authenticated: "Y pubs" or "Y (Z closed)"
 */
const getCountyTotal = (pubs: Pub[]) => {
  if (isAuthenticated.value) {
    // Show visit progress for authenticated users
    const { visited, total } = getGroupCounts(pubs)
    const visitText = visited > 0 ? `✓ Visited ${visited}/${total}` : `Visited ${visited}/${total}`
    
    // Add closed count if showing closed pubs
    if (props.showClosedPubs) {
      const closedCount = pubs.filter(isPubClosed).length
      return closedCount > 0 ? `${visitText} (${closedCount} closed)` : visitText
    }
    
    return visitText
  } else {
    // Show total counts for unauthenticated users
    const total = pubs.length
    const closedCount = pubs.filter(isPubClosed).length
    
    if (props.showClosedPubs) {
      return closedCount > 0 ? `${total} (${closedCount} closed)` : `${total}`
    } else {
      return `${total}`
    }
  }
}

/**
 * Format a visit date for display.
 * Converts ISO date string to human-readable format.
 */
const formatVisitDate = (isoDate: string | null): string | null => {
  if (!isoDate) return null
  
  try {
    const date = new Date(isoDate)
    return date.toLocaleDateString('en-GB', { 
      day: '2-digit',
      month: '2-digit',
      year: 'numeric' 
    })
  } catch (error) {
    console.error('Error formatting date:', error)
    return null
  }
}

/**
 * Opens the pub detail dialog for visit tracking.
 */
const openPubTracking = (pub: Pub) => {
  selectedPubForTracking.value = pub
  showPubDetailDialog.value = true
}
</script>
