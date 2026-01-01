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

const initAutocompleteWidget = () => {
  if (!autocompleteContainer.value) {
    console.error('Autocomplete container not found')
    return
  }

  try {
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
  max-width: 28rem;
}

.autocomplete-wrapper {
  width: 100%;
}

/* Theme customization for the widget */
:deep(.dark-mode) {
  --gm-fillcolor: hsl(var(--input));
  --gm-fontfamily: inherit;
}
</style>
