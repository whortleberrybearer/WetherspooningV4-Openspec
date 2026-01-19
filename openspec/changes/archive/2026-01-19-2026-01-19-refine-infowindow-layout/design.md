# Design: Refine InfoWindow Layout

**Change ID:** 2026-01-19-refine-infowindow-layout  
**Status:** Draft  
**Created:** 2026-01-19

## Architecture Overview

This change replaces the standard Google Maps `InfoWindow` with a custom `OverlayView` implementation to gain complete control over styling, positioning, and responsive behavior.

### Current Architecture

```
PubLocationsMap.vue
├── infoWindow: google.maps.InfoWindow
└── showPubInfo(pub, marker)
    ├── Generates HTML content string
    ├── Sets content on InfoWindow
    ├── Opens InfoWindow on map
    └── Attaches event listeners via setTimeout
```

### Proposed Architecture

```
PubLocationsMap.vue
├── customOverlay: CustomPubOverlay (extends OverlayView)
└── showPubInfo(pub, marker)
    ├── Generates overlay content data
    ├── Updates overlay with pub data
    ├── Shows overlay at marker position
    └── Event listeners managed by overlay component

CustomPubOverlay (new)
├── extends google.maps.OverlayView
├── DOM element management
├── Positioning logic
├── Responsive width constraints
└── Event handling (close, button clicks)
```

## Component Design: CustomPubOverlay

### Class Structure

```typescript
class CustomPubOverlay extends google.maps.OverlayView {
  private position: google.maps.LatLng
  private container: HTMLDivElement | null
  private pub: Pub | null
  private onClose: () => void
  private onTrackVisit: (pub: Pub) => void
  private onSignIn: () => void
  
  constructor(options: {
    onClose: () => void
    onTrackVisit: (pub: Pub) => void
    onSignIn: () => void
  })
  
  // OverlayView lifecycle methods
  onAdd(): void
  draw(): void
  onRemove(): void
  
  // Public API
  show(pub: Pub, position: google.maps.LatLng): void
  hide(): void
  update(pub: Pub): void
}
```

### Lifecycle Methods

**onAdd()**: Called when overlay is added to the map
- Creates container div element
- Sets up base styles (position: absolute, z-index)
- Appends to map's overlay layer
- Does NOT render content yet (wait for draw())

**draw()**: Called whenever map view changes (pan, zoom)
- Uses `getProjection().fromLatLngToDivPixel()` to calculate screen position
- Positions container at calculated coordinates
- Adjusts position if overlay would extend beyond viewport bounds
- Renders pub content (only if pub data exists)

**onRemove()**: Called when overlay is removed from map
- Removes container from DOM
- Cleans up event listeners
- Clears pub data

### Positioning Logic

The overlay positioning must handle several cases:

1. **Standard positioning**: Center overlay arrow/pointer above marker
2. **Viewport boundary detection**: Adjust position if overlay extends beyond screen edges
3. **Mobile considerations**: Ensure overlay never exceeds viewport width

```typescript
// In draw() method
const projection = this.getProjection()
if (!projection || !this.position) return

const point = projection.fromLatLngToDivPixel(this.position)
if (!point || !this.container) return

// Calculate overlay dimensions
const overlayWidth = this.container.offsetWidth
const overlayHeight = this.container.offsetHeight

// Position overlay centered above marker (with offset for pointer)
let left = point.x - (overlayWidth / 2)
let top = point.y - overlayHeight - 20 // 20px offset for pointer/gap

// Viewport boundary checks
const mapDiv = this.getMap()?.getDiv()
if (mapDiv) {
  const mapWidth = mapDiv.offsetWidth
  const margin = 10 // 10px margin from edges
  
  // Prevent overflow on left
  if (left < margin) left = margin
  
  // Prevent overflow on right
  if (left + overlayWidth > mapWidth - margin) {
    left = mapWidth - overlayWidth - margin
  }
  
  // Prevent overflow on top
  if (top < margin) top = margin
}

this.container.style.left = `${left}px`
this.container.style.top = `${top}px`
```

### Responsive Width Strategy

The overlay will have responsive width constraints:

```css
.custom-overlay-container {
  position: absolute;
  z-index: 1000;
  
  /* Desktop: fixed width */
  width: 400px;
  max-width: calc(100vw - 20px); /* Never exceed viewport */
  
  /* Mobile breakpoint */
  @media (max-width: 450px) {
    width: 320px;
    max-width: calc(100vw - 20px);
  }
  
  /* Very small screens */
  @media (max-width: 350px) {
    width: 280px;
    max-width: calc(100vw - 20px);
  }
}
```

### Content Rendering

The overlay will reuse the existing content structure from `showPubInfo()` but render it as a Vue-style component template instead of HTML string:

```typescript
// In draw() method, after positioning
if (this.pub && this.container) {
  this.container.innerHTML = this.generateContent(this.pub)
  this.attachEventListeners()
}

private generateContent(pub: Pub): string {
  // Similar to existing showPubInfo logic
  // Generate HTML with card styling
  // Include close button in top-right corner
}

private attachEventListeners(): void {
  const closeBtn = this.container?.querySelector('.close-btn')
  const trackBtn = this.container?.querySelector('.track-visit-btn')
  
  closeBtn?.addEventListener('click', () => this.onClose())
  trackBtn?.addEventListener('click', () => {
    if (this.pub) {
      // Determine if sign-in or track visit
      if (isAuthenticated) {
        this.onTrackVisit(this.pub)
      } else {
        this.onSignIn()
      }
    }
  })
}
```

