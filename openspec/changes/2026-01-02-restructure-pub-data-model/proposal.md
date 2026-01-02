# Restructure Pub Data Model

**Change ID:** `2026-01-02-restructure-pub-data-model`  
**Status:** Proposed  
**Created:** 2026-01-02

## Why

The current pub data model has structural limitations that hinder flexibility and data management:

1. **Location coupling:** Pubs are required to have `lat` and `lng` fields, but some pubs (temporarily closed, under construction, or with data unavailable) cannot have location data. These pubs should still appear in sidebar navigation for completeness.

2. **Flat position structure:** Coordinates are stored as separate top-level properties (`lat`, `lng`) rather than grouped, making their relationship unclear and allowing partial data (lat without lng or vice versa).

3. **Non-unique identifiers:** Sequential integer IDs create collision risks during data imports, testing, and multi-source synchronization. Global uniqueness is needed for scalable data management.

Restructuring the data model will enable more flexible pub data management and prepare the system for future enhancements.

## Problem Statement

The current pub data model has several structural issues:

1. **Location coupling:** Pubs must have `lat` and `lng` fields defined, but some pubs (e.g., temporarily closed, under construction, or data unavailable) may not have location data yet should still appear in the sidebar navigation.

2. **Flat position structure:** Location coordinates (`lat`, `lng`) are stored as top-level properties rather than being grouped under a `position` object, making it unclear that they form a logical unit.

3. **Non-unique identifiers:** Pub IDs use sequential integers which can lead to collisions during data imports, testing, and multi-source synchronization. GUIDs would provide globally unique, collision-free identifiers.

These issues limit flexibility in pub data management and create unnecessary validation requirements.

## Proposed Solution

Restructure the Pub data model to:

1. **Make location optional:** Allow pubs to exist without position data. Pubs without location will appear in sidebar navigation but not on the map.

2. **Nest position properties:** Group `lat` and `lng` under a `position` object for clearer data modeling: `position: { lat: number, lng: number } | null`

3. **Use GUID identifiers:** Replace integer `id` with string-based GUID for globally unique, collision-resistant identifiers.

## Scope

### Affected Capabilities
- `firebase-data-integration` - Pub interface and validation
- `pub-locations-map` - Map marker rendering and filtering
- `pub-navigation-sidebar` - Pub listing (already handles pubs without locations correctly)
- `pub-visit-data` - Visit tracking with pub IDs
- `proximity-visit-prompt` - Location-based visit prompts

### Out of Scope
- User interface changes (sidebar already supports pubs without visual changes needed)
- Migration of existing production data (migration strategy to be planned separately)
- Changes to Visit data model beyond pubId type change

## Impact Assessment

### Breaking Changes
- **Pub interface:** `id` type changes from `number` to `string`
- **Pub interface:** `lat` and `lng` removed as top-level properties, replaced by `position: { lat: number, lng: number } | null`
- **All pub queries:** Code referencing `pub.lat`, `pub.lng`, `pub.id` must be updated
- **Visit interface:** `pubId` type changes from `number` to `string`
- **Firestore schema:** Pub documents must be migrated to new structure
- **Data generation scripts:** Must generate GUIDs and nested position structure

### Non-Breaking Changes
- Sidebar navigation continues to display all pubs (already sorted alphabetically regardless of location)
- Map rendering logic already filters pubs (will now filter based on presence of `position`)

## Migration Strategy

1. Update TypeScript interfaces and validation logic
2. Update all code references to use `pub.position?.lat`, `pub.position?.lng`, and GUID-based `pub.id`
3. Update data generation scripts to produce new structure
4. Test with emulator data using new structure
5. Plan production data migration (separate task, out of scope for this change)

## Dependencies

None - this is a foundational data model change.

## Success Criteria

- [ ] Pubs can be created without `position` field
- [ ] Pubs without position appear in sidebar but not on map
- [ ] All pub IDs are GUIDs (string format)
- [ ] Position data is accessed via `pub.position.lat` and `pub.position.lng`
- [ ] All existing functionality works with new data model
- [ ] Data generation scripts produce correctly structured data
- [ ] No TypeScript errors across codebase
- [ ] All validation tests pass with new structure
