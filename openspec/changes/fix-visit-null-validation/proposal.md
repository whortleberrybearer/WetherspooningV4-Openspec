# Change: Fix Visit Null Value Validation

## Why
Visit documents in Firestore are being logged as invalid with errors like "Invalid visit document LnvLma1TjGbumslmPZNT: rating must be between 1 and 5" when rating or notes fields are `null`. This occurs because:
1. The validation logic in `validateVisit()` rejects `null` values for optional fields
2. The UI and update operations explicitly set rating and notes to `null` when users clear these fields
3. Firestore stores `null` for fields that are cleared, creating a mismatch between what's written and what's considered valid when reading

This causes data integrity issues where valid user actions (clearing a rating or notes) result in invalid documents that fail validation on subsequent loads.

## What Changes
- **MODIFIED**: Update `validateVisit()` to accept `null` values for optional fields (rating, notes, visitedAt)
- **MODIFIED**: Normalize `null` to `undefined` when loading visits from Firestore to maintain consistent in-memory representation
- **MODIFIED**: Update Firestore rules to validate rating range (1-5) when present
- **MODIFIED**: Ensure UI components handle both `null` and `undefined` gracefully without breaking
- **ADDED**: Document that optional visit fields should be treated as `undefined` in TypeScript interfaces, with `null` only for Firestore compatibility

## Impact
- **Affected specs**: `pub-visit-data`
- **Affected code**:
  - `Wetherspooning/src/services/firebaseDataService.ts` - validation and conversion logic
  - `firestore.rules` - add rating range validation
  - `Wetherspooning/src/components/PubDetailSheet.vue` - ensure null-safe handling
  - `Wetherspooning/src/views/PubLocationsMap.vue` - ensure null-safe display of rating/notes
  - `Wetherspooning/src/composables/useVisits.ts` - null handling in updateVisit

## Migration
No data migration required. Existing `null` values in Firestore will be automatically normalized to `undefined` when loaded into application memory.
