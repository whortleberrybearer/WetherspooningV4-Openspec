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
import { ref, onMounted, onBeforeUnmount, shallowRef, computed, watch } from 'vue'
import { setOptions, importLibrary } from '@googlemaps/js-api-loader'
import { MarkerClusterer } from '@googlemaps/markerclusterer'
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
const visitedClusterer = shallowRef<MarkerClusterer | null>(null)
const unvisitedClusterer = shallowRef<MarkerClusterer | null>(null)
const pubs = ref<Pub[]>([])
const infoWindow = ref<google.maps.InfoWindow | null>(null)
const error = ref<string>('')
const showClosedPubs = ref(false)
const selectedPub = ref<Pub | null>(null)
const showPubDetail = ref(false)

// Authentication and visit tracking
const { user, isAuthenticated } = useAuth()
const { isVisited, getVisitDate, loadVisits, clearVisits, visitedPubIds, visits } = useVisits()

// Watch authentication state to load/clear visit data
watch(isAuthenticated, async (authenticated) => {
  if (authenticated && user.value?.uid) {
    // Load visits when user logs in using Firebase UID
    await loadVisits(user.value.uid)
    // Update clusters to show visit status AFTER visits are loaded
    updateClusters()
  } else {
    // Clear visits when user logs out
    clearVisits()
    // Update clusters to remove visit status
    updateClusters()
  }
})

// Watch for changes in visit data to update clusters and info window
watch([visitedPubIds, visits], () => {
  // Update clusters to reflect visit status changes
  updateClusters()
  
  // Update info window if there's a selected pub
  if (selectedPub.value && infoWindow.value) {
    const marker = markers.value.find(m => {
      const pos = m.position as google.maps.LatLng | google.maps.LatLngLiteral
      const lat = typeof pos.lat === 'function' ? pos.lat() : pos.lat
      const lng = typeof pos.lng === 'function' ? pos.lng() : pos.lng
      return lat === selectedPub.value!.lat && lng === selectedPub.value!.lng
    })
    if (marker) {
      showPubInfo(selectedPub.value, marker)
    }
  }
}, { deep: true })

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

/**
 * Creates a custom cluster renderer for styling clusters
 * @param backgroundColor - Background color for the cluster marker
 * @returns A renderer function for MarkerClusterer
 */
const createClusterRenderer = (backgroundColor: string) => {
  return {
    render: ({ count, position }: { count: number; position: google.maps.LatLng }) => {
      const svg = `
        <svg fill="${backgroundColor}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" width="50" height="50">
          <circle cx="120" cy="120" opacity="1" r="70" />
          <circle cx="120" cy="120" opacity="1" r="55" stroke="white" stroke-width="4" fill="${backgroundColor}" />
        </svg>
      `
      
      const clusterElement = document.createElement('div')
      clusterElement.innerHTML = svg
      clusterElement.style.position = 'relative'
      clusterElement.style.cursor = 'pointer'
      
      const textElement = document.createElement('div')
      textElement.textContent = String(count)
      textElement.style.position = 'absolute'
      textElement.style.top = '50%'
      textElement.style.left = '50%'
      textElement.style.transform = 'translate(-50%, -50%)'
      textElement.style.color = 'white'
      textElement.style.fontSize = '14px'
      textElement.style.fontWeight = 'bold'
      textElement.style.fontFamily = 'Arial, sans-serif'
      textElement.style.pointerEvents = 'none'
      
      clusterElement.appendChild(textElement)
      
      return new google.maps.marker.AdvancedMarkerElement({
        position,
        content: clusterElement,
        zIndex: 1000 + count,
      })
    }
  }
}

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
  
  // Initialize clusterers after markers are created
  initializeClusters()
}

/**
 * Separates markers into visited and unvisited groups for clustering
 * @returns Object with visited and unvisited marker arrays
 */
const separateMarkers = (): { 
  visited: google.maps.marker.AdvancedMarkerElement[], 
  unvisited: google.maps.marker.AdvancedMarkerElement[] 
} => {
  const visited: google.maps.marker.AdvancedMarkerElement[] = []
  const unvisited: google.maps.marker.AdvancedMarkerElement[] = []
  
  markers.value.forEach(marker => {
    // Find the pub associated with this marker
    const markerPos = marker.position as google.maps.LatLng | google.maps.LatLngLiteral
    const lat = typeof markerPos.lat === 'function' ? markerPos.lat() : markerPos.lat
    const lng = typeof markerPos.lng === 'function' ? markerPos.lng() : markerPos.lng
    
    const pub = filteredPubsForMap.value.find(p => p.lat === lat && p.lng === lng)
    
    if (pub) {
      if (isVisited(pub.id)) {
        visited.push(marker)
      } else {
        unvisited.push(marker)
      }
    } else {
      // Default to unvisited if pub not found
      console.warn('Marker without associated pub found')
      unvisited.push(marker)
    }
  })
  
  return { visited, unvisited }
}

/**
 * Initializes or updates the marker clusterers for visited and unvisited pubs
 */
const initializeClusters = () => {
  if (!map.value) return
  
  // Clear existing clusterers
  if (visitedClusterer.value) {
    visitedClusterer.value.clearMarkers()
  }
  if (unvisitedClusterer.value) {
    unvisitedClusterer.value.clearMarkers()
  }
  
  // Separate markers based on visit status
  const { visited, unvisited } = separateMarkers()
  
  // Create or update visited clusterer (green)
  if (!visitedClusterer.value) {
    visitedClusterer.value = new MarkerClusterer({
      map: map.value,
      markers: visited,
      renderer: createClusterRenderer('#34a853'),
      algorithmOptions: {
        maxZoom: 12
      }
    })
  } else {
    visitedClusterer.value.addMarkers(visited)
  }
  
  // Create or update unvisited clusterer (red)
  if (!unvisitedClusterer.value) {
    unvisitedClusterer.value = new MarkerClusterer({
      map: map.value,
      markers: unvisited,
      renderer: createClusterRenderer('#ea4335'),
      algorithmOptions: {
        maxZoom: 12
      }
    })
  } else {
    unvisitedClusterer.value.addMarkers(unvisited)
  }
}

