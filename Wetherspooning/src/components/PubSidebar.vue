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
      <h2 class="text-lg font-semibold">Pub Locations</h2>
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
          <span class="text-sm text-muted-foreground">{{ getCountryTotal(counties) }}</span>
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
              <span class="text-xs text-muted-foreground">{{ pubs.length }}</span>
            </button>

            <!-- Pubs within County -->
            <div v-if="expandedCounties.has(`${countryName}-${countyName}`)" class="ml-6 mt-1 space-y-1">
              <button
                v-for="pub in pubs"
                :key="pub.id"
                @click="$emit('selectPub', pub)"
                class="w-full text-left p-2 hover:bg-accent rounded-md transition-colors"
              >
                <div class="text-sm">{{ pub.name }}</div>
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
import { computed, ref } from 'vue'

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
}

const props = defineProps<Props>()
defineEmits<{
  close: []
  selectPub: [pub: Pub]
}>()

const expandedCountries = ref(new Set<string>())
const expandedCounties = ref(new Set<string>())

/**
 * Groups pubs hierarchically by country → county → pub, with alphabetical sorting at each level.
 * Computed property ensures efficient re-computation only when pubs array changes.
 */
const groupedPubs = computed(() => {
  const grouped: Record<string, Record<string, Pub[]>> = {}

  // Group pubs by country and county
  props.pubs.forEach((pub) => {
    if (!grouped[pub.country]) {
      grouped[pub.country] = {}
    }
    if (!grouped[pub.country]![pub.county]) {
      grouped[pub.country]![pub.county] = []
    }
    grouped[pub.country]![pub.county]!.push(pub)
  })

  // Sort countries alphabetically
  const sortedCountries: Record<string, Record<string, Pub[]>> = {}
  Object.keys(grouped)
    .sort()
    .forEach((country) => {
      sortedCountries[country] = {}
      
      // Sort counties within each country alphabetically
      Object.keys(grouped[country]!)
        .sort()
        .forEach((county) => {
          // Sort pubs by town/city within each county alphabetically
          sortedCountries[country]![county] = grouped[country]![county]!.sort((a, b) =>
            a.townCity.localeCompare(b.townCity)
          )
        })
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
 * Calculates total number of pubs across all counties in a country.
 */
const getCountryTotal = (counties: Record<string, Pub[]>) => {
  return Object.values(counties).reduce((sum, pubs) => sum + pubs.length, 0)
}
</script>
