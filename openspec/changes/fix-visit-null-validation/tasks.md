# Implementation Tasks

## 1. Update Data Validation and Types

- [x] Modify `validateVisit()` in `firebaseDataService.ts` to accept `null` for optional fields (rating, notes, visitedAt)
- [x] Update `Visit` interface to allow `null | undefined` for rating, notes, and visitedAt fields
- [x] Update `validateVisitMutation()` to accept `null` values correctly
- [x] Ensure rating validation only checks range when value is not `null` and not `undefined`

## 2. Update Firestore Security Rules

- [x] Add rating range validation to `firestore.rules` for visits collection
- [x] Ensure rules accept `null` or number 1-5 for rating field
- [x] Ensure rules accept `null` or string for notes field
- [x] Test rules with Firebase emulator

## 3. Verify UI Null Safety

- [x] Review `PubDetailSheet.vue` to ensure it handles both `null` and `undefined` for rating/notes
- [x] Review `PubLocationsMap.vue` info window rendering to ensure null-safe display
- [x] Confirm `useVisits.ts` composable handles null values correctly in all methods
- [x] Test clearing rating and notes in UI to confirm null handling works

## 4. Testing

- [x] Test creating visit with no rating or notes
- [x] Test clearing rating on existing visit
- [x] Test clearing notes on existing visit
- [x] Test setting rating to valid values (1-5)
- [x] Test that invalid ratings are rejected in UI and validation
- [x] Verify no validation errors appear in console for valid null values
- [x] Test round-trip: save null → reload → verify null persists correctly

## 5. Documentation

- [x] Update code comments to clarify that optional fields can be `null` or `undefined`
- [x] Document in Visit interface that optional fields accept both `null` and `undefined`
- [x] Add JSDoc comments explaining null handling behavior in validation functions
