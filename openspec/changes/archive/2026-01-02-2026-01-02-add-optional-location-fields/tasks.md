# Implementation Tasks

**Change ID:** `2026-01-02-add-optional-location-fields`

## Task Breakdown

### Phase 1: Update Type Definitions

- [x] Update `Pub` interface in `Wetherspooning/src/services/firebaseDataService.ts`
  - Change `country: string` to `country?: string`
  - Change `region: string` to `region?: string`
  - Update JSDoc comments to note fields are optional

- [x] Update `Pub` interface in `Wetherspooning/src/composables/useVisits.ts`
  - Apply same changes as firebaseDataService.ts
  - Ensure consistency across both definitions

- [x] Update component-local Pub interfaces
  - Update `PubDetailSheet.vue` interface
  - Update `PubSidebar.vue` interface
  - Update `AppSidebar.vue` interface

### Phase 2: Update Validation Logic

- [x] Update `validatePub()` function in `firebaseDataService.ts`
  - Remove `country` from required fields array
  - Remove `region` from required fields array
  - Keep other required fields: id, name, townCity, address, county
  - Update validation comments

### Phase 3: Add Display Helper Logic

- [x] Create display helper function or use inline fallback
  - Option 1: Add `getDisplayValue(value: string | undefined | null): string` helper
  - Option 2: Use inline `pub.country || 'Unknown'` pattern
  - Decision: Use inline pattern for simplicity
  - Document pattern in code comments

### Phase 4: Update UI Components

- [x] Update `PubLocationsMap.vue` info window display
  - Change country display to `${pub.country || 'Unknown'}`
  - Change region display to `${pub.region || 'Unknown'}`
  - Test with pubs missing country/region

- [x] Update `PubSidebar.vue` pub list display
  - Apply same fallback pattern for country/region display
  - Verify list rendering with missing values

- [x] Update `AppSidebar.vue` pub list display
  - Apply same fallback pattern for country/region display
  - Verify list rendering with missing values

- [x] Update `PubDetailSheet.vue` pub detail display
  - Apply same fallback pattern for country/region display
  - Test detail sheet with missing values

### Phase 5: Update Data Generation

- [x] Update `scripts/generatePubsData.js`
  - Add 10-15% chance to omit country field
  - Add 10-15% chance to omit region field
  - Can omit both independently
  - Update comments to document optional fields

- [x] Regenerate sample data
  - Run `node scripts/generatePubsData.js`
  - Verify output has mix of complete and partial location data
  - Verify JSON structure is valid

### Phase 6: Testing and Validation

- [x] Test UI with missing country
  - Verify "Unknown" displays in info window
  - Verify "Unknown" displays in sidebar
  - Verify "Unknown" displays in detail sheet

- [x] Test UI with missing region
  - Verify "Unknown" displays in all components
  - Verify consistent formatting

- [x] Test UI with both fields missing
  - Verify both show "Unknown"
  - Verify no rendering errors

- [x] Test TypeScript compilation
  - Run `npm run type-check` or `tsc --noEmit`
  - Verify no type errors

### Phase 7: Documentation

- [x] Update README if needed
  - Note that country and region are optional
  - Document "Unknown" display behavior

- [x] Update inline code comments
  - Document optional field handling
  - Note fallback display pattern

## Testing Strategy

1. **Type validation:** Run TypeScript compiler to ensure optional fields work
2. **Visual testing:** Test each UI component with missing country/region
3. **Data generation:** Verify script produces valid mix of complete/partial data
4. **Edge cases:** Test with null, undefined, and empty string values

## Rollback Plan

If issues arise:
1. Revert type definitions (make fields required again)
2. Revert validation logic
3. Revert UI display changes
4. Regenerate sample data with all fields
