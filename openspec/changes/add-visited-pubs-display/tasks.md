# Tasks: Add Visited Pubs Display

## Phase 1: Visit Data Management (Foundation)

### 1.1 Create Visit Data Types
- [x] Define `Visit` interface in types file or composable
- [x] Include required fields: `id`, `userId`, `pubId`
- [x] Include optional fields: `visitedAt`, `rating`, `notes`
- [x] Export interface for use in composables and components

### 1.2 Implement useVisits Composable
- [x] Create `src/composables/useVisits.ts`
- [x] Define reactive state: `visitedPubIds` (Set), `visits` (array), `isLoading`, `error`
- [x] Implement `loadVisits(userId: number)` method
  - Fetch from `/data/visits-sample.json`
  - Filter to matching userId
  - Populate Set with pub IDs AND store full Visit objects
  - Handle errors gracefully
- [x] Implement `isVisited(pubId: number)` method (O(1) Set lookup)
- [x] Implement `getGroupCounts(pubs: Pub[])` method
  - Count visited pubs in array
  - Return `{ visited: number, total: number }`
- [x] Implement `getVisitDate(pubId: number)` method (REQ-PVD-006)
  - Find Visit object for pubId
  - Return `visitedAt` ISO string or null
- [x] Implement `clearVisits()` method for logout
- [x] Add JSDoc comments for all exported methods

### 1.3 Create Test Visit Data
- [x] Create `Wetherspooning/public/data/visits-sample.json`
- [x] Add 10-15 sample visits for test user (userId: 1)
- [x] Include mix of open and closed pubs
- [x] Include visits across different counties/countries
- [x] Include some with `visitedAt`, `rating`, `notes` fields
- [x] Validate JSON structure

### 1.4 Unit Test useVisits Composable
- [ ] Test `loadVisits()` successfully fetches and parses data
- [ ] Test `loadVisits()` filters to correct userId
- [ ] Test `isVisited()` returns true for visited pubs
- [ ] Test `isVisited()` returns false for unvisited pubs
- [ ] Test `isVisited()` returns false when no data loaded
- [ ] Test `getGroupCounts()` calculates correct counts
- [ ] Test `getGroupCounts()` works with empty array
- [ ] Test `clearVisits()` removes all visited pub IDs
- [ ] Test error handling for failed fetch

## Phase 2: Map Visual Differentiation

### 2.1 Integrate Visit Data in Map Component
- [x] Import `useVisits` in `PubLocationsMap.vue`
- [x] Import `useAuth` to get authentication state
- [x] Call `useVisits()` to get composable instance
- [x] Watch `isAuthenticated` from useAuth
- [x] When authenticated, call `loadVisits(user.id)`
- [x] When logout, call `clearVisits()` or watch for state change

### 2.2 Update Marker Creation Logic
- [x] Modify `createMarkers()` function
- [x] For each pub, check both `pub.openState` and `isVisited(pub.id)`
- [x] Implement 4 marker styles:
  - Unvisited + Open: `backgroundColor: '#ea4335'`, `opacity: '1'`
  - Unvisited + Closed: `backgroundColor: '#9ca3af'`, `opacity: '0.6'`
  - Visited + Open: `backgroundColor: '#34a853'`, `opacity: '1'`
  - Visited + Closed: `backgroundColor: '#4285f4'`, `opacity: '0.6'`
- [x] Keep existing white border and shadow styles
- [x] Ensure all markers remain clickable and hoverable

### 2.3 Update Info Window Display
- [x] Modify `showPubInfo()` function
- [x] Import `getVisitDate` from useVisits
- [x] Format visit date as human-readable string (REQ-PLM-008)
- [x] Display as "Visited on {date}" in info window
- [x] Show only when authenticated and pub is visited
- [x] Style with green text color

### 2.4 Handle Visit Data Changes
- [x] Watch for changes to `visitedPubIds` or authentication state
- [x] Recreate markers when visit data loads
- [x] Recreate markers when visit data clears (logout)
- [x] Ensure smooth transitions without breaking existing watches

### 2.5 Component Test Map Markers
- [ ] Test unauthenticated user sees 2 marker states (red, gray)
- [ ] Test authenticated user sees 4 marker states
- [ ] Test marker colors match specification
- [ ] Test markers recreate when authentication changes
- [ ] Test markers recreate when visit data loads
- [ ] Test info window displays visit date for visited pubs
- [ ] Test info window does NOT display visit date for unvisited pubs

## Phase 3: Sidebar Visit Progress

### 3.1 Integrate Visit Data in Sidebar
- [x] Import `useVisits` in `PubSidebar.vue`
- [x] Call `useVisits()` to get composable instance
- [x] Use existing `isAuthenticated` from useAuth
- [x] Watch authentication state to trigger visit data load
- [x] Get `getGroupCounts` method from useVisits

