# Proposal: Add Location Search

## Change ID
`2026-01-01-add-location-search`

## Status
Proposed

## Overview
Enable users to search for locations using Google Places Autocomplete API and center the map on the selected location. This enhances navigation by allowing users to quickly jump to specific geographic areas to discover nearby Wetherspoon pubs.

## Problem Statement
Currently, users can only navigate the map manually or rely on automatic centering to their current location. There is no way to search for and navigate to specific locations (e.g., cities, addresses, landmarks). This makes it difficult for users to:
- Explore pubs in a specific city or region they plan to visit
- Find pubs near a specific address or landmark
- Navigate to areas where they don't have pubs saved yet

## Proposed Solution
Implement a location search feature using Google Places Autocomplete API that:
1. Displays a search input field in the map UI
2. Provides autocomplete suggestions as users type
3. Centers the map on the selected location with appropriate zoom
4. Maintains existing functionality (user location centering, pub markers, etc.)

## Rationale
- **User Need:** Users frequently want to explore pubs in specific areas they plan to visit
- **Google Places API:** Provides robust, accurate location search with global coverage
- **UX Consistency:** Autocomplete is a familiar pattern for location search
- **Non-Disruptive:** Can be integrated without affecting existing map functionality

## Scope
This change introduces one new capability:
- **location-search**: Search for locations and center the map

## Dependencies
- Google Maps JavaScript API (already in use)
- New dependency: Google Places API (Place Autocomplete)
- Environment variable: `VITE_GOOGLE_MAPS_API_KEY` (already exists)

## Out of Scope
- Reverse geocoding (showing location name based on map position)
- Search history or saved locations
- Filtering pubs by proximity to searched location
- Custom location bookmarks

## Risks & Mitigations
| Risk | Impact | Mitigation |
|------|--------|------------|
| Google Places API quota limits | High | Monitor usage, implement debouncing on autocomplete |
| API key exposure in client | Medium | Already using API key restrictions for Maps API |
| Mobile UI real estate | Medium | Make search collapsible/hideable on mobile |
| Search result disambiguation | Low | Use Places API types to prefer geographic results |

## Success Criteria
- Users can type a location name and see autocomplete suggestions
- Selecting a suggestion centers the map on that location
- Search works for cities, addresses, and landmarks
- Feature is responsive and works on mobile
- No impact on existing map performance
