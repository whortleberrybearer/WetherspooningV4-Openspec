# Tasks: Add Closed Pubs Toggle

## Implementation Tasks

- [x] **Add toggle state management in PubLocationsMap.vue**
  - Add `showClosedPubs` ref with default value `false`
  - Add computed property `filteredPubsForMap` that filters based on `openState` field
  - Handle case-insensitive matching for "closed" in `openState`
  - Treat missing `openState` as "Open"
  - Pass `showClosedPubs` boolean to PubSidebar component

- [x] **Update map marker rendering to use filtered pubs**
  - Modify `createMarkers()` to use `filteredPubsForMap` instead of `pubs`
  - Ensure markers are recreated when toggle changes
  - Close any open info windows for pubs whose markers are removed
  - Add visual differentiation for closed pub markers (gray color, reduced opacity)

- [x] **Update sidebar to filter pubs based on toggle state**
  - Add `filteredPubs` computed property in PubSidebar
  - Filter to show only open pubs when toggle is OFF
  - Show all pubs when toggle is ON
  - Update `groupedPubs` to use `filteredPubs` instead of `props.pubs`
  - Hide groups (countries/counties) that have no pubs after filtering

- [x] **Add visual differentiation for closed pubs in sidebar**
  - Keep `isPubClosed()` helper function to check `openState`
  - Apply `opacity-50` class to closed pub entries when shown
  - Apply `text-muted-foreground` class to closed pub entries when shown
  - Ensure closed pubs remain clickable and functional
  - Test visual contrast is clear but not distracting

- [x] **Add toggle control to sidebar header**
  - Add checkbox/switch input in `PubSidebar.vue` header section
  - Label it "Show Closed Pubs"
  - Bind to `showClosedPubs` prop from parent
  - Emit `toggleClosedPubs` event to parent when toggled
  - Style toggle to match existing UI (Tailwind/shadcn)

- [x] **Connect toggle event handler**
  - Listen for `toggleClosedPubs` event in `PubLocationsMap.vue`
  - Update `showClosedPubs` state when event fires
  - Verify reactivity triggers re-render of map and sidebar

- [ ] **Test filtering logic**
  - Test with all open pubs
  - Test with all closed pubs
  - Test with mixed open/closed pubs
  - Test with pubs missing `openState` field
  - Test variations: "Closed", "CLOSED", "Temporarily Closed", "Permanently Closed"
  - Test that closed pubs are hidden from both map and sidebar when toggle OFF
  - Test that closed pubs appear on map with visual differentiation when toggle ON

- [ ] **Test UI interactions**
  - Toggle defaults to OFF on load (closed pubs hidden from map and sidebar)
  - Sidebar hides closed pubs when toggle is OFF
  - Closed pubs in sidebar have muted/grayed styling when toggle is ON
  - Toggling ON shows previously hidden pubs in both map and sidebar
  - Toggling OFF hides closed pubs from both map and sidebar
  - Sidebar counts: Toggle ON displays "X (Y closed)" format
  - Sidebar counts: Toggle OFF displays "X" (filtered count)
  - Counts update immediately when toggling
  - Map markers update correctly when toggling with visual differentiation
  - Toggle is keyboard accessible
  - Groups with only closed pubs are hidden when toggle is OFF

- [ ] **Test edge cases**
  - All pubs closed (toggle OFF: no map markers, empty sidebar or message)
  - No closed pubs in data (toggle has no visual effect)
  - Groups with only closed pubs hidden when toggle OFF
  - Groups with mixed pubs show only open pubs when toggle OFF
  - Closed pub markers have distinct visual appearance
  - Clicking map marker with filter active works correctly

- [ ] **Verify integration with existing features**
  - Sidebar expand/collapse works with filtered pubs
  - Pub selection from sidebar works for visible pubs
  - Map info windows work when selecting pubs
  - Closed pub visual styling works in collapsed/expanded states
  - Mobile overlay/backdrop behavior unchanged
  - Visual differentiation on map is clear and distinguishable

- [ ] **Update documentation**
  - Add feature description to README.md
  - Document `showClosedPubs` state and `filteredPubsForMap` computed property
  - Document sidebar filtering approach (filters both map and sidebar)
  - Document toggle control behavior (affects both map and sidebar)
  - Document visual differentiation on map (gray markers with reduced opacity)
  - Document group hiding behavior (groups with only closed pubs are hidden when toggle OFF)

## Dependencies
- None - this is a new feature that extends existing components

## Parallel Work
- All tasks are sequential as they build on the filtering infrastructure
