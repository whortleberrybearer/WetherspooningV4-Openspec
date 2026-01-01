# Implementation Tasks

**Change ID:** `2026-01-02-add-pub-location-types`

## Task Breakdown

### 1. Update Pub Data Model
**Estimated effort:** Small  
**Dependencies:** None  
**Validation:** TypeScript compilation, type checking

- Add `isHotel?: boolean` property to Pub interface in `firebaseDataService.ts`
- Add `inAirport?: boolean` property to Pub interface
- Add `inTrainStation?: boolean` property to Pub interface
- Add JSDoc comments explaining each property
- Verify TypeScript compilation succeeds with no errors

### 2. Update Sample Data with Location Types
**Estimated effort:** Small  
**Dependencies:** Task 1 (data model)  
**Validation:** Manual verification, JSON format validation

- Update `pubs-sample.json` with location type properties
- Add 2-3 examples with `isHotel: true` (e.g., London hotel pubs)
- Add 2-3 examples with `inAirport: true` (e.g., Heathrow, Gatwick)
- Add 2-3 examples with `inTrainStation: true` (e.g., major station pubs)
- Ensure no pub has multiple location type flags set to true
- Verify JSON format is valid
- Copy updated file to `Wetherspooning/public/data/pubs-sample.json`

### 3. Display Location Type Badges in InfoWindow
**Estimated effort:** Medium  
**Dependencies:** Task 1 (data model), Task 2 (sample data)  
**Validation:** Visual testing, manual verification

- Modify InfoWindow content generation in `PubLocationsMap.vue`
- Add location type badge rendering logic after status and visit badges
- Use badge style: "Hotel" (orange/amber), "Airport" (blue), "Train Station" (purple/violet)
- Ensure badges display in `iw-badges` flex container
- Add CSS styles for location type badges matching existing badge patterns
- Test with sample data showing different location types
- Verify badges display correctly on mobile and desktop
- Ensure theme toggle affects badge colors appropriately

### 4. Update Firestore Seed Scripts
**Estimated effort:** Small  
**Dependencies:** Task 1 (data model), Task 2 (sample data)  
**Validation:** Run seed script, verify Firestore data

- Update `seedEmulator.js` to include location type properties when seeding pubs
- Verify seed script runs without errors
- Check Firebase Emulator UI to confirm location type data is stored correctly
- Ensure existing pub data migration handles new optional properties

### 5. Add Data Validation (Optional Enhancement)
**Estimated effort:** Small  
**Dependencies:** Task 1 (data model)  
**Validation:** Unit tests (if implemented)

- Add validation logic to ensure only one location type flag can be true
- Implement in data loading/parsing functions
- Consider adding console warning if multiple flags are detected
- Document validation behavior in code comments

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
