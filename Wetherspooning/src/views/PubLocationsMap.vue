<template>
  <div class="pub-locations-map">
    <div v-if="error" class="error-message">
      {{ error }}
    </div>
    <div ref="mapContainer" class="map-container"></div>
  </div>
</template>

<script setup lang="ts">
/// <reference types="@types/google.maps" />
import { ref, onMounted, shallowRef } from 'vue'
import { setOptions, importLibrary } from '@googlemaps/js-api-loader'

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
    mapId: 'Main',
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
    <div class="pub-info">
      <h3>${pub.name}</h3>
      <p>${pub.address}</p>
      <p>${pub.townCity}, ${pub.county}</p>
      ${pub.url ? `<a href="${pub.url}" target="_blank" rel="noopener">View Details</a>` : ''}
    </div>
  `

  infoWindow.value.setContent(content)
  infoWindow.value.open(map.value!, marker)
}

onMounted(async () => {
  try {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''
    if (!apiKey) {
      throw new Error('Google Maps API key not configured')
    }

    setOptions({ key: apiKey, v: 'weekly' })
    await importLibrary('maps')
    await importLibrary('marker')
    
    initMap()
    await loadPubs()
  } catch (err) {
    error.value = 'Failed to initialize map. Please check your configuration.'
    console.error('Map initialization error:', err)
  }
})
</script>

<style scoped>
.pub-locations-map {
  width: 100%;
  height: 100vh;
  position: relative;
}

.map-container {
  width: 100%;
  height: 100%;
}

.error-message {
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  background-color: #f44336;
  color: white;
  padding: 12px 24px;
  border-radius: 4px;
  z-index: 1000;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .pub-locations-map {
    height: 100vh;
  }
}

@media (min-width: 769px) {
  .pub-locations-map {
    height: calc(100vh - 60px); /* Account for potential header */
  }
}

/* Info window styling (global) */
:global(.pub-info h3) {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
}

:global(.pub-info p) {
  margin: 4px 0;
  font-size: 14px;
  color: #666;
}

:global(.pub-info a) {
  display: inline-block;
  margin-top: 8px;
  color: #1976d2;
  text-decoration: none;
  font-weight: 500;
}

:global(.pub-info a:hover) {
  text-decoration: underline;
}
</style>
