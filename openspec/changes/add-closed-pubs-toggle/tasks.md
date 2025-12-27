# Tasks: Add Closed Pubs Toggle

## Implementation Tasks

- [ ] **Add toggle state management in PubLocationsMap.vue**
  - Add `showClosedPubs` ref with default value `false`
  - Add computed property `filteredPubsForMap` that filters based on `openState` field
  - Handle case-insensitive matching for "closed" in `openState`
  - Treat missing `openState` as "Open"
  - Pass `showClosedPubs` boolean to PubSidebar component

- [ ] **Update map marker rendering to use filtered pubs**
  - Modify `createMarkers()` to use `filteredPubsForMap` instead of `pubs`
  - Ensure markers are recreated when toggle changes
  - Close any open info windows for pubs whose markers are removed

- [ ] **Pass all pubs and toggle state to sidebar**
  - Keep passing all `pubs` to PubSidebar (not filtered)
  - Pass `showClosedPubs` boolean prop to PubSidebar
  - Verify sidebar displays all pubs regardless of toggle state
  - Implement count logic: Toggle ON shows "X (Y closed)", Toggle OFF shows "X" (open only)

- [ ] **Add visual differentiation for closed pubs in sidebar**
  - Create `isPubClosed()` helper function to check `openState`
  - Apply `opacity-50` class to closed pub entries
  - Apply `text-muted-foreground` class to closed pub entries
  - Ensure closed pubs remain clickable and functional
  - Test visual contrast is clear but not distracting

- [ ] **Add toggle control to sidebar header**
  - Add checkbox/switch input in `PubSidebar.vue` header section
  - Label it "Show Closed Pubs"
  - Bind to `showClosedPubs` prop from parent
  - Emit `toggleClosedPubs` event to parent when toggled
  - Style toggle to match existing UI (Tailwind/shadcn)

- [ ] **Connect toggle event handler**
  - Listen for `toggleClosedPubs` event in `PubLocationsMap.vue`
  - Update `showClosedPubs` state when event fires
  - Verify reactivity triggers re-render of map and sidebar

- [ ] **Test filtering logic**
  - Test with all open pubs
  - Test with all closed pubs
  - Test with mixed open/closed pubs
  - Test with pubs missing `openState` field
  - Test variations: "Closed", "CLOSED", "Temporarily Closed", "Permanently Closed"

- [ ] **Test UI interactions**
  - Toggle defaults to OFF on load (closed pub markers hidden)
  - Sidebar shows all pubs regardless of toggle state
  - Closed pubs in sidebar have muted/grayed styling
  - Toggling ON shows previously hidden markers on map
  - Toggling OFF hides closed pub markers again
  - Sidebar counts: Toggle ON displays "X (Y closed)" format
  - Sidebar counts: Toggle OFF displays "X" (open count only)
  - Counts update immediately when toggling
  - Map markers update correctly when toggling
  - Toggle is keyboard accessible
  - Clicking closed pub in sidebar pans map even when marker hidden

- [ ] **Test edge cases**
  - All pubs closed (toggle OFF: no map markers, all pubs grayed in sidebar)
  - No closed pubs in data (toggle has no visual effect, sidebar unchanged)
  - Selecting closed pub from sidebar when markers hidden (map pans, shows info)
  - Clicking map marker with filter active
  - Counts display correctly for groups with all closed/all open pubs

- [ ] **Verify integration with existing features**
  - Sidebar expand/collapse works with all pubs visible
  - Pub selection from sidebar works for both open and closed pubs
  - Map info windows work when selecting closed pubs
  - Closed pub visual styling works in collapsed/expanded states
  - Mobile overlay/backdrop behavior unchanged

- [ ] **Update documentation**
  - Add feature description to README.md
  - Document `showClosedPubs` state and `filteredPubsForMap` computed property
  - Document sidebar visual differentiation approach
  - Document toggle control behavior (affects map only, sidebar always shows all)

## Dependencies
- None - this is a new feature that extends existing components

## Parallel Work
- All tasks are sequential as they build on the filtering infrastructure
