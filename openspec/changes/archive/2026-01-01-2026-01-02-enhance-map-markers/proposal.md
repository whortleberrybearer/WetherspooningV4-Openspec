# Proposal: Enhance Map Markers

**Change ID:** `2026-01-02-enhance-map-markers`  
**Status:** Proposed  
**Created:** 2026-01-02

## Problem Statement

The current map markers have several usability issues that reduce the user experience:

1. **Size and Visibility:** Markers are too small (12px diameter), making them difficult to see and click, especially on mobile devices or when zoomed out
2. **Unclear Visual Design:** Simple circular dots don't resemble familiar map markers, reducing intuitive recognition
3. **Limited State Communication:** Current design only uses color and opacity to communicate visited/closed states, which:
   - Violates accessibility best practices (color shouldn't be the primary indicator)
   - Doesn't communicate location types (hotel, airport, train station) visually
   - Is difficult to distinguish at a glance

Users cannot quickly identify:
- Which pubs they've visited (without relying solely on color)
- Which pubs are closed (without relying solely on opacity)
- Which pubs are in special locations like hotels, airports, or train stations

## Proposed Solution

Replace the current small circular markers with larger, map pin-style markers that communicate multiple states through visual design, not just color:

### Marker Design
- **Size:** Increase from 12px to 30-40px height for better visibility and clickability
- **Shape:** Use traditional map pin/teardrop shape for familiar map-like appearance
- **Visual Indicators:** Use icons/glyphs instead of color as the primary state indicator:
  - **Visited state:** Checkmark (✓) icon inside marker
  - **Closed state:** X icon or cross-through style
  - **Location types:** Small badge icons (🏨 for hotel, ✈️ for airport, 🚂 for train station)

### State Combinations
The markers MUST support displaying multiple states simultaneously within a single icon. A marker can show both its visited/unvisited state AND its open/closed state at the same time:

- **Primary indicators (MUST show simultaneously):**
  - Visited vs Unvisited (checkmark icon presence)
  - Open vs Closed (X icon or visual strike-through overlaid on top)
  - **Example:** A visited AND closed pub displays BOTH a checkmark AND an X icon
  
- **Secondary indicators (OPTIONAL, overlaid as badge):**
  - Hotel location (small badge)
  - Airport location (small badge)
  - Train station location (small badge)

### Color Usage
Colors will provide additional context but not be the primary differentiator:
- Visited: Green tint
- Unvisited: Red/default tint
- Closed: Muted/desaturated color

## Scope

### In Scope
- Redesign marker visual appearance to pin/teardrop shape
- Increase marker size to 30-40px height
- Add icon-based visual indicators for visited and closed states
- Add small badge overlays for location types (hotel, airport, train station)
- Ensure markers work with existing clustering functionality
- Maintain accessibility (WCAG AA compliance)
- Support both light and dark themes

### Out of Scope
- Custom marker designs per pub (all pubs use same marker template)
- Animated marker states or transitions
- User customization of marker appearance
- Alternative marker styles or user preferences
- Changes to InfoWindow design (separate concern)

## Impact Analysis

### Affected Components
- **Marker Creation:** `createMarkers()` function in PubLocationsMap.vue
- **Marker Styling:** Current inline styles will be replaced with SVG or HTML-based pin design
- **Clustering:** May need adjustments to cluster renderer for larger markers
- **Spec:** `pub-locations-map` specification (REQ-PLM-002)

### Breaking Changes
None. This is a visual enhancement that doesn't affect:
- Data model (Pub interface remains unchanged)
- API contracts
- User data
- Existing functionality

### Dependencies
- Depends on `pub-locations-map` spec for marker rendering
- Depends on `marker-clustering` spec for cluster interaction
- Integrates with `2026-01-02-add-pub-location-types` for location type badges (if implemented)

### Accessibility Considerations
- **Color Independence:** Icons ensure state is visible to colorblind users
- **Size:** Larger markers easier to click for motor impairments
- **Contrast:** Ensure icons have sufficient contrast in both light and dark themes
- **Screen Readers:** Maintain `title` attribute for marker hover text

## Alternatives Considered

### 1. Keep Small Circular Markers with Better Color Palette
**Rejected:** Doesn't address visibility or accessibility concerns. Color alone is insufficient for state communication.

### 2. Use Google Maps Default Pin Icons
**Rejected:** Limited customization for showing multiple states simultaneously (visited + closed + location type). Cannot easily display icons/badges.

### 3. Larger Circles Instead of Pins
**Rejected:** Lacks familiarity of map pin shape. Less intuitive for users expecting traditional map markers.

### 4. Custom Marker Images (PNG/JPG)
**Rejected:** Less flexible than SVG, harder to maintain, no theme support, poor scaling on high-DPI displays.

## Success Criteria

1. Markers are 30-40px in height (significantly larger and more visible)
2. Markers use pin/teardrop shape resembling traditional map markers
3. Visited state is indicated by checkmark icon (not just color)
4. Closed state is indicated by X icon or visual strike-through (not just opacity)
5. **Markers MUST display both visited/unvisited AND closed states simultaneously (e.g., checkmark + X for visited closed pub)**
6. Location type badges (hotel, airport, train station) are visible when applicable
7. Color provides supplementary context but is not the primary state indicator
8. Markers maintain visual clarity when clustered
9. Markers meet WCAG AA contrast requirements in both light and dark themes
10. Marker click targets are easier to hit on mobile devices
11. All four state combinations are clearly distinguishable: visited+open, visited+closed, unvisited+open, unvisited+closed
12. No regressions to existing marker functionality (clustering, info windows, filtering)

## Open Questions

1. **Icon Library:** Should we use:
   - Unicode emoji (🏨, ✈️, 🚂, ✓, ✗)
   - Custom SVG icons
   - Icon font library (e.g., Lucide icons from shadcn/vue)
   
   **Recommendation:** Custom SVG icons for consistency with shadcn/vue design system and better control over appearance.

2. **Marker Implementation:** Should we use:
   - HTML/CSS elements (current approach, easier to style)
   - Pure SVG (more performant, better scaling)
   - PinElement from Google Maps Advanced Markers API
   
   **Recommendation:** HTML/CSS with embedded SVG icons for flexibility and theme integration.

3. **Badge Positioning:** Where should location type badges appear?
   - Top-right corner of pin
   - Bottom of pin
   - Inside pin body
   
   **Recommendation:** Top-right corner as a small overlay badge (8-12px) to avoid obscuring primary state icons.