/**
 * Updates cluster groupings when visit status changes
 */
const updateClusters = () => {
  if (!visitedClusterer.value || !unvisitedClusterer.value) return
  
  // Clear markers from both clusterers
  visitedClusterer.value.clearMarkers()
  unvisitedClusterer.value.clearMarkers()
  
  // Re-separate markers based on current visit status
  const { visited, unvisited } = separateMarkers()
  
  // Add markers back to appropriate clusterers
  visitedClusterer.value.addMarkers(visited)
  unvisitedClusterer.value.addMarkers(unvisited)
}

const showPubInfo = (pub: Pub, marker: google.maps.marker.AdvancedMarkerElement) => {
  if (!infoWindow.value) return

  const isClosed = pub.openState?.toLowerCase().includes('closed') || false
  const visited = isVisited(pub.id)
  
  // Parse address components by splitting on comma
  // Last part is postcode, second-to-last and third-to-last are town/county
  // Everything before that is street address
  const addressParts = pub.address.split(',').map(part => part.trim())
  const postcode = addressParts[addressParts.length - 1] || ''
  const county = addressParts[addressParts.length - 2] || ''
  const town = addressParts[addressParts.length - 3] || ''
  const streetParts = addressParts.slice(0, -3)
  const street = streetParts.length > 0 ? streetParts.join(', ') : addressParts[0] || ''
  
  // Build address HTML with 3 lines: street, town/county, postcode
  let addressHtml = ''
  if (street) {
    addressHtml += `<p style="font-size: 14px; color: #6b7280; margin: 0 0 4px 0;">${street}</p>`
  }
  if (town || county) {
    const townCounty = [town, county].filter(Boolean).join(', ')
    addressHtml += `<p style="font-size: 14px; color: #6b7280; margin: 0 0 4px 0;">${townCounty}</p>`
  }
  if (postcode) {
    addressHtml += `<p style="font-size: 14px; color: #6b7280; margin: 0 0 12px 0;">${postcode}</p>`
  }
  
  // If no address parts, fallback to raw address
  if (!addressHtml) {
    addressHtml = `<p style="font-size: 14px; color: #6b7280; margin: 0 0 12px 0;">${pub.address}</p>`
  }
  
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
        visitBadge = `<span class="inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-green-500 text-white hover:bg-green-500/80">✓ Visited</span>`
      }
    } else {
      // No date, show visited badge without date
      visitBadge = `<span class="inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-green-500 text-white hover:bg-green-500/80">✓ Visited</span>`
    }
  }
  
  // Status badge
  const statusBadge = isClosed 
    ? `<span class="inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80">Closed</span>`
    : `<span class="inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-green-500 text-white hover:bg-green-500/80">Open</span>`

  // Image section
  let imageHtml = ''
  if (pub.imageUrl) {
    imageHtml = `
      <div style="flex: 0 0 200px; max-width: 200px;">
        <img src="${pub.imageUrl}" alt="${pub.name}" style="width: 100%; max-height: 200px; object-fit: cover; border-radius: 8px; margin-bottom: 4px;" />
        ${pub.imageUrl.includes('jdwetherspoon.com') ? '<p style="font-size: 10px; color: #6b7280; opacity: 0.7; margin: 0;">Image © JD Wetherspoon</p>' : ''}
      </div>
    `
  }
  
  // Website link
  let websiteLink = ''
  if (pub.url) {
    websiteLink = `<a href="${pub.url}" target="_blank" rel="noopener noreferrer" class="text-sm text-primary hover:underline mb-3 block">View on Wetherspoons website</a>`
  }

  const content = `
    <div style="min-width: 250px; max-width: 500px; padding: 12px;">
      <h3 style="font-size: 16px; font-weight: 600; margin: 0 0 8px 0;">${pub.name}</h3>
      <div style="display: flex; gap: 8px; margin-bottom: 12px;">
        ${statusBadge}
        ${visitBadge}
      </div>
      <div style="display: flex; gap: 16px; flex-wrap: wrap;">
        ${imageHtml ? `
          <div style="flex: 1; min-width: 200px; display: flex; flex-direction: column;">
            ${addressHtml}
            ${websiteLink}
            <button id="track-visit-btn-${pub.id}" class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 w-full" style="margin-top: auto;">
              ${visited ? 'Update Visit' : 'Visit'}
            </button>
          </div>
          ${imageHtml}
        ` : `
          <div style="flex: 1;">
            ${addressHtml}
            ${websiteLink}
            <button id="track-visit-btn-${pub.id}" class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 w-full">
              ${visited ? 'Update Visit' : 'Visit'}
            </button>
          </div>
        `}
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

onBeforeUnmount(() => {
  // Clear markers from clusterers
  if (visitedClusterer.value) {
    visitedClusterer.value.clearMarkers()
    visitedClusterer.value = null
  }
  if (unvisitedClusterer.value) {
    unvisitedClusterer.value.clearMarkers()
    unvisitedClusterer.value = null
  }
  
  // Clear individual markers
  markers.value.forEach(marker => marker.map = null)
  markers.value = []
})
</script>
