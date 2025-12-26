# Technical Design: Add Pub Locations Map

**Change ID:** `add-pub-locations-map`

## Architecture Overview

This feature adds a new map view to the Vue.js frontend that integrates Google Maps API to display Wetherspoons pub locations. The map will serve as the home page of the application.

```
┌─────────────────────────────────────┐
│   PubLocationsMap.vue Component     │
│  ┌────────────────────────────────┐ │
│  │   Google Maps Container        │ │
│  │  ┌──────────────────────────┐  │ │
│  │  │  Map Instance            │  │ │
│  │  │  - Markers (Pubs)        │  │ │
│  │  │  - Info Windows          │  │ │
│  │  └──────────────────────────┘  │ │
│  └────────────────────────────────┘ │
│  ┌────────────────────────────────┐ │
│  │   Data Loader                  │ │
│  │   (pubs-sample.json)          │ │
│  └────────────────────────────────┘ │
└─────────────────────────────────────┘
```

## Data Flow

1. Component mounts → Load Google Maps API script
2. API ready → Initialize map with UK center coordinates
3. Fetch `data/pubs-sample.json`
4. Parse JSON → Create marker for each pub
5. User clicks marker → Display info window with pub details

## Component Structure

### PubLocationsMap.vue

**Template:**
```vue
<template>
  <div class="pub-locations-map">
    <div ref="mapContainer" class="map-container"></div>
  </div>
</template>
```

**Script:**
- Data properties: `map`, `markers`, `pubs`, `infoWindow`
- Methods:
  - `initMap()`: Initialize Google Maps instance
  - `loadPubs()`: Fetch pub data from JSON
  - `createMarkers()`: Create map markers from pub data
  - `showPubInfo(pub)`: Display info window for selected pub

**Styling:**
- Map container: 100% width, responsive height
- Mobile-first: Full viewport on mobile, contained on desktop

## Google Maps Configuration

**Initial Map Settings:**
```javascript
{
  center: { lat: 54.0, lng: -2.0 }, // Center of UK
  zoom: 6,
  mapTypeId: 'roadmap',
  mapTypeControl: true,
  streetViewControl: false,
  fullscreenControl: true
}
```

**Marker Configuration:**
```javascript
{
  position: { lat: pub.lat, lng: pub.lng },
  map: mapInstance,
  title: pub.name,
  icon: {
    url: '/icons/pub-marker.png', // Custom pub icon (optional)
    scaledSize: { width: 32, height: 32 }
  }
}
```

**Info Window Content:**
```html
<div class="pub-info">
  <h3>{pub.name}</h3>
  <p>{pub.address}</p>
  <p>{pub.townCity}, {pub.county}</p>
  <a href="{pub.url}" target="_blank">View Details</a>
</div>
```

## Data Schema

### pubs-sample.json Structure

```json
[
  {
    "id": 1,
    "name": "The Moon Under Water",
    "townCity": "Manchester",
    "address": "68-74 Deansgate",
    "county": "Greater Manchester",
    "region": "North West England",
    "country": "England",
    "lat": 53.4823,
    "lng": -2.2459,
    "url": "https://www.jdwetherspoon.com/pubs/all-pubs/england/greater-manchester/the-moon-under-water-manchester",
    "imageUrl": "https://example.com/image.jpg",
    "openState": "Open"
  }
]
```

**Required Fields:**
- `id`: Unique identifier
- `name`: Pub name
- `lat`: Latitude coordinate
- `lng`: Longitude coordinate

**Optional Fields:**
- `townCity`, `address`, `county`, `region`, `country`: Location details
- `url`: Link to pub details page
- `imageUrl`: Pub image
- `openState`: Operating status

## API Integration

### Google Maps API

**Loading Strategy:**
```javascript
// Dynamically load Google Maps script
const script = document.createElement('script');
script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}`;
script.async = true;
script.defer = true;
document.head.appendChild(script);
```

**Environment Variable:**
- `VITE_GOOGLE_MAPS_API_KEY`: Store API key in `.env` file

### Data Loading

**Fetch Implementation:**
```javascript
async loadPubs() {
  try {
    const response = await fetch('/data/pubs-sample.json');
    this.pubs = await response.json();
    this.createMarkers();
  } catch (error) {
    console.error('Failed to load pub data:', error);
  }
}
```

## Performance Considerations

1. **Marker Clustering:** If >100 pubs, implement marker clustering library
2. **Lazy Loading:** Load map API only when map route is accessed
3. **Data Caching:** Cache JSON data in browser storage after first load
4. **Responsive Images:** Use appropriate image sizes in info windows

## Mobile Optimization

- Touch-friendly marker sizes (min 44x44px)
- Simplified controls on small screens
- Full-screen map view on mobile
- Optimized info window layout for narrow screens

## Error Handling

1. **API Load Failure:** Display error message, fallback to list view
2. **Missing Data:** Skip pubs without lat/lng coordinates
3. **Invalid Coordinates:** Log warning, skip invalid markers
4. **Network Errors:** Retry mechanism with exponential backoff

## Testing Strategy

**Unit Tests:**
- Data loading and parsing
- Marker creation logic
- Info window content generation

**Integration Tests:**
- Map initialization
- Marker click interactions
- Responsive behavior

**Manual Tests:**
- Different screen sizes
- Various zoom levels
- Network throttling
- Different browsers

## Future Enhancements

1. Search/filter pubs on map
2. User location detection
3. Directions to selected pub
4. Clustering for better performance
5. Custom map styling/themes
6. Save favorite pub locations
