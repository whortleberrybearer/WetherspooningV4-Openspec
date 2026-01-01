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

    <!-- Login Dialog -->
    <LoginDialog
      :is-open="showLoginDialog"
      @close="showLoginDialog = false"
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
import { SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-vue-next'
import { useAuth } from '@/composables/useAuth'
import { useVisits } from '@/composables/useVisits'
import { useTheme } from '@/composables/useTheme'
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
const showLoginDialog = ref(false)

// User location for proximity detection
const userLocation = ref<{ lat: number; lng: number } | null>(null)
const hasCheckedProximity = ref(false)

// Authentication and visit tracking
const { user, isAuthenticated } = useAuth()
const { isVisited, getVisit, getVisitDate, loadVisits, clearVisits, visitedPubIds, visits, addVisit } = useVisits()
const { isDark } = useTheme()

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

// Watch for theme changes to update info window
watch(isDark, () => {
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

  // Filter pubs: open only
  const candidatePubs = pubs.value.filter(pub => {
    // Filter out closed pubs
    const isClosed = pub.openState?.toLowerCase().includes('closed') || false
    return !isClosed
  })

  if (candidatePubs.length === 0) {
    return null
  }

  // Find closest pub
  let closestPub: Pub | null = null
  let minDistance = Infinity

  for (const pub of candidatePubs) {
    if (!pub.lat || !pub.lng) continue

    const distance = calculateDistance(lat, lng, pub.lat, pub.lng)
    
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
  
  if (nearbyPub) {
    // Auto-center on nearby pub
    map.value!.panTo({ lat: nearbyPub.lat, lng: nearbyPub.lng })
    map.value!.setZoom(15)
    console.log('Map auto-centered on nearby pub:', nearbyPub.name)
    
    // Find marker and open info window
    const marker = markers.value.find(m => {
      const pos = m.position as google.maps.LatLng | google.maps.LatLngLiteral
      const lat = typeof pos.lat === 'function' ? pos.lat() : pos.lat
      const lng = typeof pos.lng === 'function' ? pos.lng() : pos.lng
      return lat === nearbyPub.lat && lng === nearbyPub.lng
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
 */
const centerOnUserLocation = () => {
  if (!map.value) return
  
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
  
  // Theme-aware colors
  const bgColor = isDark.value ? '#1c1917' : '#ffffff'
  const textColor = isDark.value ? '#fafaf9' : '#1f2937'
  const mutedColor = isDark.value ? '#a8a29e' : '#6b7280'
  const buttonBg = isDark.value ? '#fafaf9' : '#0f172a'
  const buttonTextColor = isDark.value ? '#1c1917' : '#f8fafc'
  const buttonHoverBg = isDark.value ? '#e7e5e4' : '#1e293b'
  const linkColor = isDark.value ? '#a1a1aa' : 'hsl(var(--primary))'
  
  // Image section with conditional attribution
  let imageHtml = ''
  if (pub.imageUrl) {
    const attribution = pub.imageUrl.includes('jdwetherspoon.com') 
      ? `<p style="font-size: 10px; color: ${mutedColor}; margin: 4px 0 0 0;">Image © JD Wetherspoon</p>` 
      : ''
    imageHtml = `
      <div style="margin-bottom: 12px;">
        <img src="${pub.imageUrl}" alt="${pub.name}" style="width: 100%; max-height: 200px; object-fit: cover; border-radius: 8px;" />
        ${attribution}
      </div>
    `
  }
  
  // Status badge
  const statusBadge = isClosed 
    ? `<span style="display: inline-flex; align-items: center; border-radius: 6px; border: 1px solid transparent; padding: 2px 10px; font-size: 12px; font-weight: 600; background-color: hsl(var(--destructive)); color: hsl(var(--destructive-foreground));">Closed</span>`
    : `<span style="display: inline-flex; align-items: center; border-radius: 6px; border: 1px solid transparent; padding: 2px 10px; font-size: 12px; font-weight: 600; background-color: #22c55e; color: white;">Open</span>`
  
  // Visit badge with formatted date and rating
  let visitBadge = ''
  let notesPreview = ''
  if (isAuthenticated.value && visited) {
    const visit = getVisit(pub.id)
    const visitDate = visit?.visitedAt
    let formattedDate = ''
    if (visitDate) {
      try {
        const date = new Date(visitDate)
        formattedDate = ' ' + date.toLocaleDateString('en-GB', { 
          day: '2-digit',
          month: '2-digit',
          year: '2-digit'
        })
      } catch (error) {
        console.error('Error formatting visit date:', error)
      }
    }
    
    // Add rating stars if rating exists
    let ratingStars = ''
    if (visit?.rating) {
      const filled = '★'.repeat(visit.rating)
      const empty = '☆'.repeat(5 - visit.rating)
      ratingStars = ` ${filled}${empty}`
    }
    
    visitBadge = `<span style="display: inline-flex; align-items: center; border-radius: 6px; border: 1px solid transparent; padding: 2px 10px; font-size: 12px; font-weight: 600; background-color: #22c55e; color: white;">✓ Visited${formattedDate}${ratingStars}</span>`
    
    // Add notes preview if notes exist
    if (visit?.notes && visit.notes.trim()) {
      const truncatedNotes = visit.notes.length > 100 
        ? visit.notes.substring(0, 100) + '...' 
        : visit.notes
      notesPreview = `
        <div style="background-color: ${isDark.value ? '#292524' : '#f5f5f4'}; border: 1px solid ${isDark.value ? '#44403c' : '#e7e5e4'}; border-radius: 6px; padding: 8px 12px; margin-bottom: 12px; font-size: 12px; color: ${mutedColor};">
          ${truncatedNotes}
        </div>
      `
    }
  }
  
  // Website link
  let websiteLink = ''
  if (pub.url) {
    websiteLink = `<a href="${pub.url}" target="_blank" rel="noopener noreferrer" style="font-size: 14px; color: ${linkColor}; text-decoration: none; display: block; margin-bottom: 12px;" onmouseover="this.style.textDecoration='underline'" onmouseout="this.style.textDecoration='none'">View on Wetherspoons website</a>`
  }
  
  // Button text based on authentication state
  let buttonText = ''
  let buttonId = ''
  if (isAuthenticated.value) {
    buttonText = visited ? 'Update Visit' : 'Visit'
    buttonId = `track-visit-btn-${pub.id}`
  } else {
    buttonText = 'Sign in to track visit'
    buttonId = `sign-in-btn-${pub.id}`
  }

  const content = `
    <style>
      .iw-card {
        min-width: 250px;
        max-width: 400px;
        padding: 16px;
        background: ${bgColor};
        border-radius: 12px;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      }
      .iw-title {
        font-size: 18px;
        font-weight: 600;
        margin: 0 0 8px 0;
        color: ${textColor};
      }
      .iw-badges {
        display: flex;
        gap: 8px;
        margin-bottom: 12px;
        flex-wrap: wrap;
      }
      .iw-address {
        font-size: 14px;
        color: ${mutedColor};
        margin: 0 0 12px 0;
        line-height: 1.5;
      }
      .iw-button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        white-space: nowrap;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 500;
        background-color: ${buttonBg};
        color: ${buttonTextColor};
        height: 36px;
        padding: 0 16px;
        width: 100%;
        border: none;
        cursor: pointer;
        transition: background-color 0.2s;
      }
      .iw-button:hover {
        background-color: ${buttonHoverBg};
      }
      @media (max-width: 450px) {
        .iw-card {
          max-width: calc(100vw - 40px);
        }
      }
    </style>
    <div class="iw-card">
      ${imageHtml}
      <h3 class="iw-title">${pub.name}</h3>
      <div class="iw-badges">
        ${statusBadge}
        ${visitBadge}
      </div>
      ${notesPreview}
      <p class="iw-address">${pub.address}</p>
      ${websiteLink}
      <button id="${buttonId}" class="iw-button">
        ${buttonText}
      </button>
    </div>
  `

  infoWindow.value.setContent(content)
  infoWindow.value.open(map.value!, marker)
  
  // Add click listener to button after DOM update
  setTimeout(() => {
    const button = document.getElementById(buttonId)
    if (button) {
      button.addEventListener('click', () => {
        if (isAuthenticated.value) {
          selectedPub.value = pub
          showPubDetail.value = true
        } else {
          showLoginDialog.value = true
        }
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
