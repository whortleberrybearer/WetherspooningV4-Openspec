# Design: User Geolocation Centering

## Overview
Enhance the map initialization to center on the user's current geographic location when available, providing a more personalized and relevant initial view. Fall back to the existing UK-centered default view if geolocation is unavailable.

## Architecture

### Component: PubLocationsMap.vue

**Current Behavior:**
```typescript
const initMap = () => {
  const mapOptions: google.maps.MapOptions = {
    center: { lat: 54.0, lng: -2.0 },  // Fixed UK center
    zoom: 6,
    // ... other options
  }
  map.value = new google.maps.Map(mapContainer.value, mapOptions)
}
```

**Proposed Behavior:**
1. Initialize map with default center (54.0, -2.0)
2. Asynchronously request user's current position via Geolocation API
3. If successful, re-center map to user's location with appropriate zoom
4. If failed, keep default center (graceful degradation)

### Geolocation Flow

```
┌─────────────────────┐
│   User visits page  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  initMap() called   │
│  - Create map with  │
│    default center   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Request geolocation │
│  (async, no await)  │
└──────────┬──────────┘
           │
           ├─────────────────────┐
           │                     │
           ▼                     ▼
    ┌────────────┐      ┌──────────────┐
    │  Success   │      │    Failure   │
    │  (grant)   │      │(deny/error)  │
    └─────┬──────┘      └──────┬───────┘
          │                    │
          ▼                    ▼
   ┌─────────────┐      ┌─────────────┐
   │ Recenter to │      │  Stay at    │
   │ user coords │      │   default   │
   │ zoom = 12   │      │   center    │
   └─────────────┘      └─────────────┘
```

## Technical Decisions

### 1. Zoom Level for User Location
**Decision:** Use zoom level 12 for user-centered view  
**Rationale:** Zoom 12 provides neighborhood-level detail, showing pubs within a few miles. Not too close (would only show 1-2 pubs) and not too far (defeats purpose of geolocation).

### 2. No Loading Indicator
**Decision:** Don't show loading spinner for geolocation  
**Rationale:** Map is already visible with default center. Geolocation request happens silently in background. If it succeeds, map smoothly pans to user location. Avoids UI clutter.

### 3. No Permission Prompt Explanation
**Decision:** Don't pre-explain geolocation permission prompt  
**Rationale:** Modern browsers provide clear permission UI. Pre-explaining adds friction. Users familiar with location requests from other apps.

### 4. Error Handling Strategy
**Decision:** Silent failure with console logging  
**Rationale:** 
- Geolocation denial is normal user choice, not an error condition
- Default center is perfectly valid fallback
- Console logs help debugging without alerting users
- No error banner needed for optional feature

### 5. Timing of Geolocation Request
**Decision:** Request immediately after map initialization  
**Rationale:** Don't wait for pubs to load. Map can recenter while pub data is being fetched. Parallel operations improve perceived performance.

## Implementation Approach

### Step 1: Add Geolocation Helper Function
```typescript
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
        enableHighAccuracy: false,  // Faster response
        timeout: 5000,              // Don't wait forever
        maximumAge: 300000          // Accept cached position up to 5 min old
      }
    )
  } else {
    console.warn('Geolocation not supported by browser')
  }
}
```

### Step 2: Call After Map Initialization
```typescript
const initMap = () => {
  // ... existing map creation code ...
  map.value = new google.maps.Map(mapContainer.value, mapOptions)
  infoWindow.value = new google.maps.InfoWindow()
  
  // NEW: Request user location
  centerOnUserLocation()
}
```

## Error Cases

| Scenario | Behavior |
|----------|----------|
| User denies permission | Map stays at default center (54.0, -2.0), zoom 6 |
| Browser doesn't support geolocation | Map stays at default center |
| Geolocation timeout (>5s) | Map stays at default center |
| User outside UK | Map centers on user's location anywhere in world |
| Network error during geolocation | Map stays at default center |

## Performance Considerations

- Geolocation API call is asynchronous and non-blocking
- Map renders immediately with default view
- No impact on initial page load time
- Smooth pan animation when location acquired
- Timeout prevents hanging requests

## Security & Privacy

- Uses browser's standard Geolocation API (HTTPS required)
- Respects user's permission choices
- No location data stored or transmitted to server
- Console logs don't contain PII (only coordinates)
- Complies with browser privacy standards

## Testing Plan

1. **Happy Path:** Grant permission → map centers on current location
2. **Deny Permission:** Decline prompt → map stays at default center
3. **No Geolocation Support:** Old browser → map stays at default center
4. **Timeout:** Slow GPS → map stays at default center after 5s
5. **Outside UK:** User in different country → map centers there
6. **Repeated Visits:** Permission remembered → map centers without re-prompting

## Future Enhancements (Out of Scope)

- Save user's preferred center in localStorage
- "Recenter on my location" button
- Blue dot showing user's current position on map
- Geolocation permission status indicator
- Suggest nearby pubs based on current location
