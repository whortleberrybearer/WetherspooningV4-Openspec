<template>
  <div ref="mapContainer" class="w-full h-full"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, shallowRef, computed, watch } from 'vue'
import { setOptions, importLibrary } from '@googlemaps/js-api-loader'
import { MarkerClusterer } from '@googlemaps/markerclusterer'
import type { Pub, Visit } from '@/services/firebaseDataService'
import { createCustomPubOverlay, type CustomPubOverlay } from './CustomPubOverlay'
import { isPubClosed } from '@/utils/pubUtils'

interface Props {
  pubs: Pub[]
  showClosedPubs: boolean
  visits: readonly Visit[]
  isAuthenticated: boolean
  isDark: boolean
  userLocation?: { lat: number; lng: number } | null
  readonly?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:userLocation': [location: { lat: number; lng: number } | null]
  'openPubDetail': [pub: Pub]
  'openLogin': []
  'pubSelect': [pub: Pub]
}>()

const mapContainer = ref<HTMLElement | null>(null)
const map = shallowRef<google.maps.Map | null>(null)
const markers = ref<google.maps.marker.AdvancedMarkerElement[]>([])
const visitedClusterer = shallowRef<MarkerClusterer | null>(null)
const unvisitedClusterer = shallowRef<MarkerClusterer | null>(null)
const pubOverlay = shallowRef<CustomPubOverlay | null>(null)
const selectedPub = ref<Pub | null>(null)
const hasCheckedProximity = ref(false)

// Compute visitedPubIds Set locally for O(1) lookup
const visitedPubIds = computed(() => new Set(props.visits.map(v => v.pubId)))

// Helper functions for visit status
const isVisited = (pubId: string) => visitedPubIds.value.has(pubId)
const getVisit = (pubId: string) => props.visits.find(v => v.pubId === pubId) || null

// Filter pubs for map markers only (must have position data)
const filteredPubsForMap = computed(() => {
  // First filter: only pubs with position
  let filtered = props.pubs.filter(pub => pub.position !== null)
  
  // Second filter: closed pubs if toggle is off
  if (!props.showClosedPubs) {
    filtered = filtered.filter(pub => !isPubClosed(pub))
  }
  
  return filtered
})

// Watch for changes in visit data to update markers and clusters
watch([visitedPubIds, () => props.visits], () => {
  createMarkers()
  if (selectedPub.value && pubOverlay.value) {
    pubOverlay.value.update(selectedPub.value, props.isDark)
  }
}, { deep: true })

// Watch for theme changes to update markers and overlay
watch(() => props.isDark, () => {
  createMarkers()
  if (selectedPub.value && pubOverlay.value) {
    pubOverlay.value.update(selectedPub.value, props.isDark)
  }
})

// Watch for toggle changes to recreate markers
watch(() => props.showClosedPubs, () => {
  createMarkers()
  if (pubOverlay.value) {
    pubOverlay.value.hide()
  }
})

/**
 * Creates a custom cluster renderer for styling clusters
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
      emit('openPubDetail', pub)
    },
    onSignIn: () => {
      emit('openLogin')
    },
    isAuthenticated: () => props.isAuthenticated,
    getVisit: (pubId: string) => getVisit(pubId),
    isVisited: (pubId: string) => isVisited(pubId)
  })
  pubOverlay.value.setMap(map.value)
  
  // Request user's current location to center map
  centerOnUserLocation()
}

/**
 * Calculate the distance between two geographic coordinates using the Haversine formula
 */
const calculateDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number => {
  const R = 6371e3
  const φ1 = lat1 * Math.PI / 180
  const φ2 = lat2 * Math.PI / 180
  const Δφ = (lat2 - lat1) * Math.PI / 180
  const Δλ = (lng2 - lng1) * Math.PI / 180

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))

  return R * c
}

/**
 * Check if the user is near any open pubs and return the closest one if within 100 metres
 */
const checkProximity = (lat: number, lng: number): Pub | null => {
  if (props.pubs.length === 0) return null

  const candidatePubs = props.pubs.filter(pub => {
    if (!pub.position) return false
    return !isPubClosed(pub)
  })

  if (candidatePubs.length === 0) return null

  let closestPub: Pub | null = null
  let minDistance = Infinity

  for (const pub of candidatePubs) {
    if (!pub.position) continue

    const distance = calculateDistance(lat, lng, pub.position.lat, pub.position.lng)
    
    if (distance < minDistance) {
      minDistance = distance
      closestPub = pub
    }
  }

  if (closestPub && minDistance <= 100) {
    console.log(`Nearby pub detected: ${closestPub.name} at ${Math.round(minDistance)}m`)
    return closestPub
  }
  
  return null
}

