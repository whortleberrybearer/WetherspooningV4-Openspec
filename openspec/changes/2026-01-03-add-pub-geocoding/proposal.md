# Change Proposal: add-pub-geocoding

## Metadata
- **Change ID:** 2026-01-03-add-pub-geocoding
- **Status:** Proposed
- **Created:** 2026-01-03
- **Author:** AI Assistant

## Overview
Add country and county information to pub locations by integrating Google's Geocoding API. This enriches pub data with standardized geographic information to enable better organization, filtering, and display of pubs by geographic county.

## Why

### Problem
Pub data currently lacks standardized country and county fields, making it difficult to:
- Organize pubs hierarchically by geographic location
- Filter pubs by country or county in the UI
- Display meaningful geographic groupings in the sidebar
- Provide users with clear countyal context for pubs

### Impact
Without country and county data:
- Users cannot easily browse pubs by country (England, Scotland, Wales, Northern Ireland)
- The navigation sidebar cannot group pubs effectively by county
- Data analysis and reporting on pub distribution is limited
- Future features requiring geographic filtering are blocked

### Solution
Integrate Google Geocoding API during pub scraping to automatically extract country and county from pub addresses. This provides:
- Standardized, authoritative geographic data
- Automatic population for new pubs
- No manual data entry required
- Foundation for geographic filtering and organization

## Motivation
Currently, pub data only includes townCity and address fields but lacks standardized country and county information. Users may want to:
- Browse pubs by country (e.g., England, Scotland, Wales, Northern Ireland)
- Filter pubs by county or county
- Understand the geographic distribution of Wetherspoon pubs
- Organize pubs hierarchically by location (Country → county → Town)

## Objectives
1. Integrate Google Geocoding API to retrieve geographic metadata for pub addresses
2. Extract postcode from pub address to use as geocoding query parameter
3. Parse geocoding API response to extract country component
4. Apply county extraction logic:
   - If geocoding returns "Greater London" or "Greater Manchester", use that as the county
   - Otherwise, extract county from the penultimate (second-to-last) part of the address
5. Store country and county in pub data model (as optional fields)
6. Handle cases where geocoding fails or returns no valid results gracefully

## Non-Goals
- Geocoding existing pubs retroactively (will be handled separately)
- Caching geocoding results to reduce API calls
- Validating or correcting address data
- Using geocoding for lat/lng coordinates (position already extracted from website)
- Supporting multiple county hierarchies or custom geographic groupings

## Scope
### In Scope
- Postcode extraction from address string (last component)
- Google Geocoding API integration and configuration
- API response parsing for address components
- Country/county extraction logic (UK vs non-UK)
- Error handling for API failures and invalid responses
- Unit tests for postcode extraction and response parsing
- Environment configuration for Google API key

### Out of Scope
- Batch geocoding of existing pub records
- Geocoding result caching or rate limiting
- Alternative geocoding providers or fallback mechanisms
- Validation of extracted country/county values
- User-facing display of country/county (handled by existing specs)

## Affected Capabilities
- **MODIFIED:** `scheduled-data-sync` - Enhanced pub scraping to include geocoding

## Dependencies
- Google Geocoding API (requires API key)
- Google Maps Platform billing account
- Firebase Functions environment variable configuration
- Existing `pubScraperService` implementation

## Open Questions
1. Should we add retry logic for geocoding API failures?
2. What should the timeout be for geocoding API requests?
3. Should we log geocoding failures to monitor API usage and success rate?
4. Should country and county be added to the Pub TypeScript interface as optional fields?
5. How should we handle rate limiting if we exceed Google's free tier?

## Success Criteria
- Postcode extraction correctly identifies last address component
- County extraction from address correctly identifies penultimate (second-to-last) component
- Google Geocoding API is called with postcode parameter
- API response is parsed successfully to extract address components
- Special case: "Greater London" from geocoding is converted to "London"
- For all other cases: County is extracted from penultimate part of address
- Country is correctly extracted from geocoding for UK addresses
- Country is correctly extracted from geocoding for non-UK addresses
- Geocoding failures fall back to address parsing for county extraction
- Unit tests validate postcode and county extraction logic
- Integration tests verify end-to-end geocoding workflow with both API and fallback paths

## Implementation Notes

### County Extraction Logic
The implementation uses a hybrid approach combining geocoding API results with address parsing:

1. **Extract postcode** from the address (last comma-separated component)
2. **Call Google Geocoding API** with the postcode
3. **Determine county** using this logic:
   - If geocoding succeeds and returns "Greater London" → use "Greater London"
   - If geocoding succeeds and returns "Greater Manchester" → use "Greater Manchester"
   - If geocoding succeeds with any other value → extract county from penultimate address part
   - If geocoding fails → extract county from penultimate address part

**Examples:**
- Address: "283–288 High Holborn, Holborn, Camden, WC1V 7HP"
  - Geocode returns: "Greater London"
  - Result: County = "Greater London"

- Address: "123 Deansgate, Manchester, Greater Manchester, M3 2BQ"
  - Geocode returns: "Greater Manchester"
  - Result: County = "Greater Manchester"

- Address: "59 Lagland Street, Poole, Dorset, BH15 1QD"
  - Geocode returns: "Bournemouth, Christchurch and Poole"
  - Penultimate part: "Dorset"
  - Result: County = "Dorset"

### Fallback Behavior
When geocoding fails (API error, timeout, invalid postcode):
- Country remains undefined (no fallback)
- County falls back to penultimate part of address
- Warnings are logged for monitoring purposes
