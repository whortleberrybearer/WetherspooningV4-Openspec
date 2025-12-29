# Tasks: Add Marker Clustering

## Task 1: Install MarkerClusterer Dependency
**Type:** Setup  
**Estimated Effort:** Small  
**Dependencies:** None

- Add `@googlemaps/markerclusterer` to package.json dependencies
- Run `npm install` to install the package
- Verify package installation and version compatibility with existing Google Maps setup
- No code changes in this step

**Validation:**
- Package appears in package.json dependencies
- node_modules contains @googlemaps/markerclusterer
- `npm list @googlemaps/markerclusterer` shows installed version

---

## Task 2: Import MarkerClusterer and Type Definitions
**Type:** Code  
**Estimated Effort:** Small  
**Dependencies:** Task 1

- Add import statement for MarkerClusterer in PubLocationsMap.vue
- Import necessary types (MarkerClusterer, Renderer, Algorithm)
- Add clusterer state variables (visitedClusterer, unvisitedClusterer) as shallowRefs
- Verify TypeScript compilation succeeds with new imports

**Validation:**
- No TypeScript errors
- File compiles successfully
- State variables are properly typed

---

## Task 3: Implement Custom Cluster Renderers
**Type:** Code  
**Estimated Effort:** Medium  
**Dependencies:** Task 2

- Create `createClusterRenderer` function that returns a custom renderer
- Implement visited cluster renderer (green background #34a853)
- Implement unvisited cluster renderer (red background #ea4335)
- Style clusters with white text, white border, and shadow
- Ensure cluster counts display correctly
- Test renderer output in browser console

**Validation:**
- Renderer functions return valid marker elements
- Cluster styling matches specification (colors, borders, text)
- Cluster counts appear correctly formatted

---

## Task 4: Implement Marker Separation Logic
**Type:** Code  
**Estimated Effort:** Medium  
**Dependencies:** Task 2

- Create `separateMarkers()` function that splits markers into visited/unvisited arrays
- Use existing `isVisited()` composable to check visit status
- Associate each marker with its corresponding pub for status lookup
- Return object with `{ visited: AdvancedMarkerElement[], unvisited: AdvancedMarkerElement[] }`
- Handle edge cases (marker without pub, invalid pub ID)

**Validation:**
- Function correctly categorizes all markers
- No markers are lost or duplicated
- Edge cases handled gracefully with console warnings

---

## Task 5: Initialize Clusterers After Markers Created
**Type:** Code  
**Estimated Effort:** Medium  
**Dependencies:** Task 3, Task 4

- Modify `createMarkers()` function to call `initializeClusters()` after markers are created
- Implement `initializeClusters()` function:
  - Clear existing clusterers if they exist
  - Separate markers into visited/unvisited using `separateMarkers()`
  - Create visited MarkerClusterer with visited markers and green renderer
  - Create unvisited MarkerClusterer with unvisited markers and red renderer
  - Configure algorithm options (maxZoom: 12)
- Bind both clusterers to the map instance

**Validation:**
- Clusters appear on map when zoomed out
- Individual markers appear at zoom level 13+
- Visited/unvisited clusters have correct colors
- No duplicate markers visible

---

## Task 6: Implement Cluster Update on Visit Changes
**Type:** Code  
**Estimated Effort:** Medium  
**Dependencies:** Task 5

- Create `updateClusters()` function:
  - Clear markers from both clusterers using `clearMarkers()`
  - Re-separate markers based on current visit status
  - Add markers back to appropriate clusterers using `addMarkers()`
- Call `updateClusters()` in existing watch for visitedPubIds and visits
- Ensure smooth updates without full recreation of markers

**Validation:**
- Logging in updates clusters to show visited/unvisited groupings
- Logging out updates clusters to show only unvisited groupings
- Tracking a visit moves marker from unvisited to visited cluster
- No visual glitches during updates

---

## Task 7: Integrate Clustering with Closed Pubs Filter
**Type:** Code  
**Estimated Effort:** Small  
**Dependencies:** Task 5

- Verify `filteredPubsForMap` computed property is used for marker creation
- Ensure clustering respects filter by only clustering visible markers
- Test cluster counts update when filter is toggled
- Verify closed pubs removed from clusters when hidden

**Validation:**
- Toggling closed pubs filter updates cluster counts
- Hidden pubs do not appear in clusters
- Filter changes trigger cluster recalculation

---

## Task 8: Add Cluster Click Behavior
**Type:** Code  
**Estimated Effort:** Small  
**Dependencies:** Task 5

- Configure MarkerClusterer to handle cluster clicks
- Implement zoom-in behavior when cluster is clicked
- Center map on cluster center when zooming
- Set appropriate zoom level to split cluster (typically +3 zoom levels)

**Validation:**
- Clicking cluster zooms map in
- Map centers on cluster area
- Cluster splits into smaller clusters or individual markers
- Click behavior feels natural and responsive

---

## Task 9: Cleanup and Memory Management
**Type:** Code  
**Estimated Effort:** Small  
**Dependencies:** Task 5

- Add cleanup logic in `onBeforeUnmount` lifecycle hook
- Clear markers from both clusterers
- Set clusterer references to null
- Verify no memory leaks using browser dev tools

**Validation:**
- Component unmounts without errors
- Memory usage decreases after unmount
- No lingering event listeners or references

---

## Task 10: Manual Testing and Visual Verification
**Type:** Testing  
**Estimated Effort:** Medium  
**Dependencies:** Task 9

- Test at various zoom levels (6, 10, 12, 13, 15)
- Verify cluster appearance and counts at each zoom level
- Test login/logout updating clusters
- Test tracking visit updating clusters
- Test closed pubs filter interaction
- Test on mobile device or mobile emulation
- Verify performance (smooth panning/zooming)
- Check accessibility (cluster contrast, keyboard navigation)

**Validation:**
- All scenarios from spec pass manual testing
- No visual bugs or glitches
- Performance meets 60 fps target
- Mobile experience is smooth

---

## Task 11: Documentation and Comments
**Type:** Documentation  
**Estimated Effort:** Small  
**Dependencies:** Task 10

- Add JSDoc comments to new functions (createClusterRenderer, separateMarkers, initializeClusters, updateClusters)
- Document why two clusterers are used (visited/unvisited separation)
- Add inline comments for any non-obvious logic
- Update any relevant README or component documentation

**Validation:**
- Functions have clear JSDoc descriptions
- Non-obvious logic is explained with comments
- Comments follow existing code style

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
