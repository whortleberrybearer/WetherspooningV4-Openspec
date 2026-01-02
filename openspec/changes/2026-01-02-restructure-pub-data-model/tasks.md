# Implementation Tasks

## Phase 1: Update Type Definitions and Interfaces

- [ ] Update `Pub` interface in `Wetherspooning/src/services/firebaseDataService.ts`
  - Change `id: number` to `id: string`
  - Remove `lat: number` and `lng: number`
  - Add `position: { lat: number, lng: number } | null`
  - Update JSDoc comments to reflect new structure

- [ ] Update `Pub` interface in `Wetherspooning/src/composables/useVisits.ts`
  - Apply same changes as firebaseDataService.ts
  - Ensure consistency across both definitions

- [ ] Update `Visit` interface in `Wetherspooning/src/services/firebaseDataService.ts`
  - Change `pubId: number` to `pubId: string`
  - Update JSDoc comments

- [ ] Update domain context in `openspec/project.md`
  - Update Pub entity definition to reflect new structure
  - Update Visit entity pubId type

## Phase 2: Update Validation Logic

- [ ] Update `validatePub()` function in `firebaseDataService.ts`
  - Remove `lat` and `lng` from required fields check
  - Add validation for optional `position` field
  - Validate `position` is object with `lat` and `lng` when present
  - Validate `lat` is between -90 and 90
  - Validate `lng` is between -180 and 180
  - Reject partial position (only lat or only lng)
  - Accept string-based `id` field
  - Update error messages for new structure

- [ ] Update `getPubById()` function signature
  - Change parameter type from `number` to `string`
  - Update Firestore query to use string-based ID

## Phase 3: Update Map Rendering Logic

- [ ] Update `PubLocationsMap.vue` - marker filtering
  - Add filter to exclude pubs without position before marker creation
  - Filter: `pubs.filter(pub => pub.position !== null)`
  - Apply filter to both regular markers and clustered markers

- [ ] Update `PubLocationsMap.vue` - marker creation
  - Change all `pub.lat` to `pub.position.lat`
  - Change all `pub.lng` to `pub.position.lng`
  - Add TypeScript type guard or assertion for position access

- [ ] Update `PubLocationsMap.vue` - proximity detection
  - Add null check before distance calculation: `if (!pub.position) continue`
  - Update distance calculation to use `pub.position.lat` and `pub.position.lng`
  - Update `checkProximity()` function to guard against null position

- [ ] Update `PubLocationsMap.vue` - info window logic
  - Update selected pub logic to work with GUID-based IDs
  - Update any position comparisons to use nested structure

- [ ] Update distance calculation helper function
  - Add guard: `if (!pub.position) return null`
  - Extract lat/lng from `pub.position`
  - Handle null return value in callers

## Phase 4: Update Visit Tracking Logic

- [ ] Update `useVisits.ts` composable - type definitions
  - Update `visitedPubIds` Set to use `Set<string>` instead of `Set<number>`
  - Update all function signatures to accept `string` for pubId

- [ ] Update `useVisits.ts` - query logic
  - Update Firestore queries to filter by string-based pubId
  - Ensure Set operations use string comparison

- [ ] Update `useVisits.ts` - mutation functions
  - Update `addVisit(pubId: string, ...)` signature
  - Update `updateVisit(pubId: string, ...)` signature
  - Update `removeVisit(pubId: string)` signature
  - Update `isVisited(pubId: string)` signature
  - Update `getVisitDate(pubId: string)` signature
  - Update all Firestore write operations to use string pubId

- [ ] Update all components that call visit functions
  - Update function calls to pass string pub IDs
  - Search for `addVisit(`, `updateVisit(`, `removeVisit(` calls

## Phase 5: Update Data Generation Scripts

- [ ] Update `scripts/generatePubsData.js`
  - Import crypto module: `const crypto = require('crypto')`
  - Change `id` generation from `pubId++` to `crypto.randomUUID()`
  - Change coordinate structure from `lat:`, `lng:` to `position: { lat, lng }`
  - Add logic to randomly set `position: null` for some pubs (e.g., 5-10%)
  - Update comments to reflect new structure

- [ ] Update `scripts/seedEmulator.js` (if exists)
  - Apply same changes as generatePubsData.js
  - Ensure test data includes pubs with and without position

- [ ] Update `scripts/migrateToFirestore.ts` (if exists)
  - Transform legacy data structure to new format
  - Generate GUIDs for existing numeric IDs
  - Nest lat/lng under position

## Phase 6: Update Sample Data

- [ ] Update `data/pubs-sample.json`
  - Regenerate using updated generatePubsData.js script
  - Verify mix of positioned and non-positioned pubs
  - Verify GUID format for IDs
  - Verify nested position structure

- [ ] Create backup of old sample data
  - Copy current pubs-sample.json to pubs-sample.json.bak (already exists, update if needed)

## Phase 7: Type Safety and Error Handling

- [ ] Add TypeScript null checks for position access
  - Use optional chaining: `pub.position?.lat`
  - Add type guards where needed
  - Ensure no TypeScript errors

- [ ] Update error messages and logging
  - Log when pubs are excluded due to missing position (debug level)
  - Update validation error messages for new structure
  - Ensure informative errors for partial position data

## Phase 8: Testing and Validation

- [ ] Generate new test data
  - Run `node scripts/generatePubsData.js`
  - Verify output structure in pubs-sample.json

- [ ] Test map rendering
  - Start Firebase emulator with new data
  - Verify positioned pubs appear on map
  - Verify pubs without position do not appear on map
  - Verify no console errors for pubs without position

- [ ] Test sidebar display
  - Verify all pubs (with and without position) appear in sidebar
  - Verify counts are correct
  - Verify sorting works correctly

- [ ] Test visit tracking
  - Create visit for pub with GUID ID
  - Update visit with string-based pub ID
  - Remove visit with string-based pub ID
  - Verify isVisited works with string IDs

- [ ] Test proximity detection
  - Verify proximity checks skip pubs without position
  - Verify positioned pubs trigger prompts correctly
  - Verify no errors when encountering pubs without position

- [ ] Run TypeScript compiler
  - Verify no type errors: `npm run type-check` or `tsc --noEmit`

- [ ] Test clustering
  - Verify marker clustering works with positioned pubs
  - Verify clusters only include positioned pubs

## Phase 9: Documentation

- [ ] Update README if needed
  - Document new Pub data structure
  - Add notes about optional position field
  - Document GUID-based IDs

- [ ] Update any API documentation or comments
  - Ensure all JSDoc comments reflect new types
  - Update inline comments for position access

## Phase 10: Validation and Cleanup

- [ ] Search for any remaining numeric pub ID references
  - `rg "pub\.id.*number" Wetherspooning/src`
  - `rg "pubId.*number" Wetherspooning/src`

- [ ] Search for any remaining direct lat/lng access
  - `rg "pub\.lat" Wetherspooning/src`
  - `rg "pub\.lng" Wetherspooning/src`

- [ ] Verify all validation scenarios from spec deltas
  - Test null position handling
  - Test invalid position structures
  - Test GUID-based queries
  - Test partial position rejection

- [ ] Run full application smoke test
  - Navigate through all pages
  - Verify all features work
  - Check console for errors or warnings
