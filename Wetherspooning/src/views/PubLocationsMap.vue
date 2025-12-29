<template>
  <div class="flex h-screen w-full overflow-hidden">
    <!-- Sidebar -->
    <AppSidebar
      :pubs="pubs"
      :show-closed-pubs="showClosedPubs"
      @selectPub="handlePubSelect"
      @toggleClosedPubs="showClosedPubs = !showClosedPubs"
    />

    <!-- Main Content -->
    <SidebarInset class="flex-1 relative">
      <div class="absolute top-4 left-4 z-10">
        <SidebarTrigger />
      </div>

      <Alert v-if="error" variant="destructive" class="absolute top-20 left-1/2 -translate-x-1/2 max-w-md z-[1000]">
        <AlertCircle class="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {{ error }}
        </AlertDescription>
      </Alert>

      <div ref="mapContainer" class="w-full h-full"></div>
    </SidebarInset>

    <!-- Pub Detail Sheet -->
    <PubDetailSheet 
      :pub="selectedPub" 
      :is-open="showPubDetail"
      @update:is-open="showPubDetail = $event"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, shallowRef, computed, watch } from 'vue'
import { setOptions, importLibrary } from '@googlemaps/js-api-loader'
import AppSidebar from '@/components/AppSidebar.vue'
import PubDetailSheet from '@/components/PubDetailSheet.vue'
import { SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-vue-next'
import { useAuth } from '@/composables/useAuth'
import { useVisits } from '@/composables/useVisits'
import { getAllPubs, type Pub } from '@/services/firebaseDataService'

const mapContainer = ref<HTMLElement | null>(null)
const map = shallowRef<google.maps.Map | null>(null)
const markers = ref<google.maps.marker.AdvancedMarkerElement[]>([])
const pubs = ref<Pub[]>([])
const infoWindow = ref<google.maps.InfoWindow | null>(null)
const error = ref<string>('')
const showClosedPubs = ref(false)
const selectedPub = ref<Pub | null>(null)
const showPubDetail = ref(false)

// Authentication and visit tracking
const { user, isAuthenticated } = useAuth()
const { isVisited, getVisitDate, loadVisits, clearVisits } = useVisits()

// Watch authentication state to load/clear visit data
watch(isAuthenticated, async (authenticated) => {
  if (authenticated && user.value?.uid) {
    // Load visits when user logs in using Firebase UID
    await loadVisits(user.value.uid)
    // Recreate markers to show visit status AFTER visits are loaded
    createMarkers()
  } else {
    // Clear visits when user logs out
    clearVisits()
    // Recreate markers to remove visit status
    createMarkers()
  }
})

// Filter pubs for map markers only
const filteredPubsForMap = computed(() => {
  if (showClosedPubs.value) {
    return pubs.value
  }
  return pubs.value.filter(pub => {
    // Treat missing openState as "Open" (fail-safe)
    const state = pub.openState || 'Open'
    return !state.toLowerCase().includes('closed')
  })
})

const initMap = () => {
  if (!mapContainer.value) {
    console.error('Map container not found')
    return
  }

  const mapOptions: google.maps.MapOptions = {
    center: { lat: 54.0, lng: -2.0 },
    zoom: 6,
    mapTypeId: 'roadmap',
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: false,
    mapId: import.meta.env.VITE_GOOGLE_MAPS_MAP_ID,
  }

  map.value = new google.maps.Map(mapContainer.value, mapOptions)
  infoWindow.value = new google.maps.InfoWindow()
  
  // Request user's current location to center map
  centerOnUserLocation()
}

/**
 * Attempts to center the map on the user's current location using the Geolocation API.
 * Falls back to default center (54.0, -2.0) if geolocation is unavailable or denied.
 * Non-blocking - map is immediately usable with default center while geolocation request is pending.
 */
const centerOnUserLocation = () => {
  if (!map.value) return
  
  if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        }
        map.value!.setCenter(userLocation)
        map.value!.setZoom(12)
        console.log('Map centered on user location:', userLocation)
      },
      (error) => {
        console.warn('Geolocation failed:', error.message)
        // Stay at default center - no action needed
      },
      {
        enableHighAccuracy: false,  // Faster response, sufficient accuracy for pub finding
        timeout: 5000,              // 5 second timeout prevents indefinite waiting
        maximumAge: 300000          // Accept cached positions up to 5 minutes old
      }
    )
  } else {
    console.warn('Geolocation not supported by browser')
  }
}

const loadPubs = async () => {
  try {
    const data = await getAllPubs()
    pubs.value = data
    createMarkers()
  } catch (err) {
    const errorMsg = 'Failed to load pub locations. Please check your connection and try again.'
    error.value = errorMsg
    console.error('Error loading pubs from Firestore:', err)
  }
}

// Watch for toggle changes to recreate markers
watch(showClosedPubs, () => {
  createMarkers()
  // Close info window if it's for a pub that's now hidden
  if (infoWindow.value) {
    infoWindow.value.close()
  }
})

