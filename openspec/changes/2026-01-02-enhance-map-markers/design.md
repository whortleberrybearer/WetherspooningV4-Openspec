# Design: Enhance Map Markers

## Overview

This document details the visual and technical design for enhanced map markers that communicate pub states through size, shape, and icons rather than relying primarily on color.

## Visual Design

### Marker Anatomy

```
┌─────────────┐
│  [badge]    │ ← Location type badge (optional, 10px)
│   ┌─────┐   │
│   │  ✓  │   │ ← State icon (visited/closed, 16px)
│   │     │   │ ← Pin body (30px width, 36px height)
│   └──┬──┘   │
│      ▼      │ ← Pin tip
└─────────────┘
```

### Size Specifications
- **Overall Height:** 40px (including tip)
- **Pin Body:** 30px width × 30px height
- **Pin Tip:** 10px height (triangular point)
- **State Icon:** 16px × 16px (centered in pin body)
- **Location Badge:** 10px × 10px (top-right corner)

### Shape Design
Traditional map pin/teardrop consisting of:
1. **Pin Head:** Rounded rectangle or circle (30px diameter)
2. **Pin Tip:** Inverted triangle pointing to exact location coordinates
3. **Border:** 2px white border for definition against map backgrounds

### State Visual Indicators

#### Primary State: Visited vs Unvisited
- **Visited:** Checkmark (✓) icon centered in pin body
- **Unvisited:** Empty pin body or alternative icon (e.g., dot)

#### Primary State: Open vs Closed
- **Closed:** X icon OR diagonal strike-through over the pin
- **Open:** No additional overlay

#### Secondary State: Location Types (Optional)
Small badge icons overlaid on top-right corner:
- **Hotel:** 🏨 or custom hotel icon
- **Airport:** ✈️ or custom plane icon
- **Train Station:** 🚂 or custom train icon

### Color Palette

While icons are the primary indicators, colors provide supplementary context:

**Light Theme:**
- Visited + Open: `#22c55e` (green-500)
- Visited + Closed: `#3b82f6` (blue-500)
- Unvisited + Open: `#ef4444` (red-500)
- Unvisited + Closed: `#6b7280` (gray-500)

**Dark Theme:**
- Visited + Open: `#16a34a` (green-600)
- Visited + Closed: `#2563eb` (blue-600)
- Unvisited + Open: `#dc2626` (red-600)
- Unvisited + Closed: `#4b5563` (gray-600)

**Opacity:**
- Closed markers: 70% opacity (reduced from current 60% for better visibility)
- Open markers: 100% opacity

## Technical Design

### Implementation Approach

Use **HTML + SVG** hybrid approach:
- Outer container: HTML `<div>` for positioning and theming
- Pin shape: SVG path for crisp scaling
- Icons: SVG symbols embedded inline for theme support
- Badges: Positioned absolutely within container

### Marker Structure (Pseudocode)

```html
<div class="enhanced-marker" data-visited="true" data-closed="false" data-location-type="hotel">
  <svg class="marker-pin" viewBox="0 0 30 40">
    <!-- Pin body (rounded rect + triangle tip) -->
    <path d="M15,0 C..." fill="currentColor" stroke="white" stroke-width="2"/>
    
    <!-- State icon (checkmark/X) -->
    <g class="state-icon">
      <!-- SVG icon path -->
    </g>
  </svg>
  
  <!-- Location type badge (if applicable) -->
  <div class="location-badge" v-if="hasLocationType">
    <svg><!-- badge icon --></svg>
  </div>
</div>
```

### CSS Structure

```css
.enhanced-marker {
  width: 30px;
  height: 40px;
  position: relative;
  cursor: pointer;
  transform-origin: bottom center;
  transition: transform 0.2s ease;
}

.enhanced-marker:hover {
  transform: scale(1.1);
  z-index: 1000;
}

.marker-pin {
  width: 100%;
  height: 100%;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

/* State-based colors */
.enhanced-marker[data-visited="true"][data-closed="false"] {
  color: var(--marker-visited-open); /* green */
}

.enhanced-marker[data-visited="true"][data-closed="true"] {
  color: var(--marker-visited-closed); /* blue */
  opacity: 0.7;
}

.enhanced-marker[data-visited="false"][data-closed="false"] {
  color: var(--marker-unvisited-open); /* red */
}

.enhanced-marker[data-visited="false"][data-closed="true"] {
  color: var(--marker-unvisited-closed); /* gray */
  opacity: 0.7;
}

.location-badge {
  position: absolute;
  top: -2px;
  right: -2px;
  width: 12px;
  height: 12px;
  background: white;
  border-radius: 50%;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 8px;
}
```

### Integration with Google Maps Advanced Markers

