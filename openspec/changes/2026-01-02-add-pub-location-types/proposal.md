# Proposal: Add Pub Location Types

**Change ID:** `2026-01-02-add-pub-location-types`  
**Status:** Proposed  
**Created:** 2026-01-02

## Problem Statement

Currently, the Wetherspooning application stores and displays pubs with basic location information (address, coordinates, etc.) but does not capture or display the specific type of location where a pub is situated. Wetherspoon pubs can be located in hotels, airports, or train stations, which is valuable context for users when planning visits or understanding the nature of a particular pub location.

Without this information, users cannot:
- Identify pubs in convenient transit locations (airports, train stations)
- Find pubs that are part of hotels
- Filter or search for specific location types
- See at a glance what type of facility a pub is in

## Proposed Solution

Add three boolean properties to the Pub data model to indicate location type:
- `isHotel`: Indicates the pub is located within a hotel
- `inAirport`: Indicates the pub is located in an airport
- `inTrainStation`: Indicates the pub is located in a train station

A pub can have at most one of these properties set to `true`, or none if it's a standard standalone location.

Display these location type indicators in the pub InfoWindow using badge elements alongside existing status (Open/Closed) and visit badges, allowing users to quickly identify special location types when viewing pub details on the map.

## Scope

### In Scope
- Add location type boolean properties to Pub interface
- Update sample data (pubs-sample.json) to include examples of each location type
- Display location type badges in InfoWindow alongside existing badges
- Store and retrieve location type data from Firebase Firestore

### Out of Scope
- Filtering pubs by location type (sidebar or search filters)
- Updating production pub data with actual location types
- Comprehensive location type data for all pubs
- Multiple location types per pub (e.g., hotel in an airport)

## Impact Analysis

### Affected Components
- **Data Model:** Pub interface in firebaseDataService.ts
- **Sample Data:** pubs-sample.json
- **UI Display:** InfoWindow rendering in PubLocationsMap.vue
- **Data Scripts:** Seed scripts that populate Firestore

### Breaking Changes
None. The new properties are optional and default to undefined/false, maintaining backward compatibility with existing data.

### Dependencies
- Depends on existing `enhanced-infowindow-display` spec for badge display patterns
- Depends on existing `firebase-data-integration` spec for data model structure

## Alternatives Considered

1. **Single enum property (`locationType`):** Could use a single string enum (e.g., "hotel" | "airport" | "trainStation" | "standard") instead of three boolean flags. Rejected because booleans are more straightforward for filtering and querying, and the current requirement is mutually exclusive types.

2. **Detailed location metadata object:** Could create a nested object with richer location context (terminal numbers, hotel names, etc.). Rejected as over-engineered for current needs; can be added later if required.

3. **Display in separate section:** Could show location type in dedicated section rather than badges. Rejected because badges provide quick visual recognition consistent with existing status/visit indicators.

## Success Criteria

1. Pub interface includes `isHotel`, `inAirport`, and `inTrainStation` optional boolean properties
2. Sample data includes at least 2-3 examples of each location type
3. InfoWindow displays appropriate badge (e.g., "Hotel", "Airport", "Train Station") when location type is present
4. Location type badges use consistent styling with existing status and visit badges
5. Data validation prevents multiple location types being set for a single pub
6. All existing functionality remains intact (no regressions)

## Open Questions

None at this time.
