# Tasks: add-pub-geocoding

## Implementation Tasks

### 1. Setup and Configuration
- [ ] Add `GOOGLE_GEOCODING_API_KEY` to Firebase Functions environment configuration
- [ ] Add `GOOGLE_GEOCODING_API_KEY` to `.env.example` with documentation
- [ ] Update project.md to document Google Geocoding API as external dependency
- [ ] Verify Google Cloud billing account is configured for Geocoding API access

### 2. Create Geocoding Service
- [ ] Create `functions/src/services/geocodingService.ts`
- [ ] Define `GeocodeResult` interface with country and region fields
- [ ] Define `GoogleGeocodeResponse` interface for API response typing
- [ ] Implement `geocodePostcode(postcode: string)` function
- [ ] Add HTTP client code to call Google Geocoding API
- [ ] Implement `parseAddressComponents()` helper function
- [ ] Add logic to extract country from address components
- [ ] Add UK-specific logic: country = admin_level_1, region = admin_level_2 or postal_town
- [ ] Add non-UK logic: country = country, region = admin_level_1
- [ ] Add error handling for API failures (return null)
- [ ] Add error handling for invalid/empty responses (return null)
- [ ] Add timeout handling (5 second timeout)

### 3. Update Pub Scraper Service
- [ ] Add `extractPostcode(address: string)` function to pubScraperService.ts
- [ ] Implement postcode extraction: split address by comma, return last component
- [ ] Handle edge cases: empty address, no commas, whitespace trimming
- [ ] Import geocodingService into pubScraperService
- [ ] Modify `scrapePubData()` to call extractPostcode() after address extraction
- [ ] Call `geocodePostcode()` with extracted postcode
- [ ] Add country and region from geocode result to ScrapedPubData
- [ ] Ensure geocoding failures don't block scraping (graceful degradation)
- [ ] Add console logging for geocoding failures (warning level)

### 4. Update Type Definitions
- [ ] Add `country?: string` to ScrapedPubData interface in pub.ts
- [ ] Add `region?: string` to ScrapedPubData interface in pub.ts
- [ ] Add `country?: string` to Pub interface in pub.ts (if needed)
- [ ] Add `region?: string` to Pub interface in pub.ts (if needed)
- [ ] Verify type changes don't break existing code (TypeScript compilation)

### 5. Unit Tests - Geocoding Service
- [ ] Create `functions/test/services/geocodingService.test.ts`
- [ ] Test `geocodePostcode()` with mocked successful API response
- [ ] Test `geocodePostcode()` with mocked API error
- [ ] Test `geocodePostcode()` with mocked empty results
- [ ] Test `geocodePostcode()` with mocked timeout
- [ ] Test `parseAddressComponents()` with UK address components
- [ ] Test UK: admin_level_1 extracted as country
- [ ] Test UK: admin_level_2 extracted as region
- [ ] Test UK: postal_town fallback when admin_level_2 missing
- [ ] Test non-UK: country extracted as country
- [ ] Test non-UK: admin_level_1 extracted as region
- [ ] Test with missing country component (returns undefined)
- [ ] Test with missing region component (returns undefined)

### 6. Unit Tests - Postcode Extraction
- [ ] Add tests to `pubScraperService.test.ts` for `extractPostcode()`
- [ ] Test standard UK address format (e.g., "123 Street, City, POSTCODE")
- [ ] Test address with multiple commas
- [ ] Test address without commas (return null)
- [ ] Test empty string (return null)
- [ ] Test address with trailing whitespace
- [ ] Test address ending with comma (return null)

### 7. Integration Tests
- [ ] Add integration test for full scraping workflow with geocoding
- [ ] Mock Google Geocoding API responses in integration test
- [ ] Verify country and region populated in ScrapedPubData
- [ ] Verify graceful handling when geocoding unavailable
- [ ] Test with both UK and non-UK sample responses

### 8. Documentation
- [ ] Add JSDoc comments to geocoding service functions
- [ ] Document expected address format in extractPostcode()
- [ ] Add comments explaining UK vs non-UK logic in parseAddressComponents()
- [ ] Update README with Google Geocoding API setup instructions (if applicable)

### 9. Validation and Deployment
- [ ] Run all tests locally and verify 100% pass
- [ ] Verify TypeScript compilation succeeds
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
