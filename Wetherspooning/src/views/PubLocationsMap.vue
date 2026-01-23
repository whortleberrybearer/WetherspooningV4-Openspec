<template>
  <div class="flex h-screen w-full overflow-hidden">
    <!-- Sidebar -->
    <AppSidebar
      :pubs="pubs"
      :show-closed-pubs="showClosedPubs"
      :shared-visits-mode="props.sharedVisitsMode"
      @selectPub="handlePubSelect"
      @toggleClosedPubs="showClosedPubs = !showClosedPubs"
    />

    <!-- Main Content -->
    <SidebarInset class="flex-1 relative">
      <div class="absolute top-4 left-4 right-4 md:right-auto z-10">
        <div class="flex items-center gap-3">
          <div class="hidden md:block shrink-0">
            <SidebarTrigger />
          </div>
          <!-- Location Search -->
          <LocationSearch
            :is-dark="isDark"
            @place-changed="handlePlaceChanged"
          />
        </div>
        <!-- Mobile: Trigger below search -->
        <div class="md:hidden mt-2">
          <SidebarTrigger />
        </div>
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
      :is-readonly="!!props.sharedVisitsMode"
      @update:is-open="showPubDetail = $event"
    />

    <!-- Login Dialog -->
    <LoginDialog
      :is-open="showLoginDialog"
      @close="showLoginDialog = false"
      @open-password-reset="handleOpenPasswordReset"
    />

    <!-- Password Reset Dialog -->
    <PasswordResetDialog
      :is-open="showPasswordResetDialog"
      @close="showPasswordResetDialog = false"
      @open-login="handleOpenLogin"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, shallowRef, computed, watch } from 'vue'