```typescript
const createEnhancedMarker = (pub: Pub, isVisited: boolean): google.maps.marker.AdvancedMarkerElement => {
  const isClosed = pub.openState?.toLowerCase().includes('closed') || false
  
  // Create marker container
  const markerElement = document.createElement('div')
  markerElement.className = 'enhanced-marker'
  markerElement.dataset.visited = String(isVisited)
  markerElement.dataset.closed = String(isClosed)
  
  if (pub.isHotel || pub.inAirport || pub.inTrainStation) {
    const locationType = pub.isHotel ? 'hotel' : pub.inAirport ? 'airport' : 'train'
    markerElement.dataset.locationType = locationType
  }
  
  // Build SVG pin with icon
  markerElement.innerHTML = `
    <svg class="marker-pin" viewBox="0 0 30 40" xmlns="http://www.w3.org/2000/svg">
      <!-- Pin shape -->
      <path d="M15,0 C6.7,0 0,6.7 0,15 C0,23.3 15,40 15,40 S30,23.3 30,15 C30,6.7 23.3,0 15,0 Z" 
            fill="currentColor" 
            stroke="white" 
            stroke-width="2"/>
      
      <!-- State icon (visited checkmark or empty) -->
      ${isVisited ? `
        <path d="M10,16 L13,19 L20,12" 
              fill="none" 
              stroke="white" 
              stroke-width="2.5" 
              stroke-linecap="round"/>
      ` : ''}
      
      <!-- Closed indicator (X overlay) -->
      ${isClosed ? `
        <line x1="10" y1="10" x2="20" y2="20" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
        <line x1="20" y1="10" x2="10" y2="20" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
      ` : ''}
    </svg>
    
    ${markerElement.dataset.locationType ? `
      <div class="location-badge">
        ${getLocationBadgeIcon(markerElement.dataset.locationType)}
      </div>
    ` : ''}
  `
  
  return new google.maps.marker.AdvancedMarkerElement({
    position: { lat: pub.lat, lng: pub.lng },
    content: markerElement,
    title: pub.name,
  })
}
```

### Clustering Compatibility

The enhanced markers are larger, so cluster rendering may need adjustment:

```typescript
const createClusterRenderer = (backgroundColor: string) => {
  return {
    render: ({ count, position }) => {
      // Increase cluster marker size proportionally to individual markers
      const svg = `
        <svg fill="${backgroundColor}" xmlns="http://www.w3.org/2000/svg" 
             viewBox="0 0 240 240" width="60" height="60">
          <circle cx="120" cy="120" opacity="0.6" r="70" />
          <circle cx="120" cy="120" opacity="1" r="60" 
                  stroke="white" stroke-width="5" fill="${backgroundColor}" />
          <text x="50%" y="50%" text-anchor="middle" dy="0.3em" 
                fill="white" font-size="50" font-family="Arial, sans-serif" font-weight="bold">
            ${count}
          </text>
        </svg>
      `
      // ... rest of cluster rendering logic
    }
  }
}
```

## Accessibility Considerations

### Color Independence
- **Icons ensure visibility:** Checkmark for visited, X for closed
- **No reliance on color alone:** Users with color blindness can distinguish states
- **High contrast:** White icons on colored backgrounds meet WCAG AA (4.5:1)

### Interactive Targets
- **Minimum size:** 40px height exceeds WCAG 2.5.5 (44px recommended, 40px acceptable)
- **Hover scaling:** Visual feedback when hovering over marker
- **Clear clickability:** Pin shape indicates interactivity

### Screen Reader Support
- **Title attribute:** Maintains existing hover text for screen readers
- **Semantic HTML:** Accessible structure for assistive technologies

## Theme Support

Both light and dark themes are supported via CSS custom properties:

```css
:root {
  --marker-visited-open: #22c55e;
  --marker-visited-closed: #3b82f6;
  --marker-unvisited-open: #ef4444;
  --marker-unvisited-closed: #6b7280;
}

.dark {
  --marker-visited-open: #16a34a;
  --marker-visited-closed: #2563eb;
  --marker-unvisited-open: #dc2626;
  --marker-unvisited-closed: #4b5563;
}
```

## Performance Considerations

### SVG vs DOM Elements
- **SVG inline:** Eliminates HTTP requests for marker images
- **Single DOM node per marker:** Minimal overhead
- **CSS transforms for hover:** GPU-accelerated

### Clustering Threshold
With larger markers, clustering becomes more important at higher zoom levels to prevent overlap. Consider adjusting cluster distance threshold.

### Rendering Strategy
- **Incremental rendering:** Render visible markers first
- **Lazy rendering:** Only create markers for pubs in viewport (future optimization)

## Migration Strategy

1. **Feature flag:** Implement behind optional flag for A/B testing
2. **Fallback:** Keep old marker code temporarily
3. **Gradual rollout:** Enable for subset of users first
4. **Monitoring:** Track click rates, hover events, user feedback

## Open Technical Questions

1. **SVG Path Generation:** Use existing library (e.g., d3-shape) or hand-craft paths?
   - **Recommendation:** Hand-craft for simplicity and minimal bundle size
   
2. **Icon Source:** Lucide icons (from shadcn/vue) or custom SVG paths?
   - **Recommendation:** Custom SVG paths for checkmark/X to avoid dependency
   
3. **Theming Integration:** CSS custom properties vs inline styles?
   - **Recommendation:** CSS custom properties for theme support
