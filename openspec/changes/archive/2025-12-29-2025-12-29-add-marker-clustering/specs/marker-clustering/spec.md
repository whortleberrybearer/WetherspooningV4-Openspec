# marker-clustering Specification Delta

This specification defines marker clustering behavior for the pub locations map to improve visualization and performance when many pub markers are located close together.

## ADDED Requirements

### Requirement: Marker Clustering (REQ-MC-001)
**Priority:** MUST  
**Category:** Functional

**Acceptance Criteria:**
- Map uses `@googlemaps/markerclusterer` library for automatic marker grouping
- Two separate clusterers are implemented: one for visited pubs, one for unvisited pubs
- Clusters automatically form when multiple markers are in close proximity based on zoom level
- Individual markers are shown when map is zoomed to level 13 or higher
- Cluster numbers accurately reflect the count of pubs contained in the cluster
- Clusters are clickable and zoom the map into the clustered area
- Clustering works seamlessly with existing marker states and visit tracking
- Clustering respects the closed pubs filter (only clusters visible markers)

#### Scenario: Display Clusters at Low Zoom Levels
**Given** the user is viewing the map at zoom level 6  
**And** there are 50 pubs in London area  
**And** the user has visited 10 of those pubs  
**When** the map renders  
**Then** visited pubs are grouped into one or more green clusters  
**And** unvisited pubs are grouped into one or more red clusters  
**And** each cluster displays a number indicating pub count  
**And** individual markers are not visible

#### Scenario: Display Individual Markers at High Zoom Levels
**Given** the user is viewing the map at zoom level 13  
**And** there are 10 pubs visible in the viewport  
**When** the map renders  
**Then** all 10 pubs are displayed as individual markers  
**And** no clusters are shown  
**And** markers show their appropriate state colors (red/green/gray/blue)

#### Scenario: Click Cluster to Zoom In
**Given** a cluster is displayed showing "12" pubs  
**When** the user clicks the cluster  
**Then** the map zooms in to show the clustered area at higher zoom level  
**And** the cluster splits into smaller clusters or individual markers  
**And** the zoom animation is smooth

#### Scenario: Transition Between Clusters and Markers
**Given** the map is showing clusters at zoom level 10  
**When** the user zooms in to level 13  
**Then** clusters smoothly transition to individual markers  
**And** marker positions remain geographically accurate  
**When** the user zooms back out to level 10  
**Then** individual markers smoothly transition back to clusters

---

### Requirement: Cluster Visual Styling (REQ-MC-002)
**Priority:** MUST  
**Category:** Visual

