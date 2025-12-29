# Tasks: Add Visit Statistics Display

## Task List

- [x] **Add overall visit statistics computed property to PubSidebar.vue**
   - Create `overallStats` computed property that calculates:
     - Total visited count from `filteredPubs`
     - Total remaining count (total - visited)
     - Progress percentage
   - Use existing `getGroupCounts()` function from `useVisits` composable
   - Ensure calculation respects `filteredPubs` (honors closed pubs filter)
   - **Validation:** Stats update correctly when filter changes

- [x] **Add statistics display section to sidebar header in PubSidebar.vue**
   - Position below user menu section and above closed pubs toggle
   - Display when `isAuthenticated` is true
   - Show three lines or compact layout:
     - "Visited: X"
     - "Remaining: Y"
     - "Progress: Z%"
   - Use consistent text styling with existing sidebar elements
   - Use muted-foreground text color for consistency
   - **Validation:** Section appears only for authenticated users

- [x] **Style statistics section for visual consistency**
   - Add spacing/padding consistent with other sidebar header sections
   - Ensure text size and color match existing UI patterns
   - Keep layout compact to minimize space usage
   - Ensure mobile responsiveness (fits in sidebar on small screens)
   - **Validation:** Visual appearance matches existing sidebar styling

- [x] **Verify statistics update reactivity**
   - Test that stats update when visit is added via `addVisit()`
   - Test that stats update when visit is removed via `removeVisit()`
   - Test that stats update when "Show Closed Pubs" is toggled
   - Test that stats appear after login and disappear after logout
   - **Validation:** All real-time updates work correctly within 50ms

- [x] **Test edge cases**
   - Verify display with 0 visits (0/150, 0%)
   - Verify display with all visits complete (150/150, 100%)
   - Verify closed pub filtering affects counts correctly
   - Verify performance with large pub dataset (1000+ pubs)
   - **Validation:** All edge cases handled gracefully

- [x] **Manual testing on different devices**
   - Test on desktop browser
   - Test on mobile viewport
   - Verify layout doesn't break sidebar header
   - Ensure text remains readable on small screens
   - **Validation:** UI works correctly across all screen sizes

## Dependencies

- Requires `PubSidebar.vue` component
- Requires `useVisits` composable (already implemented)
- Requires `useAuth` composable (already implemented)
- Depends on existing `filteredPubs` computed property

## Validation Criteria

- Statistics display only when user is authenticated
- Statistics exclude closed pubs when toggle is OFF
- Statistics update within 50ms when:
  - Visit is added or removed
  - Closed pubs filter is toggled
  - User logs in or out
- Statistics calculation completes in under 10ms
- UI remains responsive with no perceptible lag
- Layout is compact and doesn't dominate sidebar header
- Visual styling is consistent with existing sidebar elements