import { setOptions, importLibrary } from '@googlemaps/js-api-loader'
import { MarkerClusterer } from '@googlemaps/markerclusterer'
import AppSidebar from '@/components/AppSidebar.vue'
import PubDetailSheet from '@/components/PubDetailSheet.vue'
import LoginDialog from '@/components/LoginDialog.vue'
import PasswordResetDialog from '@/components/PasswordResetDialog.vue'
import LocationSearch from '@/components/LocationSearch.vue'
import { SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-vue-next'
import { useAuth } from '@/composables/useAuth'
import { useVisits } from '@/composables/useVisits'
import { useTheme } from '@/composables/useTheme'
import { getAllPubs } from '@/services/pubDataService'
import type { Pub, Visit } from '@/services/firebaseDataService'
import { createCustomPubOverlay, type CustomPubOverlay } from '@/components/CustomPubOverlay'

// Props for shared visit mode
const props = defineProps<{
  sharedVisitsMode?: {
    userId: string
    username: string
    visits: Visit[]
  } | null
}>()

console.log('PubLocationsMap: Received sharedVisitsMode:', props.sharedVisitsMode)

const mapContainer = ref<HTMLElement | null>(null)
const map = shallowRef<google.maps.Map | null>(null)
const markers = ref<google.maps.marker.AdvancedMarkerElement[]>([])
const visitedClusterer = shallowRef<MarkerClusterer | null>(null)
const unvisitedClusterer = shallowRef<MarkerClusterer | null>(null)
const pubs = ref<Pub[]>([])
const pubOverlay = shallowRef<CustomPubOverlay | null>(null)
const error = ref<string>('')
const showClosedPubs = ref(false)
const selectedPub = ref<Pub | null>(null)
const showPubDetail = ref(false)
const showLoginDialog = ref(false)
const showPasswordResetDialog = ref(false)

// User location for proximity detection
const userLocation = ref<{ lat: number; lng: number } | null>(null)
const hasCheckedProximity = ref(false)

// Authentication and visit tracking
const { user, isAuthenticated } = useAuth()
const { isVisited, getVisit, getVisitDate, loadVisits, clearVisits, visitedPubIds, visits, addVisit } = useVisits()
const { isDark } = useTheme()

// Shared visit state
const sharedVisitIds = computed(() => {
  if (!props.sharedVisitsMode) return new Set<string>()
  return new Set(props.sharedVisitsMode.visits.map(v => v.pubId))
})

const sharedVisitMap = computed(() => {
  if (!props.sharedVisitsMode) return new Map<string, Visit>()
  return new Map(props.sharedVisitsMode.visits.map(v => [v.pubId, v]))
})

// Helper functions that work in both own and shared modes
const isMarkerVisited = (pubId: string): boolean => {
  return props.sharedVisitsMode ? sharedVisitIds.value.has(pubId) : isVisited(pubId)
}

const getMarkerVisit = (pubId: string): Visit | null => {
  return props.sharedVisitsMode ? (sharedVisitMap.value.get(pubId) || null) : getVisit(pubId)
}

// Watch authentication state to load/clear visit data (only in own visits mode)
watch(isAuthenticated, async (authenticated) => {
  // Skip if in shared visits mode
  if (props.sharedVisitsMode) return

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

// Watch for changes in visit data to update markers and clusters
watch([visitedPubIds, visits, () => props.sharedVisitsMode], () => {
  // Recreate markers to reflect visit status changes (checkmark icons)
  createMarkers()
  
  // Update overlay if there's a selected pub
  if (selectedPub.value && pubOverlay.value) {
    pubOverlay.value.update(selectedPub.value, isDark.value)
  }
}, { deep: true })

// Watch for theme changes to update markers and overlay
watch(isDark, () => {
  // Recreate markers with theme-appropriate colors
  createMarkers()
  
  // Update overlay if there's a selected pub
  if (selectedPub.value && pubOverlay.value) {
    pubOverlay.value.update(selectedPub.value, isDark.value)
  }
})

// Filter pubs for map markers only (must have position data)
const filteredPubsForMap = computed(() => {
  // First filter: only pubs with position
  let filtered = pubs.value.filter(pub => pub.position !== null)
  
  // Second filter: closed pubs if toggle is off
  if (!showClosedPubs.value) {
    filtered = filtered.filter(pub => {
      // Treat missing openState as "Open" (fail-safe)
      const state = pub.openState || 'Open'
      return state !== 'Closed'
    })
  }
  
  return filtered
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
        <svg fill="${backgroundColor}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" width="72" height="72">
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
      textElement.style.fontSize = '18px'
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
  
  // Initialize custom pub overlay
  pubOverlay.value = createCustomPubOverlay({
    onClose: () => {
      selectedPub.value = null
      pubOverlay.value?.hide()
    },
    onTrackVisit: (pub) => {
      selectedPub.value = pub
      showPubDetail.value = true
    },
    onSignIn: () => {
      showLoginDialog.value = true
    },
    isAuthenticated: () => isAuthenticated.value,
    getVisit: (pubId: string) => getMarkerVisit(pubId),
    isVisited: (pubId: string) => isMarkerVisited(pubId)
  })
  pubOverlay.value.setMap(map.value)
  
  // Request user's current location to center map
  centerOnUserLocation()
}

/**
 * Calculate the distance between two geographic coordinates using the Haversine formula.
 * 
 * The Haversine formula calculates the great-circle distance between two points
 * on a sphere given their longitudes and latitudes. This is accurate for short
 * distances (< 100km) and doesn't require external libraries.
 * 
 * @param lat1 - Latitude of first point in decimal degrees
 * @param lng1 - Longitude of first point in decimal degrees
 * @param lat2 - Latitude of second point in decimal degrees
 * @param lng2 - Longitude of second point in decimal degrees
 * @returns Distance in metres
 */
const calculateDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number => {
  const R = 6371e3 // Earth's radius in metres
  const φ1 = lat1 * Math.PI / 180 // Convert to radians
  const φ2 = lat2 * Math.PI / 180
  const Δφ = (lat2 - lat1) * Math.PI / 180
  const Δλ = (lng2 - lng1) * Math.PI / 180

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))

  return R * c // Distance in metres
}

/**
 * Check if the user is near any open pubs and return the closest one if within 100 metres.
 * 
 * Filters pubs to only consider open pubs (excludes closed).
 * 
 * @param lat - User's latitude
 * @param lng - User's longitude
 * @returns The closest pub if within 100 metres, otherwise null
 */
const checkProximity = (lat: number, lng: number): Pub | null => {
  if (pubs.value.length === 0) {
    return null
  }

  // Filter pubs: must have position and be open
  const candidatePubs = pubs.value.filter(pub => {
    // Filter out pubs without position
    if (!pub.position) return false
    
    // Filter out closed pubs
    const isClosed = pub.openState === 'Closed'
    return !isClosed
  })

  if (candidatePubs.length === 0) {
    return null
  }

  // Find closest pub
  let closestPub: Pub | null = null
  let minDistance = Infinity

  for (const pub of candidatePubs) {
    // Position already validated by filter, but TypeScript needs the check
    if (!pub.position) continue

    const distance = calculateDistance(lat, lng, pub.position.lat, pub.position.lng)
    
    if (distance < minDistance) {
      minDistance = distance
      closestPub = pub
    }
  }

  // Only return pub if within 100 metres
  if (closestPub && minDistance <= 100) {
    console.log(`Nearby pub detected: ${closestPub.name} at ${Math.round(minDistance)}m`)
    return closestPub
  }
  
  return null
}

/**
 * Perform proximity check and auto-center if nearby pub found.
 * Only runs once when both user location and pubs are available.
 */
const performProximityCheck = () => {
  if (!userLocation.value || hasCheckedProximity.value) return
  
  hasCheckedProximity.value = true
  
  const nearbyPub = checkProximity(userLocation.value.lat, userLocation.value.lng)
  
  if (nearbyPub && nearbyPub.position) {
    // Auto-center on nearby pub
    map.value!.panTo({ lat: nearbyPub.position.lat, lng: nearbyPub.position.lng })
    map.value!.setZoom(15)
    console.log('Map auto-centered on nearby pub:', nearbyPub.name)
    
    // Find marker and open info window
    const marker = markers.value.find(m => {
      const pos = m.position as google.maps.LatLng | google.maps.LatLngLiteral
      const lat = typeof pos.lat === 'function' ? pos.lat() : pos.lat
      const lng = typeof pos.lng === 'function' ? pos.lng() : pos.lng
      return lat === nearbyPub.position!.lat && lng === nearbyPub.position!.lng
    })
    
    if (marker) {
      showPubInfo(nearbyPub, marker)
    }
  } else {
    // No nearby pub - center on user location
    map.value!.setCenter(userLocation.value)
    map.value!.setZoom(12)
    console.log('Map centered on user location (no nearby pubs):', userLocation.value)
  }
}

/**
 * Attempts to center the map on the user's current location using the Geolocation API.
 * Falls back to default center (54.0, -2.0) if geolocation is unavailable or denied.
 * Non-blocking - map is immediately usable with default center while geolocation request is pending.
 * On first geolocation, checks proximity and auto-centers on nearby pub if within 100m.
 * 
 * Disabled in shared visits mode to avoid confusing UX.
 */
const centerOnUserLocation = () => {
  if (!map.value) return

  // Skip geolocation in shared visits mode
  if (props.sharedVisitsMode) return
  
  if ('geolocation' in navigator) {
    // Get initial position for map centering and proximity check
    navigator.geolocation.getCurrentPosition(
      (position) => {
        userLocation.value = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        }
        console.log('User location obtained:', userLocation.value)
        
        // Trigger proximity check if pubs are already loaded
        if (pubs.value.length > 0 && !hasCheckedProximity.value) {
          performProximityCheck()
        }
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
    
    // After markers are created, trigger proximity check if geolocation already completed
    if (userLocation.value && !hasCheckedProximity.value) {
      performProximityCheck()
    }
  } catch (err) {
    const errorMsg = 'Failed to load pub locations. Please check your connection and try again.'
    error.value = errorMsg
    console.error('Error loading pubs from Firestore:', err)
  }
}

// Watch for toggle changes to recreate markers
watch(showClosedPubs, () => {
  createMarkers()
  // Close overlay if it's for a pub that's now hidden
  if (pubOverlay.value) {
    pubOverlay.value.hide()
  }
})

/**
 * Creates map markers for all filtered pubs with enhanced pin-style design.
 * 
 * Markers use a traditional pin/teardrop shape (30px × 40px) with SVG for crisp rendering.
 * State is communicated through icons (not just color) for accessibility:
 * - Visited: Checkmark (✓) icon inside pin
 * - Closed: Red badge with X icon in top-right corner
 * 
 * Colors provide supplementary context:
 * - Green: Visited pubs
 * - Blue: Unvisited pubs
 * - Red badge: Closed state (when applicable)
 * 
 * Theme-aware: Colors adapt to light/dark mode via isDark composable.
 */
const createMarkers = () => {
  if (!map.value) return

  // Clear existing markers
  markers.value.forEach(marker => marker.map = null)
  markers.value = []

  filteredPubsForMap.value.forEach((pub) => {
    // Position is guaranteed to exist by filteredPubsForMap filter
    if (!pub.position) {
      console.warn(`Pub ${pub.name} is missing position (should have been filtered)`);      return
    }

    // Check if pub is closed and visited for visual differentiation
    const isClosed = pub.openState === 'Closed'
    const visited = isMarkerVisited(pub.id)

    // Create enhanced pin marker with SVG
    const markerElement = document.createElement('div')
    markerElement.className = 'enhanced-marker'
    markerElement.dataset.visited = String(visited)
    markerElement.dataset.closed = String(isClosed)
    
    // Determine marker color based on visited state (green for visited, blue for unvisited)
    let markerColor = ''
    
    if (visited) {
      // Visited: Green
      markerColor = isDark.value ? '#16a34a' : '#22c55e'
    } else {
      // Unvisited: Blue
      markerColor = isDark.value ? '#2563eb' : '#3b82f6'
    }
    
    // Build SVG pin marker with state icons
    markerElement.innerHTML = `
      <svg class="marker-pin" viewBox="0 0 30 40" xmlns="http://www.w3.org/2000/svg" style="width: 36px; height: 48px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));">
        <!-- Pin shape: rounded top with pointed bottom -->
        <path d="M15,0 C6.716,0 0,6.716 0,15 C0,23.284 15,40 15,40 S30,23.284 30,15 C30,6.716 23.284,0 15,0 Z" 
              fill="${markerColor}" 
              stroke="white" 
              stroke-width="2"/>
        
        <!-- Visited checkmark icon (white) -->
        ${visited ? `
          <path d="M10,16 L13,19 L20,12" 
                fill="none" 
                stroke="white" 
                stroke-width="2.5" 
                stroke-linecap="round" 
                stroke-linejoin="round"/>
        ` : ''}
      </svg>
    `
    
    // Add state badge based on openState
    const openState = pub.openState || 'Open'
    if (openState !== 'Open') {
      const badge = document.createElement('div')
      badge.className = 'state-badge'
      
      // Determine badge color and content based on state
      let badgeColor = '#6b7280' // gray default
      let badgeIcon = ''
      
      if (openState === 'Closed') {
        badgeColor = '#ef4444' // red
        badgeIcon = `
          <svg viewBox="0 0 12 12" style="width: 10px; height: 10px;">
            <line x1="3" y1="3" x2="9" y2="9" stroke="white" stroke-width="2" stroke-linecap="round"/>
            <line x1="9" y1="3" x2="3" y2="9" stroke="white" stroke-width="2" stroke-linecap="round"/>
          </svg>
        `
      } else if (openState === 'Temporary Closed') {
        badgeColor = '#f97316' // orange
        badgeIcon = `
          <svg viewBox="0 0 12 12" style="width: 10px; height: 10px;">
            <path d="M6 3 L6 7 M6 9 L6 9.5" stroke="white" stroke-width="2" stroke-linecap="round"/>
          </svg>
        `
      } else if (openState.startsWith('Opening')) {
        badgeColor = '#f97316' // orange
        badgeIcon = `
          <svg viewBox="0 0 12 12" style="width: 10px; height: 10px;">
            <path d="M6 3 L6 7 M6 9 L6 9.5" stroke="white" stroke-width="2" stroke-linecap="round"/>
          </svg>
        `
      } else if (openState.startsWith('Reopening')) {
        badgeColor = '#f97316' // orange
        badgeIcon = `
          <svg viewBox="0 0 12 12" style="width: 10px; height: 10px;">
            <path d="M6 3 L6 7 M6 9 L6 9.5" stroke="white" stroke-width="2" stroke-linecap="round"/>
          </svg>
        `
      }
      
      badge.style.cssText = `
        position: absolute;
        top: -4px;
        right: -4px;
        width: 18px;
        height: 18px;
        background: ${badgeColor};
        border: 2px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      `
      
      badge.innerHTML = badgeIcon
      markerElement.appendChild(badge)
    }
    
    // Style the marker container
    markerElement.style.cssText = `
      width: 36px;
      height: 48px;
      position: relative;
      cursor: pointer;
      transform-origin: bottom center;
      transition: transform 0.2s ease;
    `

    const marker = new google.maps.marker.AdvancedMarkerElement({
      position: { lat: pub.position.lat, lng: pub.position.lng },
      map: map.value!,
      title: pub.name,
      content: markerElement,
    })

    // Add hover effect
    markerElement.addEventListener('mouseenter', () => {
      markerElement.style.transform = 'scale(1.1)'
      markerElement.style.zIndex = '1000'
    })
    
    markerElement.addEventListener('mouseleave', () => {
      markerElement.style.transform = 'scale(1)'
      markerElement.style.zIndex = ''
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
    
    const pub = filteredPubsForMap.value.find(p => p.position?.lat === lat && p.position?.lng === lng)
    
    if (pub) {
      if (isMarkerVisited(pub.id)) {
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
      renderer: createClusterRenderer(isDark.value ? '#16a34a' : '#22c55e'),
      algorithmOptions: {
        maxZoom: 12
      }
    })
  } else {
    visitedClusterer.value.addMarkers(visited)
  }
  
  // Create or update unvisited clusterer (blue)
  if (!unvisitedClusterer.value) {
    unvisitedClusterer.value = new MarkerClusterer({
      map: map.value,
      markers: unvisited,
      renderer: createClusterRenderer(isDark.value ? '#2563eb' : '#3b82f6'),
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
  if (!pubOverlay.value) return

  const position = marker.position as google.maps.LatLng
  pubOverlay.value.show(pub, position, isDark.value)
  selectedPub.value = pub
}

const handlePubSelect = (pub: Pub) => {
  // Only handle pubs with position (pubs without position shouldn't be selectable on map)
  if (!pub.position) {
    console.warn(`Cannot select pub ${pub.name} - missing position`)
    return
  }
  
  // Find the marker for the selected pub based on position
  const marker = markers.value.find(m => {
    const pos = m.position as google.maps.LatLng | google.maps.LatLngLiteral
    const lat = typeof pos.lat === 'function' ? pos.lat() : pos.lat
    const lng = typeof pos.lng === 'function' ? pos.lng() : pos.lng
    return lat === pub.position!.lat && lng === pub.position!.lng
  })
  
  if (map.value) {
    // Pan map to pub location
    map.value.panTo({ lat: pub.position.lat, lng: pub.position.lng })
    map.value.setZoom(15)
    
    // Show info window - marker should exist since pub has position
    if (marker) {
      showPubInfo(pub, marker)
    }
  }
}

const handleOpenPasswordReset = () => {
  showLoginDialog.value = false
  showPasswordResetDialog.value = true
}

const handleOpenLogin = () => {
  showPasswordResetDialog.value = false
  showLoginDialog.value = true
}

const handlePlaceChanged = (place: google.maps.places.PlaceResult) => {
  if (!map.value) {
    console.error('Map not initialized')
    return
  }

  if (!place.geometry?.location) {
    console.error('Place has no geometry')
    return
  }

  const location = place.geometry.location
  
  // Determine zoom level based on place type
  let zoom = 15 // Default zoom
  if (place.types) {
    // Cities/regions get lower zoom (14), addresses/landmarks get higher zoom (16)
    if (place.types.includes('locality') || place.types.includes('administrative_area_level_2')) {
      zoom = 14
    } else if (place.types.includes('street_address') || place.types.includes('premise')) {
      zoom = 16
    }
  }

  // Center map on selected location
  map.value.panTo(location)
  map.value.setZoom(zoom)
  
  console.log(`Map centered on: ${place.name} (zoom: ${zoom})`)
}

onMounted(async () => {
  setOptions({ key: import.meta.env.VITE_GOOGLE_MAPS_API_KEY, v: 'weekly' })
  await importLibrary('maps')
  await importLibrary('marker')
  await importLibrary('places')

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
