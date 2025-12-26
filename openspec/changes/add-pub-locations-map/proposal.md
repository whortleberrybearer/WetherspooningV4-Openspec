# Change Proposal: Add Pub Locations Map

**Change ID:** `add-pub-locations-map`  
**Status:** Implemented  
**Created:** 2025-12-26  
**Completed:** 2025-12-26  
**Author:** AI Assistant

## Problem Statement

Users need a visual way to see the geographic distribution of Wetherspoons pubs across the UK. Currently, there's no map-based visualization to help users:
- Discover pubs near their location
- Plan visits to multiple pubs in an area
- Get a geographic overview of all Wetherspoons locations

## Proposed Solution

Create an interactive Google Maps-based view that displays all Wetherspoons pub locations as markers on a map. The map will serve as the home page of the application. The initial implementation will:
- Load pub location data from a sample JSON file
- Display each pub as a marker on Google Maps
- Show basic pub information when a marker is clicked
- Provide a mobile-first responsive design

## Benefits

- **User Experience:** Visual discovery of pubs is more intuitive than text listings
- **Trip Planning:** Users can easily identify pubs in specific geographic areas
- **Engagement:** Interactive maps increase user interaction and exploration

## Impact Assessment

### User Impact
- **Who:** All users looking for Wetherspoons locations
- **What Changes:** New map view available alongside existing features
- **Migration:** No migration needed (new feature)

### Technical Impact
- **New Dependencies:** Google Maps JavaScript API
- **Data Requirements:** Sample JSON file with pub locations (Lat/Lng coordinates)
- **Performance:** Initial load will fetch all pub data; may need optimization for scale

### Breaking Changes
None - this is a new capability

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Google Maps API costs | Medium | Monitor usage, implement request limits |
| Missing location data | Low | Ensure sample data includes all required fields |
| Mobile performance | Medium | Implement lazy loading, optimize marker rendering |

## Alternatives Considered

1. **OpenStreetMap/Leaflet:** Free alternative, but less familiar to users
2. **Static map images:** Simpler but less interactive
3. **List view only:** Current state, less engaging

Chose Google Maps for familiarity and feature richness.

## Dependencies

- Google Maps JavaScript API key required
- Sample JSON data file with pub locations

## Success Criteria

- Map loads and displays all pubs from sample data
- Markers are clickable and show pub information
- Responsive design works on mobile and desktop
- Page load time under 3 seconds

## Timeline Estimate

- Spec creation: 1 day
- Implementation: 2-3 days
- Testing: 1 day
- Total: 4-5 days
