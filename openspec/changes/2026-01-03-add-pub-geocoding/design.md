# Design Document: add-pub-geocoding

## Architecture Overview
This change adds geocoding functionality to the pub scraping service using Google's Geocoding API. The geocoding occurs during the pub scraping workflow, enriching scraped pub data with country and region before persisting to Firestore.

## Component Design

### 1. Postcode Extraction
**Location:** `functions/src/services/pubScraperService.ts`

**Function:** `extractPostcode(address: string): string | null`
- Splits address by comma separator
- Returns last non-empty component (typically UK postcode)
- Returns null if address is empty or malformed

**Rationale:** UK addresses typically format postcodes as the final comma-separated component. This simple heuristic works for the majority of Wetherspoon pub addresses.

### 2. Geocoding Service
**Location:** `functions/src/services/geocodingService.ts` (new file)

**Function:** `geocodePostcode(postcode: string): Promise<GeocodeResult | null>`
- Calls Google Geocoding API with postcode query
- Parses response JSON to extract address_components
- Returns structured result with country and region
- Returns null if API call fails or no valid results

**Interface:**
```typescript
export interface GeocodeResult {
  country: string | undefined;
  region: string | undefined;
}

export interface GoogleGeocodeResponse {
  results: Array<{
    address_components: Array<{
      long_name: string;
      short_name: string;
      types: string[];
    }>;
  }>;
  status: string;
}
```

**API Request:**
```
GET https://maps.googleapis.com/maps/api/geocode/json?address={postcode}&key={API_KEY}
```

### 3. Address Component Parsing
**Function:** `parseAddressComponents(components: AddressComponent[]): GeocodeResult`

**Logic:**
1. Find component with type `country`
2. Determine if country is "United Kingdom":
   - **UK:** 
     - country = component with type `administrative_area_level_1` (England, Scotland, Wales, NI)
     - region = component with type `administrative_area_level_2` OR `postal_town` (fallback)
   - **Non-UK:**
     - country = component with type `country`
     - region = component with type `administrative_area_level_1`
3. Return result with extracted values or undefined if not found

**Rationale:** Google's geocoding uses a hierarchical structure where `administrative_area_level_1` represents different concepts based on country. For UK, it represents the constituent country (England, Scotland, etc.), while for other countries it often represents a state or province.

### 4. Integration with Pub Scraper
**Modification:** `scrapePubData()` function

**Workflow:**
1. Extract pub data (existing logic)
2. Extract postcode from address
3. Call geocoding service with postcode
4. Add country and region to ScrapedPubData
5. Return enriched pub data

**Error Handling:**
- If geocoding fails, continue with undefined country/region
- Log warning for geocoding failures (non-blocking)
- Never fail pub scrape due to geocoding errors

## Data Model Changes

### ScrapedPubData Interface
```typescript
export interface ScrapedPubData {
  // ... existing fields
  country?: string;
  region?: string;
}
```

### Pub Interface
```typescript
export interface Pub {
  // ... existing fields
  country?: string;
  region?: string;
}
```

## API Configuration

### Environment Variables
- `GOOGLE_GEOCODING_API_KEY` - API key for Google Geocoding API
- Required for Firebase Functions deployment
- Should be set in `.env.local` for local development

### API Limits & Costs
- Google Geocoding API: $5 per 1000 requests after free tier
- Free tier: $200/month credit (40,000 requests)
- Expected usage: ~900 pubs initially, minimal ongoing requests
- Cost: Within free tier for foreseeable future

## Testing Strategy

### Unit Tests
1. `extractPostcode()` - Various address formats
2. `parseAddressComponents()` - UK and non-UK responses
3. Mock geocoding API responses for different scenarios

### Integration Tests
1. End-to-end scraping with real geocoding API
2. Verify country/region stored correctly in Firestore
3. Test graceful degradation when API unavailable

## Alternative Approaches Considered

### 1. Parse Country/Region from Address String
**Rejected:** Address formats vary significantly, and parsing would be fragile and error-prone.

### 2. Use Lat/Lng for Reverse Geocoding
**Rejected:** Position data already extracted from website; using postcode is simpler and more accurate for administrative boundaries.

### 3. Manual Data Entry or CSV Import
**Rejected:** Not scalable and prone to human error; automated geocoding ensures consistency.

## Security Considerations
- API key must be secured in environment variables
- Never expose API key in client-side code or version control
- Consider API key rotation and access controls via Google Cloud Console

## Performance Considerations
- Geocoding adds ~200-500ms per pub (network latency)
- For 900 pubs, total additional time: ~5-10 minutes
- Non-blocking: geocoding failures don't halt scraping process
- Future optimization: batch geocoding or caching

## Migration Strategy
This change only affects newly scraped pubs. Existing pubs in Firestore will have undefined country/region until re-scraped. A separate migration task can batch geocode existing pubs if needed.