**Acceptance Criteria:**
- Visited pub clusters have green background (#34a853)
- Unvisited pub clusters have red background (#ea4335)
- Cluster markers have white text showing pub count
- Cluster markers have 2px white border with drop shadow for visibility
- Cluster size may scale based on contained marker count
- Cluster styling is consistent across all zoom levels where clusters are shown
- Clusters are visually distinct from individual markers
- Clusters maintain sufficient contrast for accessibility

#### Scenario: Differentiate Visited and Unvisited Clusters
**Given** the map displays multiple clusters  
**And** some clusters contain only visited pubs  
**And** some clusters contain only unvisited pubs  
**When** the user views the map  
**Then** visited pub clusters have green background (#34a853)  
**And** unvisited pub clusters have red background (#ea4335)  
**And** both cluster types have white text  
**And** both cluster types have white borders with shadows  
**And** the user can quickly distinguish visited areas from unvisited areas

#### Scenario: Cluster Count Display
**Given** a cluster contains 23 unvisited pubs  
**When** the cluster is rendered  
**Then** the cluster shows "23" in white text  
**And** the text is centered in the cluster marker  
**And** the text is clearly readable against the red background

#### Scenario: Maintain Cluster Visibility
**Given** clusters are displayed over various map terrain  
**When** the map background is light or dark  
**Then** cluster borders and shadows remain visible  
**And** cluster text remains readable  
**And** clusters meet minimum contrast requirements (WCAG AA)

---

### Requirement: Cluster Update on Visit Status Change (REQ-MC-003)
**Priority:** MUST  
**Category:** Functional

**Acceptance Criteria:**
- Clusters update immediately when user logs in and visits are loaded
- Clusters update immediately when user logs out and visits are cleared
- Clusters update immediately when user tracks a new visit
- Markers move from unvisited cluster to visited cluster when visit is tracked
- Cluster counts are updated to reflect marker moves
- Update animations are smooth without jarring reflows
- No visual glitches during cluster updates

#### Scenario: Update Clusters After Login
**Given** the user is viewing the map while unauthenticated  
**And** all pub markers are in unvisited (red) clusters  
**When** the user logs in  
**And** visit data is loaded showing 50 visited pubs  
**Then** markers for visited pubs move to visited (green) clusters  
**And** markers for unvisited pubs remain in unvisited (red) clusters  
**And** cluster counts update to reflect the new grouping  
**And** the transition is smooth without jarring reflows

#### Scenario: Update Clusters After Tracking Visit
**Given** the user is authenticated and viewing a cluster of 10 unvisited pubs  
**And** the cluster shows "10" in red  
**When** the user tracks a visit to one of the pubs in that cluster  
**And** the visit is saved successfully  
**Then** the unvisited cluster count decreases to "9"  
**And** a new visited cluster appears or existing visited cluster count increases  
**And** the marker for the visited pub is now in the visited cluster  
**And** the update happens without full page reload

#### Scenario: Update Clusters After Logout
**Given** the user is authenticated  
**And** the map shows both green (visited) and red (unvisited) clusters  
**When** the user logs out  
**Then** all visited clusters disappear  
**And** all markers merge into unvisited (red) clusters  
**And** cluster counts update to reflect all pubs as unvisited  
**And** visit status is no longer indicated in clustering

---

### Requirement: Cluster Filter Integration (REQ-MC-004)
**Priority:** MUST  
**Category:** Functional

**Acceptance Criteria:**
- Closed pubs toggle affects which markers are included in clusters
- When closed pubs are hidden, only open pubs are clustered
- When closed pubs are shown, both open and closed pubs are clustered
- Cluster counts accurately reflect only visible pubs
- Filter changes trigger immediate cluster recalculation
- Cluster styling does not differentiate between open/closed state (only visited/unvisited)

#### Scenario: Hide Closed Pubs Updates Clusters
**Given** the map shows clusters including both open and closed pubs  
**And** a cluster shows "20" pubs (15 open, 5 closed)  
**When** the user toggles "Hide Closed Pubs"  
**Then** the cluster count updates to "15"  
**And** only open pubs are included in the cluster  
**And** closed pub markers are removed from the map and clusters

#### Scenario: Show Closed Pubs Updates Clusters
**Given** closed pubs are hidden  
**And** a cluster shows "15" pubs (all open)  
**When** the user toggles to show closed pubs  
**Then** the cluster count increases to include closed pubs  
**And** closed pub markers are added to the appropriate clusters based on visit status  
**And** the cluster may split or merge based on new marker positions

---

### Requirement: Cluster Performance (REQ-MC-005)
**Priority:** MUST  
**Category:** Performance

**Acceptance Criteria:**
- Clustering reduces marker count when zoomed out (expected 1000 markers → 20-50 clusters)
- Map rendering remains smooth at all zoom levels (60 fps target)
- Zoom in/out animations are fluid without lag
- Cluster updates on visit tracking complete within 500ms
- Memory usage increase from two clusterers is negligible (< 5MB)
- Clustering works smoothly on mobile devices
- No performance degradation compared to current unclustered implementation

#### Scenario: Smooth Performance with Full Dataset
**Given** the map has loaded all ~1000 pub markers  
**And** the user is at zoom level 6  
**When** the clustering is applied  
**Then** fewer than 100 clusters are rendered  
**And** map panning remains smooth at 60 fps  
**And** zooming in/out animations are fluid  
**And** no frame drops or stuttering occurs

#### Scenario: Fast Visit Update Performance
**Given** the user tracks a visit to a pub  
**When** the visit is saved  
**And** clusters need to be updated  
**Then** the cluster update completes within 500ms  
**And** the UI remains responsive during the update  
**And** no loading spinner is required

#### Scenario: Mobile Device Performance
**Given** the user is on a mid-range mobile device  
**And** the map displays clusters at zoom level 8  
**When** the user pans and zooms the map  
**Then** clustering remains performant  
**And** touch interactions are responsive  
**And** zoom animations are smooth

---

### Requirement: Cluster Library Integration (REQ-MC-006)
**Priority:** MUST  
**Category:** Technical

**Acceptance Criteria:**
- `@googlemaps/markerclusterer` package is added to dependencies
- Library is imported and initialized in PubLocationsMap.vue
- Two MarkerClusterer instances are created (visited and unvisited)
- Clusterers are properly disposed when component unmounts
- Clusterers use Advanced Marker API (compatible with existing markers)
- Custom renderers are implemented for visited/unvisited cluster styling
- Algorithm options are configured (maxZoom: 12)

#### Scenario: Initialize Clusterers on Map Load
**Given** the map component is mounted  
**And** Google Maps libraries are loaded  
**When** pub data is fetched  
**And** markers are created  
**Then** two MarkerClusterer instances are initialized  
**And** visited markers are added to visited clusterer  
**And** unvisited markers are added to unvisited clusterer  
**And** both clusterers are bound to the map instance

#### Scenario: Custom Renderer for Cluster Styling
**Given** MarkerClusterer is initialized  
**When** a cluster is rendered  
**Then** the custom renderer function is called  
**And** the renderer returns a styled cluster marker  
**And** visited clusters use green background (#34a853)  
**And** unvisited clusters use red background (#ea4335)  
**And** cluster counts are displayed in white text

#### Scenario: Cleanup on Component Unmount
**Given** the map component is mounted with active clusterers  
**When** the component is unmounted  
**Then** both clusterers are properly disposed  
**And** marker references are cleared  
**And** no memory leaks occur
