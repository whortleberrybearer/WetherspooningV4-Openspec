# Implementation Tasks

## 1. Type Definitions
- [ ] 1.1 Add `countyOverride?: string` field to Pub interface in `functions/src/types/pub.ts`
- [ ] 1.2 Add `townCityOverride?: string` field to Pub interface in `functions/src/types/pub.ts`
- [ ] 1.3 Verify ScrapedPubData interface does NOT include override fields (scraper should not set them)

## 2. Data Retrieval with Override Application
- [ ] 2.1 Create helper function `applyOverrides(pub: Pub): Pub` in `functions/src/callable/getPubs.ts`
- [ ] 2.2 Implement override merge logic: `county: pub.countyOverride ?? pub.county`
- [ ] 2.3 Implement override merge logic: `townCity: pub.townCityOverride ?? pub.townCity`
- [ ] 2.4 Remove countyOverride and townCityOverride fields from returned pub object
- [ ] 2.5 Apply `applyOverrides` to each pub before returning in `getPubs` function
- [ ] 2.6 Verify returned data structure matches Pub interface (without override fields)

## 3. Sync Service Override Preservation
- [ ] 3.1 Review `syncPubToFirestore` in `functions/src/services/pubSyncService.ts`
- [ ] 3.2 Confirm function uses `set(pubDoc, { merge: true })` (already implemented)
- [ ] 3.3 Verify pubDoc object does NOT include countyOverride or townCityOverride fields
- [ ] 3.4 Add comment documenting that merge preserves override fields
- [ ] 3.5 Verify hasDataChanged compares only scraped fields (not override fields)

## 4. Validation
- [ ] 4.1 Update pub validation logic to accept optional countyOverride field
- [ ] 4.2 Update pub validation logic to accept optional townCityOverride field
- [ ] 4.3 Add type checking for countyOverride (must be string if present)
- [ ] 4.4 Add type checking for townCityOverride (must be string if present)
- [ ] 4.5 Ensure undefined/null/omitted override fields are treated equivalently

## 5. Testing
- [ ] 5.1 Write unit test: getPubs applies countyOverride correctly
- [ ] 5.2 Write unit test: getPubs applies townCityOverride correctly
- [ ] 5.3 Write unit test: getPubs applies both overrides correctly
- [ ] 5.4 Write unit test: getPubs returns original values when no override exists
- [ ] 5.5 Write unit test: getPubs removes override fields from returned data
- [ ] 5.6 Write unit test: syncPubToFirestore preserves countyOverride during update
- [ ] 5.7 Write unit test: syncPubToFirestore preserves townCityOverride during update
- [ ] 5.8 Write unit test: hasDataChanged ignores override fields in comparison
- [ ] 5.9 Write integration test: full sync flow preserves manual overrides
- [ ] 5.10 Write validation test: reject invalid override field types

## 6. Documentation
- [ ] 6.1 Add inline comments explaining override merge logic in getPubs
- [ ] 6.2 Add inline comments explaining override preservation in syncPubToFirestore
- [ ] 6.3 Document override field usage in `functions/README.md` or service file headers
- [ ] 6.4 Create instructions for manually setting overrides via Firestore console

## 7. Deployment Preparation
- [ ] 7.1 Build TypeScript (`npm run build` in functions/)
- [ ] 7.2 Run all tests (`npm test` in functions/)
- [ ] 7.3 Verify no breaking changes to existing pub data structure
- [ ] 7.4 Deploy functions to Firebase (`firebase deploy --only functions`)
- [ ] 7.5 Verify getPubs returns correct data in production

## 8. Post-Deployment
- [ ] 8.1 Identify pubs with incorrect county or townCity values
- [ ] 8.2 Manually set countyOverride or townCityOverride fields via Firestore console
- [ ] 8.3 Verify corrections appear in client applications (via getPubs)
- [ ] 8.4 Run scheduled sync and verify overrides are preserved
- [ ] 8.5 Document process for adding overrides in team knowledge base
