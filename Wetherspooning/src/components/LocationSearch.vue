<template>
  <div class="location-search-container">
    <div
      ref="autocompleteContainer"
      class="autocomplete-wrapper"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'

interface LocationSearchProps {
  isDark?: boolean
}

interface LocationSearchEmits {
  (e: 'placeChanged', place: google.maps.places.PlaceResult): void
}

const props = defineProps<LocationSearchProps>()
const emit = defineEmits<LocationSearchEmits>()

const autocompleteContainer = ref<HTMLDivElement | null>(null)
let autocompleteWidget: google.maps.places.PlaceAutocompleteElement | null = null

const waitForGoogleMaps = async () => {
  // Wait for google.maps.places to be available
  return new Promise<void>((resolve) => {
    const checkInterval = setInterval(() => {
      if (window.google && window.google.maps && window.google.maps.places) {
        clearInterval(checkInterval)
        resolve()
      }
    }, 100)
  })
}

const initAutocompleteWidget = async () => {
  if (!autocompleteContainer.value) {
    console.error('Autocomplete container not found')
    return
  }

  try {
    // Wait for Google Maps Places library to be loaded
    await waitForGoogleMaps()

    // Create the PlaceAutocompleteElement
    autocompleteWidget = new google.maps.places.PlaceAutocompleteElement({
      componentRestrictions: { country: 'uk' },
    })

    // Set placeholder
    autocompleteWidget.setAttribute('placeholder', 'Search for a location')

    // Add event listener for place selection
    autocompleteWidget.addEventListener('gmp-placeselect', async (event: any) => {
      const place = event.place
      
      if (!place) {
        console.warn('No place selected')
        return
      }

      try {
        // Fetch place details including geometry
        await place.fetchFields({
          fields: ['geometry', 'name', 'types'],
        })

        emit('placeChanged', place.toJSON())
      } catch (error) {
        console.error('Error fetching place details:', error)
      }
    })

    // Append widget to container
    autocompleteContainer.value.appendChild(autocompleteWidget)

    // Apply theme styling
    applyThemeStyling()
  } catch (error) {
    console.error('Error initializing autocomplete widget:', error)
  }
}

const applyThemeStyling = () => {
  if (!autocompleteWidget) return

  // Apply custom CSS classes based on theme
  if (props.isDark) {
    autocompleteWidget.classList.add('dark-mode')
  } else {
    autocompleteWidget.classList.remove('dark-mode')
  }
}

watch(() => props.isDark, () => {
  applyThemeStyling()
})

onMounted(() => {
  initAutocompleteWidget()
})

onBeforeUnmount(() => {
  // Clean up widget
  if (autocompleteWidget && autocompleteContainer.value) {
    autocompleteContainer.value.removeChild(autocompleteWidget)
    autocompleteWidget = null
  }
})
</script>

<style scoped>
.location-search-container {
  width: 100%;
  max-width: 20rem;
}

.autocomplete-wrapper {
  width: 100%;
}

/* Ensure widget is visible and styled */
.autocomplete-wrapper :deep(input) {
  height: 2.25rem;
  border-radius: 0.375rem;
  border: 1px solid hsl(var(--border));
  background: hsl(var(--background));
  color: hsl(var(--foreground));
  padding: 0 0.75rem;
  font-size: 0.875rem;
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
}

.autocomplete-wrapper :deep(input:focus) {
  outline: none;
  border-color: hsl(var(--ring));
  box-shadow: 0 0 0 3px hsl(var(--ring) / 0.5);
}

/* Theme customization for the widget */
:deep(.dark-mode) {
  --gm-fillcolor: hsl(var(--input));
  --gm-fontfamily: inherit;
}

/* Ensure dropdown is visible */
.autocomplete-wrapper :deep(.pac-container) {
  z-index: 9999;
}
</style>
