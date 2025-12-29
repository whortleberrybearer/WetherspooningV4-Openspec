# Design: Add Marker Clustering

## Architectural Overview
This change adds marker clustering functionality to the pub locations map using Google Maps MarkerClusterer. The key architectural decision is to implement **two separate clusterers** - one for visited pubs and one for unvisited pubs - to maintain visual distinction that helps users quickly identify areas with pubs they haven't visited.

## Core Design Decisions

### 1. Dual Clusterer Architecture
**Decision**: Use two separate `MarkerClusterer` instances rather than a single clusterer.

**Rationale**:
- Preserves the important visited/unvisited visual distinction at all zoom levels
- Allows different cluster styling for visited vs unvisited pub groups
- Users can quickly scan the map to find areas with unvisited pubs
- Maintains consistency with existing 4-state marker paradigm

**Trade-offs**:
- Slightly more memory usage (two clusterer instances vs one)
- Additional logic to manage two clusterers
- BENEFIT: Clear UX that aligns with core user goal (finding unvisited pubs)

### 2. Library Selection: @googlemaps/markerclusterer
**Decision**: Use the official Google Maps MarkerClusterer library.

**Rationale**:
- Official Google Maps library with active maintenance
- Native support for Advanced Markers (used in current implementation)
- Well-documented API and proven reliability
- Battle-tested performance optimizations
- Straightforward integration with existing code

**Alternatives Considered**:
- Custom clustering: Unnecessary complexity, wheel reinvention
- Alternative libraries (supercluster): Require additional adapter code for Google Maps

### 3. Marker Separation Logic
**Decision**: Separate markers into visited/unvisited arrays based on `isVisited()` check before creating clusterers.

**Implementation**:
```typescript
const visitedMarkers = markers.value.filter(marker => {
  // Find corresponding pub and check visit status
  const pub = findPubForMarker(marker)
  return pub && isVisited(pub.id)
})

const unvisitedMarkers = markers.value.filter(marker => {
  const pub = findPubForMarker(marker)
  return pub && !isVisited(pub.id)
})

// Create two clusterers
visitedClusterer = new MarkerClusterer({
  map: map.value,
  markers: visitedMarkers,
  renderer: visitedRenderer
})

unvisitedClusterer = new MarkerClusterer({
  map: map.value,
  markers: unvisitedMarkers,
  renderer: unvisitedRenderer
})
```

### 4. Cluster Styling Strategy
**Decision**: Use custom renderers for each clusterer with distinct visual styles.

**Visited Cluster Style**:
- Background: Green (#34a853) - matches visited+open marker color
- Text: White
- Border: 2px white with shadow
- Indicates "area with visited pubs"

**Unvisited Cluster Style**:
- Background: Red (#ea4335) - matches unvisited+open marker color  
- Text: White
- Border: 2px white with shadow
- Indicates "area with unvisited pubs"

**Rationale**: Uses the primary state colors (green for visited, red for unvisited) so users can quickly understand cluster meaning without learning new visual language.

### 5. Zoom Threshold Configuration
**Decision**: Set minimum cluster size and zoom thresholds via MarkerClusterer options.

**Configuration**:
```typescript
{
  algorithmOptions: {
    maxZoom: 12  // Show individual markers at zoom >= 13
  }
}
```

**Rationale**:
- Zoom level 13 provides good balance: clusters for overview, individuals for detail
- Aligns with typical "neighborhood view" zoom where individual pubs are useful
- Can be adjusted based on user feedback without code changes

### 6. Clusterer Lifecycle Management
**Decision**: Clear and recreate clusterers whenever markers change (visits update, auth state changes, filter changes).

**Rationale**:
- MarkerClusterer API provides `clearMarkers()` and `addMarkers()` methods
- Simplifies logic compared to incremental updates
- Visit status changes require re-separation anyway
- Performance impact negligible with current dataset size

**Implementation Pattern**:
```typescript
const updateClusters = () => {
  // Clear existing clusterers
  visitedClusterer?.clearMarkers()
  unvisitedClusterer?.clearMarkers()
  
  // Re-separate markers based on current visit status
  const { visited, unvisited } = separateMarkers()
  
  // Update clusterers with new marker sets
  visitedClusterer?.addMarkers(visited)
  unvisitedClusterer?.addMarkers(unvisited)
}

// Call on relevant changes
watch([visitedPubIds, visits, filteredPubsForMap], updateClusters)
```

## Component Integration Points

### Existing Components Affected
1. **PubLocationsMap.vue**:
   - Import MarkerClusterer library
   - Add clusterer state variables (2 clusterers)
   - Modify `createMarkers()` to set up clusterers
   - Add `updateClusters()` function called on visit/auth changes
   - Update watchers to trigger cluster updates

2. **No changes required** to:
   - AppSidebar.vue
   - PubDetailSheet.vue
   - useVisits.ts
   - useAuth.ts

### State Management
New reactive state:
```typescript
const visitedClusterer = shallowRef<MarkerClusterer | null>(null)
const unvisitedClusterer = shallowRef<MarkerClusterer | null>(null)
```

Existing state remains unchanged; clusterers consume existing marker arrays.

## Data Flow

1. **Initial Load**:
   ```
   loadPubs() → createMarkers() → separateMarkers() → createClusters()
   ```

2. **Visit Status Change**:
   ```
   User logs in → loadVisits() → watch triggers → updateClusters()
   User tracks visit → visits updated → watch triggers → updateClusters()
   ```

3. **Filter Change**:
   ```
   Toggle closed pubs → filteredPubsForMap updates → watch triggers → createMarkers() → updateClusters()
   ```

## Performance Considerations

1. **Memory**: 
   - Two clusterers instead of one: ~2x clustering overhead
   - Negligible given current dataset size (~1000 pubs max)
   
2. **Rendering**:
   - Clusterer reduces marker count when zoomed out
   - Expected improvement: 1000 markers → ~20-50 clusters (depends on zoom)
   - Significant performance gain on lower-end devices

3. **Update Frequency**:
   - Cluster updates only on visit changes, auth changes, filter changes
   - Not continuous/high-frequency updates
   - Acceptable performance impact

## Error Handling

1. **Library Load Failure**:
   - Graceful degradation: show all markers without clustering
   - Log error to console
   - Map remains functional

2. **Marker Separation Issues**:
   - Validate pub exists for each marker before categorization
   - Default to unvisited category if status unclear
   - Prevent clustering of invalid markers

## Testing Strategy

1. **Visual Testing**:
   - Verify cluster appearance at various zoom levels
   - Confirm visited/unvisited clusters have distinct colors
   - Check cluster counts are accurate

2. **Functional Testing**:
   - Click clusters to zoom in
   - Verify individual markers appear at zoom 13+
   - Test visit status changes update clusters correctly
   - Test auth state changes update clusters correctly

3. **Performance Testing**:
   - Monitor frame rate with full dataset
   - Test on mobile devices
   - Verify smooth zoom animations

## Future Enhancements (Out of Scope)

1. Cluster hover tooltips showing pub names
2. Configurable zoom thresholds via settings
3. Different cluster icons for different pub counts
4. Animation when clusters split/merge
5. Indication of closed pub ratio within clusters

## Migration Plan
This is an additive change with no breaking modifications:
- Existing markers continue to work
- Clustering is layered on top
- No data migration required
- No user settings to preserve
- Can be feature-flagged if needed for gradual rollout