### 3.2 Update Group Display Logic
- [x] Modify country group rendering to show visit counts
- [x] Modify county group rendering to show visit counts
- [x] When authenticated, display "✓ Visited X/Y" format
- [x] When authenticated AND showClosedPubs is ON, display "✓ Visited X/Y (Z closed)" format (REQ-PNS-001)
- [x] When not authenticated, display "(Y pubs)" format
- [x] Use `getGroupCounts(pubsInGroup)` to calculate counts
- [x] Apply muted text color for visit counts

### 3.3 Respect Closed Pubs Filter
- [x] Ensure visit counts use filtered pub lists (already filtered by `filteredPubs`)
- [x] Verify counts update when "Show Closed Pubs" toggle changes
- [x] Test that hidden closed pubs don't affect visit counts

### 3.4 Add Visual Indicators
- [x] Add checkmark icon (✓) before "Visited" text
- [x] Add visit date display on individual pub items (REQ-PNS-009)
  - Import `getVisitDate` from useVisits
  - Create `formatVisitDate` helper for human-readable dates
  - Display as "Visited {date}" below pub location
  - Show only when authenticated and pub is visited
  - Style with green text color
- [x] Only show checkmark when `visited > 0`
- [ ] Consider success color for 100% completion (optional enhancement)
- [x] Ensure consistent spacing and alignment

### 3.5 Component Test Sidebar Counts
- [ ] Test unauthenticated user sees only total counts
- [ ] Test authenticated user sees visit progress
- [ ] Test counts update after login
- [ ] Test counts clear after logout
- [ ] Test counts respect closed pubs filter
- [ ] Test checkmark appears when visits > 0
- [ ] Test closed count displays when showClosedPubs is ON
- [ ] Test visit dates display on individual pub items for visited pubs

## Phase 4: Integration & Polish

### 4.1 Test Authentication Flow
- [x] Test complete flow: load page → login → visit data loads → UI updates
- [x] Test logout clears visit state in both map and sidebar
- [x] Verify no errors in console during auth state changes
- [ ] Test rapid login/logout doesn't cause race conditions

### 4.2 Error Handling
- [ ] Test behavior when `/data/visits-sample.json` is missing
- [ ] Verify app continues functioning with empty visit state
- [ ] Check console logs show appropriate warnings
- [ ] Test invalid JSON in visits file
- [ ] Test network error during visit data fetch

### 4.3 Performance Testing
- [x] Verify visit lookups are performant with Set implementation
- [x] Test sidebar renders quickly with visit counts (< 100ms)
- [x] Test marker recreation is smooth (< 200ms)
- [ ] Profile visit count calculations for large groups
- [ ] Ensure no memory leaks from watch/computed properties

### 4.4 Visual QA
- [x] Verify all 4 marker colors are distinct and accessible
- [ ] Test marker visibility with different zoom levels
- [ ] Verify sidebar visit counts are readable and well-aligned
- [ ] Test responsive behavior on mobile
- [x] Check dark theme compatibility (already using theme colors)

## Phase 5: Documentation & Testing

### 5.1 E2E Tests
- [ ] Test complete user journey: login → see visited pubs → view progress
- [ ] Test map marker states for all 4 combinations
- [ ] Test sidebar progress updates dynamically
- [ ] Test filter toggle affects visit counts
- [ ] Test logout clears all visit state

### 5.2 Documentation
- [ ] Update README with visit tracking feature description
- [ ] Document test user credentials and sample visit data
- [ ] Add JSDoc comments to all new methods
- [ ] Document visit data JSON structure
- [ ] Note future backend integration points in code comments

### 5.3 Code Review Preparation
- [ ] Ensure TypeScript compilation succeeds
- [ ] Run linter and fix any issues
- [ ] Remove any console.log debugging statements
- [ ] Verify all tests pass
- [ ] Review code for potential optimizations

## Phase 6: Validation & Archive

### 6.1 Manual Testing
- [ ] Test on Chrome, Firefox, Safari (desktop)
- [ ] Test on mobile browsers (Chrome, Safari)
- [ ] Verify accessibility (keyboard navigation, screen reader)
- [ ] Test with network throttling
- [ ] Test all edge cases (no visits, all visits, etc.)

### 6.2 Archive & PR
- [ ] Commit changes with conventional commit messages
- [ ] Run `openspec archive add-visited-pubs-display --yes`
- [ ] Create pull request with template
- [ ] Include screenshots of 4 marker states
- [ ] Document testing performed
- [ ] Link to OpenSpec change in PR description