/**
 * Perform proximity check and auto-center if nearby pub found
 */
const performProximityCheck = () => {
  if (!props.userLocation || hasCheckedProximity.value) return
  
  hasCheckedProximity.value = true
  
  const nearbyPub = checkProximity(props.userLocation.lat, props.userLocation.lng)
  
  if (nearbyPub && nearbyPub.position) {
    map.value!.panTo({ lat: nearbyPub.position.lat, lng: nearbyPub.position.lng })
    map.value!.setZoom(15)
    console.log('Map auto-centered on nearby pub:', nearbyPub.name)
    
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
    map.value!.setCenter(props.userLocation)
    map.value!.setZoom(12)
    console.log('Map centered on user location (no nearby pubs):', props.userLocation)
  }
}

/**
 * Attempts to center the map on the user's current location
 */
const centerOnUserLocation = () => {
  if (!map.value) return
  
  if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        }
        emit('update:userLocation', location)
        console.log('User location obtained:', location)
        
        if (props.pubs.length > 0 && !hasCheckedProximity.value) {
          performProximityCheck()
        }
      },
      (error) => {
        console.warn('Geolocation failed:', error.message)
      },
      {
        enableHighAccuracy: false,
        timeout: 5000,
        maximumAge: 300000
      }
    )
  } else {
    console.warn('Geolocation not supported by browser')
  }
}

/**
 * Creates map markers for all filtered pubs with enhanced pin-style design
 */
