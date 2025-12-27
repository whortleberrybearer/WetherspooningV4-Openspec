# Design: Add Closed Pubs Toggle

## Problem
Users see all pubs on the map regardless of their operational status, which can include permanently or temporarily closed locations. This creates a poor user experience as users may attempt to visit closed pubs. However, completely hiding closed pubs from the sidebar removes historical context and completeness.

## Solution
Implement a toggle control that filters map markers by their `openState` field while keeping all pubs visible in the sidebar with visual differentiation for closed pubs. Closed pubs default to hidden on map but visible (grayed out) in sidebar.

## Architecture

### Component Changes
1. **PubLocationsMap.vue**
   - Add reactive state for `showClosedPubs` (default: false)
   - Add computed property `filteredPubsForMap` that filters based on toggle state
   - Pass all `pubs` to PubSidebar (unfiltered)
   - Use `filteredPubsForMap` when creating map markers

2. **PubSidebar.vue**
   - Add toggle control in the header section
   - Emit `toggleClosedPubs` event to parent
   - Receive `showClosedPubs` boolean prop from parent
   - Apply muted styling (opacity-50, text-muted-foreground) to closed pubs
   - Update pub counts to show "X (Y open)" format
   - Display all pubs regardless of toggle state

### Data Flow
```
Raw Pubs Data (from JSON)
  ↓
showClosedPubs state (boolean)
  ↓
├─→ filteredPubsForMap computed (filters based on openState)
│   ↓
│   Map Markers (render only open pubs when toggle OFF)
│
└─→ Sidebar (receives all pubs + showClosedPubs prop)
    ↓
    - Closed pubs shown with opacity-50 and muted text
    - Counts: showClosedPubs=ON → "X (Y closed)"
    - Counts: showClosedPubs=OFF → "X" (open only)
```

### UI Placement
The toggle will be placed in the sidebar header, next to or below the "Wetherspooning" title. This keeps filtering controls together with the navigation interface.

**Count Display Logic:**
- Toggle ON (showing closed pubs on map): "X (Y closed)" - e.g., "10 (2 closed)"
- Toggle OFF (hiding closed pubs on map): "X" - e.g., "8" (open count only)
- All open pubs: "X" - e.g., "10" (no parentheses needed)

### Filter Logic
```typescript
// For map markers only
filteredPubsForMap = computed(() => {
  if (showClosedPubs.value) {
    return pubs.value
  }
  return pubs.value.filter(pub => {
    // Treat missing openState as "Open" (fail-safe)
    const state = pub.openState || 'Open'
    return !state.toLowerCase().includes('closed')
  })
})

// In sidebar - check if pub is closed for styling
function isPubClosed(pub: Pub): boolean {
  const state = pub.openState || 'Open'
  return state.toLowerCase().includes('closed')
}
```

### Edge Cases
- Pubs without `openState` field → treated as "Open"
- Case-insensitive matching for "closed", "Closed", "CLOSED"
- Handles "Temporarily Closed" and "Permanently Closed" variants
- All closed pubs on map (toggle OFF) → map has no markers, sidebar shows all with visual differentiation
- Clicking closed pub in sidebar when toggle OFF → map pans but no marker (could show temporary marker or info window)

## Trade-offs

### Option 1: Show All in Sidebar with Visual Differentiation (CHOSEN)
**Pros:**
- Complete view of all pubs maintains context
- Users can see full coverage without toggling
- Closed pubs remain discoverable
- Visual hierarchy guides users to open pubs
- Better for historical tracking

**Cons:**
- Sidebar may feel cluttered with many closed pubs
- Requires careful visual design to avoid confusion
- Counts are more complex (total vs open)

### Option 2: Filter Sidebar and Map Together
**Pros:**
- Simpler mental model (toggle affects everything)
- Cleaner UI when many pubs are closed
- Simpler count display

**Cons:**
- Loss of context when toggle is OFF
- Users must remember to toggle to see all pubs
- Historical data hidden by default

## Testing Considerations
- Test with all pubs open
- Test with all pubs closed
- Test with mixed open/closed states
- Test with missing `openState` fields
- Test toggle interaction updates map markers immediately
- Test sidebar always shows all pubs regardless of toggle
- Test closed pubs have correct visual styling (grayed out)
- Test sidebar counts display correctly:
  - Toggle ON with mixed states: "10 (2 closed)"
  - Toggle OFF with mixed states: "8" (open only)
  - All open: "10" (no parentheses)
- Test clicking closed pub in sidebar when markers hidden
- Test counts update immediately when toggling

## Future Enhancements
- Persist toggle state in localStorage
- Add additional filter criteria (region, county, etc.)
- Show count of hidden pubs in the UI
- Add "closed" visual indicator (grayed out markers) instead of hiding
