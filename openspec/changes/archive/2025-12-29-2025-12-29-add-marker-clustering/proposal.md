# Proposal: Add Marker Clustering

## Overview
Add marker clustering to the pub locations map to improve visualization and performance when many pub markers are close together. Implement separate clusters for visited and non-visited pubs to maintain visual distinction and help users quickly identify areas with pubs they haven't visited yet.

## Background
Currently, the map displays individual markers for each pub, which creates visual clutter when many pubs are located close together (e.g., in city centers). Users have difficulty distinguishing individual pubs when markers overlap, making it hard to interact with specific locations. Additionally, rendering all markers simultaneously can impact performance with the full dataset.

The current implementation differentiates markers based on four states:
- Unvisited + Open: Red (#ea4335) at 100% opacity
- Unvisited + Closed: Gray (#9ca3af) at 60% opacity  
- Visited + Open: Green (#34a853) at 100% opacity
- Visited + Closed: Blue (#4285f4) at 60% opacity

This visual distinction is important for user experience and should be preserved in the clustering solution.

## Problem Statement
1. **Visual Clutter**: When zoomed out or viewing dense urban areas, markers overlap making individual pubs difficult to select
2. **Performance**: Rendering hundreds of individual markers can cause performance issues
3. **Visit Status Visibility**: Users cannot quickly see areas with many unvisited pubs when markers are clustered together without distinction

## Proposed Solution
Implement marker clustering using the `@googlemaps/markerclusterer` library with two separate clusterers:

1. **Visited Pubs Clusterer**: Groups visited pubs (green/blue markers) with distinct styling
2. **Unvisited Pubs Clusterer**: Groups unvisited pubs (red/gray markers) with distinct styling

This approach maintains the visual distinction between visited and unvisited pubs at all zoom levels while solving the overlap and performance issues.

### Key Features
- Automatic marker grouping based on proximity and zoom level
- Separate clusters for visited vs unvisited pubs
- Custom cluster styling that reflects the pub state (visited/unvisited)
- Cluster numbers showing count of pubs in each cluster
- Smooth animation when zooming in/out
- Individual markers appear at appropriate zoom levels (zoom ≥ 13)
- Clusters clickable to zoom into the area

## User Impact
**Positive:**
- Cleaner, less cluttered map interface
- Easier to navigate dense areas with many pubs
- Better performance with large datasets
- Quick visual identification of areas with unvisited pubs
- Improved mobile experience with better tap targets

**Neutral:**
- Users will need to zoom in more to see individual markers in dense areas
- Adds slight learning curve for understanding cluster behavior

## Technical Considerations
- Requires adding `@googlemaps/markerclusterer` package dependency
- Compatible with existing Google Maps Advanced Markers implementation
- Need to maintain current 4-state marker differentiation
- Clustering logic must respect the visited/unvisited separation
- Should work seamlessly with authentication state changes

## Alternatives Considered
1. **Single clusterer with mixed markers**: Would lose visual distinction between visited/unvisited areas
2. **No clustering**: Maintains current clutter and performance issues  
3. **Server-side clustering**: Added complexity and requires backend changes
4. **Custom clustering algorithm**: Unnecessary reinvention when proven library exists

## Dependencies
- Requires `@googlemaps/markerclusterer` package installation
- Depends on existing pub-locations-map and pub-visit-data specs
- Works with current authentication and visit tracking functionality

## Success Criteria
- Map displays clusters when multiple markers are close together
- Visited and unvisited pubs cluster separately with distinct styling
- Individual markers visible at zoom level 13 or higher
- Cluster numbers accurately reflect count of contained pubs
- No degradation in map performance
- Seamless integration with visit tracking updates
- All existing marker functionality preserved (click, info window, etc.)

## Open Questions
1. Should cluster size/distance threshold be configurable?
2. What exact zoom level threshold should trigger individual markers?
3. Should clusters display additional info on hover (e.g., pub names)?
4. Should closed pubs within a cluster be indicated in the cluster badge?
