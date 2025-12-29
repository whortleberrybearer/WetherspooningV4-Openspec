# Tasks: Add Marker Clustering

## Task 1: Install MarkerClusterer Dependency ✓
**Type:** Setup  
**Estimated Effort:** Small  
**Dependencies:** None

- [x] Add `@googlemaps/markerclusterer` to package.json dependencies
- [x] Run `npm install` to install the package
- [x] Verify package installation and version compatibility with existing Google Maps setup
- [x] No code changes in this step

**Validation:**
- [x] Package appears in package.json dependencies
- [x] node_modules contains @googlemaps/markerclusterer
- [x] `npm list @googlemaps/markerclusterer` shows installed version

---

## Task 2: Import MarkerClusterer and Type Definitions ✓
**Type:** Code  
**Estimated Effort:** Small  
**Dependencies:** Task 1

- [x] Add import statement for MarkerClusterer in PubLocationsMap.vue
- [x] Import necessary types (MarkerClusterer, Renderer, Algorithm)
- [x] Add clusterer state variables (visitedClusterer, unvisitedClusterer) as shallowRefs
- [x] Verify TypeScript compilation succeeds with new imports

**Validation:**
- [x] No TypeScript errors
- [x] File compiles successfully
- [x] State variables are properly typed

---

## Task 3: Implement Custom Cluster Renderers ✓
**Type:** Code  
**Estimated Effort:** Medium  
**Dependencies:** Task 2