const createMarkers = () => {
  if (!map.value) return

  markers.value.forEach(marker => marker.map = null)
  markers.value = []

  filteredPubsForMap.value.forEach((pub) => {
    if (!pub.position) {
      console.warn(`Pub ${pub.name} is missing position (should have been filtered)`)
      return
    }

    const isClosed = isPubClosed(pub)
    const visited = isVisited(pub.id)

    const markerElement = document.createElement('div')
    markerElement.className = 'enhanced-marker'
    markerElement.dataset.visited = String(visited)
    markerElement.dataset.closed = String(isClosed)
    
    let markerColor = ''
    
    if (visited) {
      markerColor = props.isDark ? '#16a34a' : '#22c55e'
    } else {
      markerColor = props.isDark ? '#2563eb' : '#3b82f6'
    }
    
    markerElement.innerHTML = `
      <svg class="marker-pin" viewBox="0 0 30 40" xmlns="http://www.w3.org/2000/svg" style="width: 36px; height: 48px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));">
        <path d="M15,0 C6.716,0 0,6.716 0,15 C0,23.284 15,40 15,40 S30,23.284 30,15 C30,6.716 23.284,0 15,0 Z" 
              fill="${markerColor}" 
              stroke="white" 
              stroke-width="2"/>
        
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
    
    const openState = pub.openState || 'Open'
    if (openState !== 'Open') {
      const badge = document.createElement('div')
      badge.className = 'state-badge'
      
      let badgeColor = '#6b7280'
      let badgeIcon = ''
      
      if (openState === 'Closed') {
        badgeColor = '#ef4444'
        badgeIcon = `
          <svg viewBox="0 0 12 12" style="width: 10px; height: 10px;">
            <line x1="3" y1="3" x2="9" y2="9" stroke="white" stroke-width="2" stroke-linecap="round"/>
            <line x1="9" y1="3" x2="3" y2="9" stroke="white" stroke-width="2" stroke-linecap="round"/>
          </svg>
        `
      } else if (openState === 'Temporary Closed') {
        badgeColor = '#f97316'
        badgeIcon = `
          <svg viewBox="0 0 12 12" style="width: 10px; height: 10px;">
            <path d="M6 3 L6 7 M6 9 L6 9.5" stroke="white" stroke-width="2" stroke-linecap="round"/>
          </svg>
        `
      } else if (openState.startsWith('Opening')) {
        badgeColor = '#f97316'
        badgeIcon = `
          <svg viewBox="0 0 12 12" style="width: 10px; height: 10px;">
            <path d="M6 3 L6 7 M6 9 L6 9.5" stroke="white" stroke-width="2" stroke-linecap="round"/>
          </svg>
        `
      } else if (openState.startsWith('Reopening')) {
        badgeColor = '#f97316'
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
  
  initializeClusters()
}

/**
 * Separates markers into visited and unvisited groups for clustering
 */
const separateMarkers = (): { 
  visited: google.maps.marker.AdvancedMarkerElement[], 
  unvisited: google.maps.marker.AdvancedMarkerElement[] 
} => {
  const visited: google.maps.marker.AdvancedMarkerElement[] = []
  const unvisited: google.maps.marker.AdvancedMarkerElement[] = []
  
  markers.value.forEach(marker => {
    const markerPos = marker.position as google.maps.LatLng | google.maps.LatLngLiteral
    const lat = typeof markerPos.lat === 'function' ? markerPos.lat() : markerPos.lat
    const lng = typeof markerPos.lng === 'function' ? markerPos.lng() : markerPos.lng
    
    const pub = filteredPubsForMap.value.find(p => p.position?.lat === lat && p.position?.lng === lng)
    
    if (pub) {
      if (isVisited(pub.id)) {
        visited.push(marker)
      } else {
        unvisited.push(marker)
      }
    } else {
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
  
  if (visitedClusterer.value) {
    visitedClusterer.value.clearMarkers()
  }
  if (unvisitedClusterer.value) {
    unvisitedClusterer.value.clearMarkers()
  }
  
  const { visited, unvisited } = separateMarkers()
  
  if (!visitedClusterer.value) {
    visitedClusterer.value = new MarkerClusterer({
      map: map.value,
      markers: visited,
      renderer: createClusterRenderer(props.isDark ? '#16a34a' : '#22c55e'),
      algorithmOptions: {
        maxZoom: 12
      }
    })
  } else {
    visitedClusterer.value.addMarkers(visited)
  }
  
  if (!unvisitedClusterer.value) {
    unvisitedClusterer.value = new MarkerClusterer({
      map: map.value,
      markers: unvisited,
      renderer: createClusterRenderer(props.isDark ? '#2563eb' : '#3b82f6'),
      algorithmOptions: {
        maxZoom: 12
      }
    })
  } else {
    unvisitedClusterer.value.addMarkers(unvisited)
  }
}

const showPubInfo = (pub: Pub, marker: google.maps.marker.AdvancedMarkerElement) => {
  if (!pubOverlay.value) return

  const position = marker.position as google.maps.LatLng
  pubOverlay.value.show(pub, position, props.isDark, props.readonly)
  selectedPub.value = pub
}

/**
 * Pan to a specific pub on the map
 */
const panToPub = (pub: Pub) => {
  if (!pub.position) {
    console.warn(`Cannot select pub ${pub.name} - missing position`)
    return
  }
  
  const marker = markers.value.find(m => {
    const pos = m.position as google.maps.LatLng | google.maps.LatLngLiteral
    const lat = typeof pos.lat === 'function' ? pos.lat() : pos.lat
    const lng = typeof pos.lng === 'function' ? pos.lng() : pos.lng
    return lat === pub.position!.lat && lng === pub.position!.lng
  })
  
  if (map.value) {
    map.value.panTo({ lat: pub.position.lat, lng: pub.position.lng })
    map.value.setZoom(15)
    
    if (marker) {
      showPubInfo(pub, marker)
    }
  }
}

/**
 * Pan to a location based on a place search result
 */
const panToPlace = (place: google.maps.places.PlaceResult) => {
  if (!map.value) {
    console.error('Map not initialized')
    return
  }

  if (!place.geometry?.location) {
    console.error('Place has no geometry')
    return
  }

  const location = place.geometry.location
  
  let zoom = 15
  if (place.types) {
    if (place.types.includes('locality') || place.types.includes('administrative_area_level_2')) {
      zoom = 14
    } else if (place.types.includes('street_address') || place.types.includes('premise')) {
      zoom = 16
    }
  }

  map.value.panTo(location)
  map.value.setZoom(zoom)
  
  console.log(`Map centered on: ${place.name} (zoom: ${zoom})`)
}

// Watch for user location changes to trigger proximity check
watch(() => props.userLocation, (newLocation) => {
  if (newLocation && props.pubs.length > 0 && !hasCheckedProximity.value) {
    performProximityCheck()
  }
})

// Watch for pubs to load and trigger proximity check
watch(() => props.pubs.length, (newLength) => {
  if (newLength > 0) {
    createMarkers()
    if (props.userLocation && !hasCheckedProximity.value) {
      performProximityCheck()
    }
  }
})

// Expose methods to parent
defineExpose({
  panToPub,
  panToPlace
})

onMounted(async () => {
  setOptions({ key: import.meta.env.VITE_GOOGLE_MAPS_API_KEY, v: 'weekly' })
  await importLibrary('maps')
  await importLibrary('marker')
  await importLibrary('places')

  initMap()
  createMarkers()
})

onBeforeUnmount(() => {
  if (visitedClusterer.value) {
    visitedClusterer.value.clearMarkers()
    visitedClusterer.value = null
  }
  if (unvisitedClusterer.value) {
    unvisitedClusterer.value.clearMarkers()
    unvisitedClusterer.value = null
  }
  
  markers.value.forEach(marker => marker.map = null)
  markers.value = []
})
</script>
