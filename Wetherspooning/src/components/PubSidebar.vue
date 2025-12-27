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
    <LoginDialog :is-open="showLoginDialog" @close="showLoginDialog = false" />

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
              <button
                v-for="pub in pubs"
                :key="pub.id"
                @click="$emit('selectPub', pub)"
                :class="[
                  'w-full text-left p-2 hover:bg-accent rounded-md transition-colors',
                  isPubClosed(pub) ? 'opacity-50' : ''
                ]"
              >
                <div :class="['text-sm', isPubClosed(pub) ? 'text-muted-foreground' : '']">{{ pub.name }}</div>
                <div class="text-xs text-muted-foreground">{{ pub.townCity }}</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { useVisits } from '@/composables/useVisits'
import LoginDialog from '@/components/LoginDialog.vue'
import UserMenu from '@/components/UserMenu.vue'

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
const { getGroupCounts, loadVisits, clearVisits } = useVisits()
const showLoginDialog = ref(false)

// Watch authentication state to load/clear visit data
watch(isAuthenticated, async (authenticated) => {
  if (authenticated && user.value) {
    // Load visits when user logs in (using userId 1 for test user)
    await loadVisits(1)
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
 * - Authenticated: "✓ Visited X/Y" or "Visited 0/Y"
 * - Not authenticated: "Y pubs" or "Y (Z closed)"
 */
const getCountryTotal = (counties: Record<string, Pub[]>) => {
  const allPubs = Object.values(counties).flat()
  
  if (isAuthenticated.value) {
    // Show visit progress for authenticated users
    const { visited, total } = getGroupCounts(allPubs)
    return visited > 0 ? `✓ Visited ${visited}/${total}` : `Visited ${visited}/${total}`
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
 * - Authenticated: "✓ Visited X/Y" or "Visited 0/Y"
 * - Not authenticated: "Y pubs" or "Y (Z closed)"
 */
const getCountyTotal = (pubs: Pub[]) => {
  if (isAuthenticated.value) {
    // Show visit progress for authenticated users
    const { visited, total } = getGroupCounts(pubs)
    return visited > 0 ? `✓ Visited ${visited}/${total}` : `Visited ${visited}/${total}`
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
</script>