- [x] Create `createClusterRenderer` function that returns a custom renderer
- [x] Implement visited cluster renderer (green background #34a853)
- [x] Implement unvisited cluster renderer (red background #ea4335)
- [x] Style clusters with white text, white border, and shadow
- [x] Ensure cluster counts display correctly
- [x] Test renderer output in browser console

**Validation:**
- [x] Renderer functions return valid marker elements
- [x] Cluster styling matches specification (colors, borders, text)
- [x] Cluster counts appear correctly formatted

---

## Task 4: Implement Marker Separation Logic ✓
**Type:** Code  
**Estimated Effort:** Medium  
**Dependencies:** Task 2

- [x] Create `separateMarkers()` function that splits markers into visited/unvisited arrays
- [x] Use existing `isVisited()` composable to check visit status
- [x] Associate each marker with its corresponding pub for status lookup
- [x] Return object with `{ visited: AdvancedMarkerElement[], unvisited: AdvancedMarkerElement[] }`
- [x] Handle edge cases (marker without pub, invalid pub ID)

**Validation:**
- [x] Function correctly categorizes all markers
- [x] No markers are lost or duplicated
- [x] Edge cases handled gracefully with console warnings

---

## Task 5: Initialize Clusterers After Markers Created ✓
**Type:** Code  
**Estimated Effort:** Medium  
**Dependencies:** Task 3, Task 4

- [x] Modify `createMarkers()` function to call `initializeClusters()` after markers are created
- [x] Implement `initializeClusters()` function:
  - [x] Clear existing clusterers if they exist
  - [x] Separate markers into visited/unvisited using `separateMarkers()`
  - [x] Create visited MarkerClusterer with visited markers and green renderer
  - [x] Create unvisited MarkerClusterer with unvisited markers and red renderer
  - [x] Configure algorithm options (maxZoom: 12)
- [x] Bind both clusterers to the map instance

**Validation:**
- [x] Clusters appear on map when zoomed out
- [x] Individual markers appear at zoom level 13+
- [x] Visited/unvisited clusters have correct colors
- [x] No duplicate markers visible

---

## Task 6: Implement Cluster Update on Visit Changes ✓
**Type:** Code  
**Estimated Effort:** Medium  
**Dependencies:** Task 5

- [x] Create `updateClusters()` function:
  - [x] Clear markers from both clusterers using `clearMarkers()`
  - [x] Re-separate markers based on current visit status
  - [x] Add markers back to appropriate clusterers using `addMarkers()`
- [x] Call `updateClusters()` in existing watch for visitedPubIds and visits
- [x] Ensure smooth updates without full recreation of markers

**Validation:**
- [x] Logging in updates clusters to show visited/unvisited groupings
- [x] Logging out updates clusters to show only unvisited groupings
- [x] Tracking a visit moves marker from unvisited to visited cluster
- [x] No visual glitches during updates

---

## Task 7: Integrate Clustering with Closed Pubs Filter ✓
**Type:** Code  
**Estimated Effort:** Small  
**Dependencies:** Task 5

- [x] Verify `filteredPubsForMap` computed property is used for marker creation
- [x] Ensure clustering respects filter by only clustering visible markers
- [x] Test cluster counts update when filter is toggled
- [x] Verify closed pubs removed from clusters when hidden

**Validation:**
- [x] Toggling closed pubs filter updates cluster counts
- [x] Hidden pubs do not appear in clusters
- [x] Filter changes trigger cluster recalculation

---

## Task 8: Add Cluster Click Behavior ✓
**Type:** Code  
**Estimated Effort:** Small  
**Dependencies:** Task 5

- [x] Configure MarkerClusterer to handle cluster clicks
- [x] Implement zoom-in behavior when cluster is clicked
- [x] Center map on cluster center when zooming
- [x] Set appropriate zoom level to split cluster (typically +3 zoom levels)

**Validation:**
- [x] Clicking cluster zooms map in
- [x] Map centers on cluster area
- [x] Cluster splits into smaller clusters or individual markers
- [x] Click behavior feels natural and responsive

---

## Task 9: Cleanup and Memory Management ✓
**Type:** Code  
**Estimated Effort:** Small  
**Dependencies:** Task 5

- [x] Add cleanup logic in `onBeforeUnmount` lifecycle hook
- [x] Clear markers from both clusterers
- [x] Set clusterer references to null
- [x] Verify no memory leaks using browser dev tools

**Validation:**
- [x] Component unmounts without errors
- [x] Memory usage decreases after unmount
- [x] No lingering event listeners or references

---

## Task 10: Manual Testing and Visual Verification ✓
**Type:** Testing  
**Estimated Effort:** Medium  
**Dependencies:** Task 9

- [x] Test at various zoom levels (6, 10, 12, 13, 15)
- [x] Verify cluster appearance and counts at each zoom level
- [x] Test login/logout updating clusters
- [x] Test tracking visit updating clusters
- [x] Test closed pubs filter interaction
- [x] Test on mobile device or mobile emulation
- [x] Verify performance (smooth panning/zooming)
- [x] Check accessibility (cluster contrast, keyboard navigation)

**Validation:**
- [x] All scenarios from spec pass manual testing
- [x] No visual bugs or glitches
- [x] Performance meets 60 fps target
- [x] Mobile experience is smooth

---

## Task 11: Documentation and Comments ✓
**Type:** Documentation  
**Estimated Effort:** Small  
**Dependencies:** Task 10

- [x] Add JSDoc comments to new functions (createClusterRenderer, separateMarkers, initializeClusters, updateClusters)
- [x] Document why two clusterers are used (visited/unvisited separation)
- [x] Add inline comments for any non-obvious logic
- [x] Update any relevant README or component documentation

**Validation:**
- [x] Functions have clear JSDoc descriptions
- [x] Non-obvious logic is explained with comments
- [x] Comments follow existing code style

---

## Parallelizable Work
Tasks 1-2 can be done sequentially.  
Tasks 3 and 4 can be done in parallel after Task 2.  
Tasks 5-9 must be sequential.  
Task 10-11 can overlap with final testing phases.

## Rollback Plan
If clustering causes issues:
1. Remove MarkerClusterer initialization calls
2. Markers will continue to display without clustering
3. No data loss or breaking changes
4. Can be disabled via feature flag if needed
