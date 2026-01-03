# Change Proposal: add-pub-geocoding

## Metadata
- **Change ID:** 2026-01-03-add-pub-geocoding
- **Status:** Proposed
- **Created:** 2026-01-03
- **Author:** AI Assistant

## Overview
Add country and region information to pub locations by integrating Google's Geocoding API. This enriches pub data with standardized geographic information to enable better organization, filtering, and display of pubs by geographic region.

## Why

### Problem
Pub data currently lacks standardized country and region fields, making it difficult to:
- Organize pubs hierarchically by geographic location
- Filter pubs by country or region in the UI
- Display meaningful geographic groupings in the sidebar
- Provide users with clear regional context for pubs

### Impact
Without country and region data:
- Users cannot easily browse pubs by country (England, Scotland, Wales, Northern Ireland)
- The navigation sidebar cannot group pubs effectively by region
- Data analysis and reporting on pub distribution is limited
- Future features requiring geographic filtering are blocked

### Solution
Integrate Google Geocoding API during pub scraping to automatically extract country and region from pub addresses. This provides:
- Standardized, authoritative geographic data
- Automatic population for new pubs
- No manual data entry required
- Foundation for geographic filtering and organization

## Motivation
Currently, pub data only includes townCity and address fields but lacks standardized country and region information. Users may want to:
- Browse pubs by country (e.g., England, Scotland, Wales, Northern Ireland)
- Filter pubs by region or county
- Understand the geographic distribution of Wetherspoon pubs
- Organize pubs hierarchically by location (Country → Region → Town)

## Objectives
1. Integrate Google Geocoding API to retrieve geographic metadata for pub addresses
2. Extract postcode from pub address to use as geocoding query parameter
3. Parse geocoding API response to extract country and region components
4. Apply region extraction logic based on country (UK vs non-UK)
5. Store country and region in pub data model (as optional fields)
6. Handle cases where geocoding fails or returns no valid results gracefully

## Non-Goals
- Geocoding existing pubs retroactively (will be handled separately)
- Caching geocoding results to reduce API calls
- Validating or correcting address data
- Using geocoding for lat/lng coordinates (position already extracted from website)
- Supporting multiple region hierarchies or custom geographic groupings

## Scope
### In Scope
- Postcode extraction from address string (last component)
- Google Geocoding API integration and configuration
- API response parsing for address components
- Country/region extraction logic (UK vs non-UK)
- Error handling for API failures and invalid responses
- Unit tests for postcode extraction and response parsing
- Environment configuration for Google API key

### Out of Scope
- Batch geocoding of existing pub records
- Geocoding result caching or rate limiting
- Alternative geocoding providers or fallback mechanisms
- Validation of extracted country/region values
- User-facing display of country/region (handled by existing specs)

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
4. Should country and region be added to the Pub TypeScript interface as optional fields?
5. How should we handle rate limiting if we exceed Google's free tier?

## Success Criteria
- Postcode extraction correctly identifies last address component
- Google Geocoding API is called with postcode parameter
- API response is parsed successfully to extract address components
- Country and region are correctly extracted for UK addresses
- Country and region are correctly extracted for non-UK addresses
- Geocoding failures leave country and region as undefined
- Unit tests validate postcode extraction and response parsing
- Integration tests verify end-to-end geocoding workflow
