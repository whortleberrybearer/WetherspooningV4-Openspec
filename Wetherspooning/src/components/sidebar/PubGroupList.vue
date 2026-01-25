<template>
  <CountryGroup
    v-for="(counties, countryName) in groupedPubs"
    :key="countryName"
    :country-name="countryName"
    :counties="counties"
    :show-visit-progress="showVisitProgress"
    :visits="visits"
    :show-closed-pubs="showClosedPubs"
    @select-pub="$emit('selectPub', $event)"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import CountryGroup from './CountryGroup.vue'
import type { Pub, Visit } from '@/services/firebaseDataService'
import { isPubClosed } from '@/utils/pubUtils'

interface Props {
  pubs: Pub[]
  showVisitProgress: boolean
  visits: readonly Visit[]
  showClosedPubs: boolean
}

const props = defineProps<Props>()

defineEmits<{
  selectPub: [pub: Pub]
}>()

const filteredPubs = computed(() => {
  if (props.showClosedPubs) {
    return props.pubs
  }
  return props.pubs.filter(pub => !isPubClosed(pub))
})

const groupedPubs = computed(() => {
  const grouped: Record<string, Record<string, Pub[]>> = {}

  filteredPubs.value.forEach((pub) => {
    const country = pub.country || 'Unknown'
    const county = pub.county || 'Unknown'
    
    if (!grouped[country]) {
      grouped[country] = {}
    }
    if (!grouped[country]![county]) {
      grouped[country]![county] = []
    }
    grouped[country]![county]!.push(pub)
  })

  const sortedCountries: Record<string, Record<string, Pub[]>> = {}
  Object.keys(grouped)
    .sort()
    .forEach((country) => {
      const counties: Record<string, Pub[]> = {}
      
      Object.keys(grouped[country]!)
        .sort()
        .forEach((county) => {
          const countyPubs = grouped[country]![county]!.sort((a, b) => {
            // Primary sort: by name
            const nameComparison = a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
            if (nameComparison !== 0) return nameComparison
            
            // Secondary sort: by townCity
            const townComparison = a.townCity.localeCompare(b.townCity, undefined, { sensitivity: 'base' })
            if (townComparison !== 0) return townComparison
            
            // Tertiary sort: open before closed
            const aIsClosed = (a.openState || 'Open') === 'Closed'
            const bIsClosed = (b.openState || 'Open') === 'Closed'
            if (aIsClosed && !bIsClosed) return 1
            if (!aIsClosed && bIsClosed) return -1
            
            return 0
          })
          if (countyPubs.length > 0) {
            counties[county] = countyPubs
          }
        })
      
      if (Object.keys(counties).length > 0) {
        sortedCountries[country] = counties
      }
    })

  return sortedCountries
})
</script>
