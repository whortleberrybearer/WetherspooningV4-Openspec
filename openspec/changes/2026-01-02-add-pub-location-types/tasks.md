# Implementation Tasks

**Change ID:** `2026-01-02-add-pub-location-types`

## Task Breakdown

### 1. Update Pub Data Model
- [x] Add `isHotel?: boolean` property to Pub interface in `firebaseDataService.ts`
- [x] Add `inAirport?: boolean` property to Pub interface
- [x] Add `inTrainStation?: boolean` property to Pub interface
- [x] Add JSDoc comments explaining each property
- [x] Verify TypeScript compilation succeeds with no errors

### 2. Update Sample Data with Location Types
- [x] Update `pubs-sample.json` with location type properties
- [x] Add 2-3 examples with `isHotel: true` (e.g., London hotel pubs)
- [x] Add 2-3 examples with `inAirport: true` (e.g., Heathrow, Gatwick)
- [x] Add 2-3 examples with `inTrainStation: true` (e.g., major station pubs)
- [x] Ensure no pub has multiple location type flags set to true
- [x] Verify JSON format is valid
- [x] Copy updated file to `Wetherspooning/public/data/pubs-sample.json`

### 3. Display Location Type Badges in InfoWindow
- [x] Modify InfoWindow content generation in `PubLocationsMap.vue`
- [x] Add location type badge rendering logic after status and visit badges
- [x] Use badge style: "Hotel" (orange/amber), "Airport" (blue), "Train Station" (purple/violet)
- [x] Ensure badges display in `iw-badges` flex container
- [x] Add CSS styles for location type badges matching existing badge patterns
- [x] Test with sample data showing different location types
- [x] Verify badges display correctly on mobile and desktop
- [x] Ensure theme toggle affects badge colors appropriately

### 4. Update Firestore Seed Scripts
- [x] Update `seedEmulator.js` to include location type properties when seeding pubs
- [x] Verify seed script runs without errors
- [x] Check Firebase Emulator UI to confirm location type data is stored correctly
- [x] Ensure existing pub data migration handles new optional properties

### 5. Add Data Validation (Optional Enhancement)
- [ ] Add validation logic to ensure only one location type flag can be true
- [ ] Implement in data loading/parsing functions
- [ ] Consider adding console warning if multiple flags are detected
- [ ] Document validation behavior in code comments

## Parallel Work Opportunities

- Tasks 2 (sample data) and 3 (UI display) can be developed in parallel after Task 1 completes
- Task 4 (seed scripts) can proceed in parallel with Task 3

## Testing Strategy

1. **TypeScript validation:** Run `npm run type-check` after data model changes
2. **Visual testing:** Manually test InfoWindow display with different location types
3. **Theme compatibility:** Verify badges work in both light and dark themes
4. **Mobile responsiveness:** Test badge layout on mobile viewport sizes
5. **Data integrity:** Verify Firestore contains correct location type data after seeding

## Rollback Plan

If issues arise:
1. The change is non-breaking due to optional properties
2. Revert commits in reverse task order
3. Existing functionality will continue to work without location type data
4. Remove location type badges from InfoWindow rendering as first mitigation step