const createMarkers = () => {
  if (!map.value) return

  // Clear existing markers
  markers.value.forEach(marker => marker.map = null)
  markers.value = []

  filteredPubsForMap.value.forEach((pub) => {
    if (!pub.lat || !pub.lng) {
      console.warn(`Pub ${pub.name} is missing coordinates`)
      return
    }

    // Check if pub is closed and visited for visual differentiation
    const isClosed = pub.openState?.toLowerCase().includes('closed') || false
    const visited = isVisited(pub.id)

    // Create marker with visual differentiation for 4 states
    const markerElement = document.createElement('div')
    markerElement.className = 'custom-marker'
    markerElement.style.width = '12px'
    markerElement.style.height = '12px'
    markerElement.style.borderRadius = '50%'
    markerElement.style.border = '2px solid white'
    markerElement.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)'
    
    // Determine marker color and opacity based on visited and open state
    if (visited && !isClosed) {
      // Visited + Open: Green at 100% opacity
      markerElement.style.backgroundColor = '#34a853'
      markerElement.style.opacity = '1'
    } else if (visited && isClosed) {
      // Visited + Closed: Blue at 60% opacity
      markerElement.style.backgroundColor = '#4285f4'
      markerElement.style.opacity = '0.6'
    } else if (!visited && isClosed) {
      // Unvisited + Closed: Gray at 60% opacity
      markerElement.style.backgroundColor = '#9ca3af'
      markerElement.style.opacity = '0.6'
    } else {
      // Unvisited + Open: Red at 100% opacity (default)
      markerElement.style.backgroundColor = '#ea4335'
      markerElement.style.opacity = '1'
    }

    const marker = new google.maps.marker.AdvancedMarkerElement({
      position: { lat: pub.lat, lng: pub.lng },
      map: map.value!,
      title: pub.name,
      content: markerElement,
    })

    marker.addListener('click', () => {
      showPubInfo(pub, marker)
    })

    markers.value.push(marker)
  })
}

const showPubInfo = (pub: Pub, marker: google.maps.marker.AdvancedMarkerElement) => {
  if (!infoWindow.value) return

  const isClosed = pub.openState?.toLowerCase().includes('closed') || false
  const visited = isVisited(pub.id)
  
  // Format visit date if available
  let visitBadge = ''
  if (isAuthenticated.value && visited) {
    const visitDate = getVisitDate(pub.id)
    if (visitDate) {
      try {
        const date = new Date(visitDate)
        const formattedDate = date.toLocaleDateString('en-GB', { 
          day: '2-digit',
          month: '2-digit',
          year: '2-digit'
        })
        visitBadge = `<span class="inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-green-500 text-white hover:bg-green-500/80">✓ Visited ${formattedDate}</span>`
      } catch (error) {
        console.error('Error formatting visit date:', error)
      }
    }
  }
  
  // Status badge
  const statusBadge = isClosed 
    ? `<span class="inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80">Closed</span>`
    : `<span class="inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-green-500 text-white hover:bg-green-500/80">Open</span>`

  const content = `
    <div class="rounded-lg border bg-card text-card-foreground shadow-sm min-w-[250px] max-w-[350px]">
      <div class="flex flex-col space-y-1.5 p-4 pb-3">
        <h3 class="text-base font-semibold leading-none tracking-tight">${pub.name}</h3>
        <div class="flex gap-2 mt-2">
          ${statusBadge}
          ${visitBadge}
        </div>
      </div>
      <div class="p-4 pt-0">
        <p class="text-sm text-muted-foreground mb-1">${pub.address}</p>
        <p class="text-sm text-muted-foreground mb-3">${pub.townCity}, ${pub.county}</p>
        <button id="track-visit-btn-${pub.id}" class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4">
          Track Visit
        </button>
      </div>
    </div>
  `

  infoWindow.value.setContent(content)
  infoWindow.value.open(map.value!, marker)
  
  // Add click listener to Track Visit button after DOM update
  setTimeout(() => {
    const trackButton = document.getElementById(`track-visit-btn-${pub.id}`)
    if (trackButton) {
      trackButton.addEventListener('click', () => {
        selectedPub.value = pub
        showPubDetail.value = true
      })
    }
  }, 0)
}

const handlePubSelect = (pub: Pub) => {
  // Find the marker for the selected pub based on position
  const marker = markers.value.find(m => {
    const pos = m.position as google.maps.LatLng | google.maps.LatLngLiteral
    const lat = typeof pos.lat === 'function' ? pos.lat() : pos.lat
    const lng = typeof pos.lng === 'function' ? pos.lng() : pos.lng
    return lat === pub.lat && lng === pub.lng
  })
  
  if (map.value) {
    // Pan map to pub location
    map.value.panTo({ lat: pub.lat, lng: pub.lng })
    map.value.setZoom(15)
    
    // Show info window - marker should always exist since sidebar is filtered same as map
    if (marker) {
      showPubInfo(pub, marker)
    }
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
