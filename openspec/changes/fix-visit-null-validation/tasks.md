# Implementation Tasks

## 1. Update Data Validation

- [ ] Modify `validateVisit()` in `firebaseDataService.ts` to accept `null` for optional fields (rating, notes, visitedAt)
- [ ] Update `docToVisit()` to normalize `null` values to `undefined` for rating, notes, and visitedAt fields
- [ ] Ensure rating validation only checks range when value is not `null` and not `undefined`

## 2. Update Firestore Security Rules

- [ ] Add rating range validation to `firestore.rules` for visits collection
- [ ] Ensure rules accept `null` or number 1-5 for rating field
- [ ] Ensure rules accept `null` or string for notes field
- [ ] Test rules with Firebase emulator

## 3. Verify UI Null Safety

- [ ] Review `PubDetailSheet.vue` to ensure it handles both `null` and `undefined` for rating/notes
- [ ] Review `PubLocationsMap.vue` info window rendering to ensure null-safe display
- [ ] Confirm `useVisits.ts` composable handles null values correctly in all methods
- [ ] Test clearing rating and notes in UI to confirm null handling works

## 4. Testing

- [ ] Test creating visit with no rating or notes
- [ ] Test clearing rating on existing visit
- [ ] Test clearing notes on existing visit
- [ ] Test setting rating to valid values (1-5)
- [ ] Test that invalid ratings are rejected in UI and validation
- [ ] Verify no validation errors appear in console for valid null values
- [ ] Test round-trip: save null → reload → verify undefined in memory

## 5. Documentation

- [ ] Update code comments to clarify that `null` in Firestore maps to `undefined` in TypeScript
- [ ] Document in Visit interface that optional fields use `undefined` in app, `null` in database