## Styling Changes

### Close Button Redesign

The close button will be positioned absolutely in the top-right corner of the card:

```html
<button class="close-btn" aria-label="Close">
  <svg><!-- X icon --></svg>
</button>
```

```css
.close-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.1);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.close-btn:hover {
  background: rgba(0, 0, 0, 0.2);
}

/* Dark mode */
.dark .close-btn {
  background: rgba(255, 255, 255, 0.1);
}

.dark .close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}
```

### Card Layout Adjustments

With the close button absolutely positioned, the card content can use the full width without reserved space:

```css
.overlay-card {
  position: relative; /* For absolute close button */
  width: 100%;
  padding: 16px;
  background: var(--card-bg);
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 
              0 2px 4px -1px rgba(0, 0, 0, 0.06);
}
```

## Integration with Existing Code

### Changes to PubLocationsMap.vue

1. **Import/create CustomPubOverlay**:
```typescript
import { CustomPubOverlay } from '@/components/CustomPubOverlay'
// or define inline if small enough
```

2. **Replace InfoWindow ref**:
```typescript
// OLD
const infoWindow = ref<google.maps.InfoWindow | null>(null)

// NEW
const pubOverlay = ref<CustomPubOverlay | null>(null)
```

3. **Initialize in initMap()**:
```typescript
// OLD
infoWindow.value = new google.maps.InfoWindow()

// NEW
pubOverlay.value = new CustomPubOverlay({
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
  }
})
pubOverlay.value.setMap(map.value)
```

4. **Update showPubInfo()**:
```typescript
const showPubInfo = (pub: Pub, marker: google.maps.marker.AdvancedMarkerElement) => {
  if (!pubOverlay.value) return
  
  const position = marker.position as google.maps.LatLng
  pubOverlay.value.show(pub, position)
  selectedPub.value = pub
}
```

5. **Update reactive updates**:
```typescript
// When visit data changes, update overlay if showing same pub
watch(() => visits.value, () => {
  if (selectedPub.value && pubOverlay.value) {
    pubOverlay.value.update(selectedPub.value)
  }
}, { deep: true })
```

## Theme Integration

The overlay must respect the current theme (light/dark mode). This can be achieved by:

1. Reading theme from composable: `const { isDark } = useTheme()`
2. Passing theme state to overlay in `show()` or `update()` methods
3. Generating CSS variables or class names based on theme

```typescript
// In CustomPubOverlay
show(pub: Pub, position: google.maps.LatLng, isDark: boolean) {
  this.pub = pub
  this.position = position
  this.isDark = isDark
  // ... rest of logic
}

// Apply theme class to container
if (this.container) {
  this.container.classList.toggle('dark', this.isDark)
}
```

## Accessibility Considerations

1. **Keyboard Navigation**: Overlay must be keyboard accessible
   - Close button must be focusable
   - Tab order: Close → Link → Button
   - ESC key should close overlay

2. **ARIA Attributes**:
   - Add `role="dialog"` to overlay container
   - Add `aria-label="Pub information for [pub name]"`
   - Close button has `aria-label="Close"`

3. **Focus Management**:
   - When overlay opens, move focus to overlay or close button
   - When overlay closes, return focus to marker (if possible) or map

```typescript
onAdd() {
  this.container = document.createElement('div')
  this.container.setAttribute('role', 'dialog')
  this.container.setAttribute('aria-modal', 'false') // Not truly modal
  // ... rest of setup
}

show(pub: Pub, position: google.maps.LatLng) {
  // ... existing logic
  
  // Focus management
  setTimeout(() => {
    const closeBtn = this.container?.querySelector('.close-btn') as HTMLElement
    closeBtn?.focus()
  }, 100)
}
```

## Testing Strategy

1. **Visual Testing**:
   - Test on mobile (320px, 375px, 414px widths)
   - Test on tablet (768px, 1024px widths)
   - Test on desktop (1280px+)
   - Test both light and dark themes

2. **Functional Testing**:
   - Overlay shows at correct position
   - Overlay repositions when map pans/zooms
   - Close button closes overlay
   - Track visit button opens PubDetailSheet
   - Sign-in button opens LoginDialog
   - All badges and content render correctly

3. **Edge Cases**:
   - Markers near map edges (top, bottom, left, right)
   - High zoom levels (close-up)
   - Low zoom levels (far out)
   - Multiple rapid marker clicks
   - Screen rotation on mobile

4. **Accessibility Testing**:
   - Keyboard navigation (Tab, Enter, ESC)
   - Screen reader announcement
   - Focus indicator visibility
   - ARIA attribute correctness

## Performance Considerations

- **DOM Reuse**: Reuse single overlay instance instead of creating new ones
- **Event Delegation**: Use minimal event listeners, clean up properly
- **Debounce draw()**: Google Maps may call draw() frequently; ensure it's efficient
- **Content Updates**: Only re-render content when pub data changes, not on every draw()

## Rollback Plan

If custom overlay introduces critical bugs:
1. Revert to previous `google.maps.InfoWindow` implementation
2. Apply CSS overrides to mitigate spacing/width issues as temporary fix
3. Plan more thorough testing for next attempt

## Future Enhancements (Out of Scope)

- Animation/transitions when showing/hiding overlay
- "Bounce" animation on marker when overlay opens
- Swipe gestures to close on mobile
- Directional pointer that follows marker position
