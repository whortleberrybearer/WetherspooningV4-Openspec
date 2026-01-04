# Tasks: add-pub-geocoding

## Implementation Tasks

### 1. Setup and Configuration
- [ ] Add `GOOGLE_GEOCODING_API_KEY` to Firebase Functions environment configuration
- [x] Add `GOOGLE_GEOCODING_API_KEY` to `.env.example` with documentation
- [x] Update project.md to document Google Geocoding API as external dependency
- [ ] Verify Google Cloud billing account is configured for Geocoding API access

### 2. Create Geocoding Service
- [x] Create `functions/src/services/geocodingService.ts`
- [x] Define `GeocodeResult` interface with country and region fields
- [x] Define `GoogleGeocodeResponse` interface for API response typing
- [x] Implement `geocodePostcode(postcode: string)` function
- [x] Add HTTP client code to call Google Geocoding API
- [x] Implement `parseAddressComponents()` helper function
- [x] Add logic to extract country from address components
- [x] Add UK-specific logic: country = admin_level_1, region = admin_level_2 or postal_town
- [x] Add non-UK logic: country = country, region = admin_level_1
- [x] Add error handling for API failures (return null)
- [x] Add error handling for invalid/empty responses (return null)
- [x] Add timeout handling (5 second timeout)

### 3. Update Pub Scraper Service
- [x] Add `extractPostcode(address: string)` function to pubScraperService.ts
- [x] Implement postcode extraction: split address by comma, return last component
- [x] Handle edge cases: empty address, no commas, whitespace trimming
- [x] Import geocodingService into pubScraperService
- [x] Modify `scrapePubData()` to call extractPostcode() after address extraction
- [x] Call `geocodePostcode()` with extracted postcode
- [x] Add country and region from geocode result to ScrapedPubData
- [x] Ensure geocoding failures don't block scraping (graceful degradation)
- [x] Add console logging for geocoding failures (warning level)

### 4. Update Type Definitions
- [x] Add `country?: string` to ScrapedPubData interface in pub.ts
- [x] Add `region?: string` to ScrapedPubData interface in pub.ts
- [x] Add `country?: string` to Pub interface in pub.ts (if needed)
- [x] Add `region?: string` to Pub interface in pub.ts (if needed)
- [x] Verify type changes don't break existing code (TypeScript compilation)

### 5. Unit Tests - Geocoding Service
- [x] Create `functions/test/services/geocodingService.test.ts`
- [x] Test `geocodePostcode()` with mocked successful API response
- [x] Test `geocodePostcode()` with mocked API error
- [x] Test `geocodePostcode()` with mocked empty results
- [x] Test `geocodePostcode()` with mocked timeout
- [x] Test `parseAddressComponents()` with UK address components
- [x] Test UK: admin_level_1 extracted as country
- [x] Test UK: admin_level_2 extracted as region
- [x] Test UK: postal_town fallback when admin_level_2 missing
- [x] Test non-UK: country extracted as country
- [x] Test non-UK: admin_level_1 extracted as region
- [x] Test with missing country component (returns undefined)
- [x] Test with missing region component (returns undefined)

### 6. Unit Tests - Postcode Extraction
- [x] Add tests to `pubScraperService.test.ts` for `extractPostcode()`
- [x] Test standard UK address format (e.g., "123 Street, City, POSTCODE")
- [x] Test address with multiple commas
- [x] Test address without commas (return null)
- [x] Test empty string (return null)
- [x] Test address with trailing whitespace
- [x] Test address ending with comma (return null)

### 7. Integration Tests
- [x] Add integration test for full scraping workflow with geocoding
- [x] Mock Google Geocoding API responses in integration test
- [x] Verify country and region populated in ScrapedPubData
- [x] Verify graceful handling when geocoding unavailable
- [x] Test with both UK and non-UK sample responses

### 8. Documentation
- [x] Add JSDoc comments to geocoding service functions
- [x] Document expected address format in extractPostcode()
- [x] Add comments explaining UK vs non-UK logic in parseAddressComponents()
- [ ] Update README with Google Geocoding API setup instructions (if applicable)

### 9. Validation and Deployment
- [x] Run all tests locally and verify 100% pass
- [x] Verify TypeScript compilation succeeds
- [ ] Run `openspec validate 2026-01-03-add-pub-geocoding --strict`
- [ ] Fix any validation issues
- [ ] Deploy functions to Firebase staging environment (if applicable)
- [ ] Manually test with sample pubs in staging
- [ ] Verify API key works and requests succeed

## Dependencies
- Task 2 depends on Task 1 (environment configuration)
- Task 3 depends on Task 2 (geocoding service must exist)
- Task 5 depends on Task 2 (tests require implementation)
- Task 6 depends on Task 3 (tests require implementation)
- Task 9 depends on all previous tasks (validation requires completion)

## Parallelizable Work
- Tasks 1 and 4 can be done in parallel (independent)
- Tasks 5 and 6 can be done in parallel (different test files)
- Task 8 can be done alongside implementation tasks (2, 3)
