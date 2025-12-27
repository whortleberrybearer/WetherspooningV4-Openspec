<template>
  <div class="fixed inset-0 w-full h-screen">
    <!-- Burger Menu Button -->
    <button      v-if="!sidebarOpen"      @click="toggleSidebar"
      class="fixed top-4 left-4 z-60 p-3 bg-background border border-border rounded-md shadow-lg hover:bg-accent transition-colors"
      aria-label="Toggle sidebar"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="3" y1="12" x2="21" y2="12"></line>
        <line x1="3" y1="6" x2="21" y2="6"></line>
        <line x1="3" y1="18" x2="21" y2="18"></line>
      </svg>
    </button>

    <!-- Sidebar -->
    <PubSidebar
      :pubs="pubs"
      :is-open="sidebarOpen"
      @close="toggleSidebar"
      @selectPub="handlePubSelect"
    />

    <!-- Overlay for mobile -->
    <div
      v-if="sidebarOpen"
      @click="toggleSidebar"
      class="fixed inset-0 bg-black/50 z-40 md:hidden"
    ></div>

    <div v-if="error" class="absolute top-5 left-1/2 -translate-x-1/2 bg-destructive text-destructive-foreground px-6 py-3 rounded-md z-1000 shadow-lg">
      {{ error }}
    </div>
    <div ref="mapContainer" class="w-full h-full"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, shallowRef } from 'vue'
import { setOptions, importLibrary } from '@googlemaps/js-api-loader'
import PubSidebar from '@/components/PubSidebar.vue'

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

const mapContainer = ref<HTMLElement | null>(null)
const map = shallowRef<google.maps.Map | null>(null)
const markers = ref<google.maps.marker.AdvancedMarkerElement[]>([])
const pubs = ref<Pub[]>([])
const infoWindow = ref<google.maps.InfoWindow | null>(null)
const error = ref<string>('')
const sidebarOpen = ref(false)

const initMap = () => {
  if (!mapContainer.value) {
    console.error('Map container not found')
    return
  }

  const mapOptions: google.maps.MapOptions = {
    center: { lat: 54.0, lng: -2.0 },
    zoom: 6,
    mapTypeId: 'roadmap',
    mapTypeControl: true,
    streetViewControl: false,
    fullscreenControl: true,
    mapId: import.meta.env.VITE_GOOGLE_MAPS_MAP_ID,
  }

  map.value = new google.maps.Map(mapContainer.value, mapOptions)
  infoWindow.value = new google.maps.InfoWindow()
}

const loadPubs = async () => {
  try {
    const response = await fetch('/data/pubs-sample.json')
    if (!response.ok) {
      throw new Error('Failed to load pub data')
    }
    const data = await response.json()
    pubs.value = data
    createMarkers()
  } catch (err) {
    const errorMsg = 'Failed to load pub locations. Please try again later.'
    error.value = errorMsg
    console.error('Error loading pubs:', err)
  }
}

const createMarkers = () => {
  if (!map.value) return

  pubs.value.forEach((pub) => {
    if (!pub.lat || !pub.lng) {
      console.warn(`Pub ${pub.name} is missing coordinates`)
      return
    }

    const marker = new google.maps.marker.AdvancedMarkerElement({
      position: { lat: pub.lat, lng: pub.lng },
      map: map.value!,
      title: pub.name,
    })

    marker.addListener('click', () => {
      showPubInfo(pub, marker)
    })

    markers.value.push(marker)
  })
}

const showPubInfo = (pub: Pub, marker: google.maps.marker.AdvancedMarkerElement) => {
  if (!infoWindow.value) return

  const content = `
    <div class="p-3 min-w-[200px]">
      <h3 class="text-base font-semibold mb-2">${pub.name}</h3>
      <p class="text-sm text-muted-foreground mb-1">${pub.address}</p>
      <p class="text-sm text-muted-foreground mb-2">${pub.townCity}, ${pub.county}</p>
      ${pub.url ? `<a href="${pub.url}" target="_blank" rel="noopener" class="inline-block text-sm text-primary font-medium hover:underline">View Details</a>` : ''}
    </div>
  `

  infoWindow.value.setContent(content)
  infoWindow.value.open(map.value!, marker)
}

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}

const handlePubSelect = (pub: Pub) => {
  // Find the marker for the selected pub
  const marker = markers.value.find((m, index) => pubs.value[index]?.id === pub.id)
  
  if (marker && map.value) {
    // Pan map to pub location
    map.value.panTo({ lat: pub.lat, lng: pub.lng })
    map.value.setZoom(15)
    
    // Show info window
    showPubInfo(pub, marker)
  }
}

onMounted(async () => {
  setOptions({ key: import.meta.env.VITE_GOOGLE_MAPS_API_KEY, v: 'weekly' })
  await importLibrary('maps')
  await importLibrary('marker')

  initMap()
  await loadPubs()
})
</script>
