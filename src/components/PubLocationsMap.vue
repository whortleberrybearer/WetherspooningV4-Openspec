<template>
  <div class="pub-locations-map">
    <div v-if="error" class="error-message">
      {{ error }}
    </div>
    <div ref="mapContainer" class="map-container"></div>
  </div>
</template>

<script>
export default {
  name: 'PubLocationsMap',
  data() {
    return {
      map: null,
      markers: [],
      pubs: [],
      infoWindow: null,
      error: null
    }
  },
  mounted() {
    this.loadGoogleMapsAPI()
  },
  methods: {
    loadGoogleMapsAPI() {
      // Check if Google Maps is already loaded
      if (window.google && window.google.maps) {
        this.initMap()
        return
      }

      // Get API key from environment variable
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

      if (!apiKey) {
        this.error = 'Google Maps API key is not configured. Please add VITE_GOOGLE_MAPS_API_KEY to your .env file.'
        console.error('Missing Google Maps API key')
        return
      }

      // Create script element to load Google Maps
      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`
      script.async = true
      script.defer = true
      
      script.onload = () => {
        this.initMap()
      }
      
      script.onerror = () => {
        this.error = 'Failed to load Google Maps API. Please check your API key and network connection.'
        console.error('Failed to load Google Maps API')
      }

      document.head.appendChild(script)
    },

    initMap() {
      // Initialize map centered on UK
      this.map = new google.maps.Map(this.$refs.mapContainer, {
        center: { lat: 54.0, lng: -2.0 },
        zoom: 6,
        mapTypeId: 'roadmap',
        mapTypeControl: true,
        streetViewControl: false,
        fullscreenControl: true
      })

      // Initialize info window
      this.infoWindow = new google.maps.InfoWindow()

      // Load pub data
      this.loadPubs()
    },

    async loadPubs() {
      try {
        const response = await fetch('/data/pubs-sample.json')
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        this.pubs = await response.json()
        this.createMarkers()
      } catch (error) {
        this.error = 'Failed to load pub data. Please ensure pubs-sample.json exists in the data folder.'
        console.error('Error loading pub data:', error)
      }
    },

    createMarkers() {
      // Clear existing markers
      this.markers.forEach(marker => marker.setMap(null))
      this.markers = []

      // Create marker for each pub
      this.pubs.forEach(pub => {
        // Skip pubs without valid coordinates
        if (!pub.lat || !pub.lng || 
            typeof pub.lat !== 'number' || typeof pub.lng !== 'number' ||
            pub.lat < -90 || pub.lat > 90 ||
            pub.lng < -180 || pub.lng > 180) {
          console.warn(`Skipping pub "${pub.name}" - invalid coordinates:`, pub.lat, pub.lng)
          return
        }

        const marker = new google.maps.Marker({
          position: { lat: pub.lat, lng: pub.lng },
          map: this.map,
          title: pub.name
        })

        // Add click listener to show pub info
        marker.addListener('click', () => {
          this.showPubInfo(pub, marker)
        })

        this.markers.push(marker)
      })
    },

    showPubInfo(pub, marker) {
      // Build info window content
      let content = `<div class="pub-info" style="padding: 10px; max-width: 250px;">
        <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600;">${pub.name}</h3>`
      
      if (pub.address) {
        content += `<p style="margin: 4px 0; font-size: 14px;">${pub.address}</p>`
      }
      
      if (pub.townCity || pub.county) {
        const location = [pub.townCity, pub.county].filter(Boolean).join(', ')
        content += `<p style="margin: 4px 0; font-size: 14px;">${location}</p>`
      }
      
      if (pub.url) {
        content += `<a href="${pub.url}" target="_blank" rel="noopener noreferrer" 
                      style="display: inline-block; margin-top: 8px; color: #0066cc; text-decoration: none; font-size: 14px;">
                      View Details →
                    </a>`
      }
      
      content += `</div>`

      // Set content and open info window
      this.infoWindow.setContent(content)
      this.infoWindow.open(this.map, marker)
    }
  }
}
</script>

<style scoped>
.pub-locations-map {
  width: 100%;
  height: 100%;
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
  background: #fee;
  color: #c00;
  padding: 12px 20px;
  border-radius: 4px;
  border: 1px solid #fcc;
  z-index: 1000;
  max-width: 90%;
  text-align: center;
  font-size: 14px;
}

/* Mobile optimizations */
@media (max-width: 768px) {
  .pub-locations-map {
    height: 100vh;
  }
}
</style>
