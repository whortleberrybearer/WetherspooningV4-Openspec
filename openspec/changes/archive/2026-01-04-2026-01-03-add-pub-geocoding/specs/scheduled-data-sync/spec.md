# scheduled-data-sync Specification Delta

## ADDED Requirements

### Requirement: Postcode Extraction (REQ-SDS-020)
**Priority:** MUST
**Category:** Functional

The system MUST extract postcodes from pub addresses to use as geocoding query parameters.

**Acceptance Criteria:**
- `extractPostcode(address: string)` function extracts last comma-separated component
- Function returns null if address is empty or has no commas
- Leading and trailing whitespace is trimmed from extracted postcode
- Function handles addresses with multiple commas correctly
- Function returns null if last component is empty after trimming

#### Scenario: Extract UK Postcode from Standard Address
**Given** a pub address "123 High Street, Manchester, M1 1AA"
**When** `extractPostcode(address)` is called
**Then** the function returns "M1 1AA"
**And** no whitespace is included at start or end

#### Scenario: Extract Postcode from Multi-Component Address
**Given** a pub address "Unit 5, The Arcade, 21 Market Street, Bristol, BS1 1HQ"
**When** `extractPostcode(address)` is called
**Then** the function returns "BS1 1HQ"

#### Scenario: Handle Address Without Commas
**Given** a pub address "Manchester M1 1AA"
**When** `extractPostcode(address)` is called
**Then** the function returns null

#### Scenario: Handle Empty Address
**Given** an empty address ""
**When** `extractPostcode(address)` is called
**Then** the function returns null

#### Scenario: Handle Address Ending with Comma
**Given** a pub address "123 High Street, Manchester,"
**When** `extractPostcode(address)` is called
**Then** the function returns null
**And** empty string after final comma is rejected

---

### Requirement: Google Geocoding API Integration (REQ-SDS-021)
**Priority:** MUST
**Category:** Integration

The system MUST integrate with Google Geocoding API to retrieve geographic metadata for pub postcodes.

**Acceptance Criteria:**
- API key is loaded from `GOOGLE_GEOCODING_API_KEY` environment variable
- API requests use HTTPS endpoint: `https://maps.googleapis.com/maps/api/geocode/json`
- Query parameter `address` contains the postcode
- Query parameter `key` contains the API key
- Requests have 5-second timeout
- HTTP errors (4xx, 5xx) are caught and logged
- Network errors are caught and logged
- Function returns null on any error (non-blocking)
- Successful responses with status "OK" are processed
- Responses with status "ZERO_RESULTS" return null

#### Scenario: Successful Geocoding API Call
**Given** a valid postcode "M1 1AA"
**And** `GOOGLE_GEOCODING_API_KEY` is set to "test-api-key"
**When** `geocodePostcode("M1 1AA")` is called
**Then** HTTP GET request is made to `https://maps.googleapis.com/maps/api/geocode/json?address=M1%201AA&key=test-api-key`
**And** the response is parsed as JSON
**And** address_components are extracted from the response

#### Scenario: Handle API Timeout
**Given** the Google Geocoding API takes longer than 5 seconds to respond
**When** `geocodePostcode("M1 1AA")` is called
**Then** the request is aborted after 5 seconds
**And** a warning is logged: "Geocoding API timeout for postcode: M1 1AA"
**And** the function returns null

#### Scenario: Handle HTTP 404 Error
**Given** the Google Geocoding API returns HTTP 404
**When** `geocodePostcode("M1 1AA")` is called
**Then** the error is caught
**And** a warning is logged: "Geocoding API error (404) for postcode: M1 1AA"
**And** the function returns null

#### Scenario: Handle Zero Results Response
**Given** the Google Geocoding API returns valid JSON with status "ZERO_RESULTS"
**When** `geocodePostcode("INVALID")` is called
**Then** the response is parsed successfully
**And** the function returns null
**And** no error is logged (expected scenario)

#### Scenario: Handle Missing API Key
**Given** `GOOGLE_GEOCODING_API_KEY` environment variable is not set
**When** `geocodePostcode("M1 1AA")` is called
**Then** an error is logged: "Google Geocoding API key not configured"
**And** the function returns null
**And** no API request is made

---

### Requirement: UK Address Component Parsing (REQ-SDS-022)
**Priority:** MUST
**Category:** Functional

The system MUST parse Google Geocoding API responses to extract country and region for UK addresses using UK-specific administrative hierarchy.

**Acceptance Criteria:**
- Component with type "country" AND short_name "GB" identifies UK address
- For UK addresses, country = component with type "administrative_area_level_1"
- For UK addresses, region = component with type "administrative_area_level_2"
- If "administrative_area_level_2" is missing, region = component with type "postal_town"
- If both are missing, region = undefined
- long_name is used for country and region values
- Parsing function handles missing components gracefully

#### Scenario: Parse England Address with County
**Given** a Google Geocoding response with address_components:
```json
[
  { "long_name": "United Kingdom", "short_name": "GB", "types": ["country"] },
  { "long_name": "England", "short_name": "England", "types": ["administrative_area_level_1"] },
  { "long_name": "Greater Manchester", "short_name": "Greater Manchester", "types": ["administrative_area_level_2"] }
]
```
**When** `parseAddressComponents(components)` is called
**Then** the result is `{ country: "England", region: "Greater Manchester" }`

#### Scenario: Parse Scotland Address Without County
**Given** a Google Geocoding response with address_components:
```json
[
  { "long_name": "United Kingdom", "short_name": "GB", "types": ["country"] },
  { "long_name": "Scotland", "short_name": "Scotland", "types": ["administrative_area_level_1"] },
  { "long_name": "Edinburgh", "short_name": "Edinburgh", "types": ["postal_town"] }
]
```
**When** `parseAddressComponents(components)` is called
**Then** the result is `{ country: "Scotland", region: "Edinburgh" }`
**And** postal_town is used because administrative_area_level_2 is missing

#### Scenario: Parse Wales Address with No Region
**Given** a Google Geocoding response with address_components:
```json
[
  { "long_name": "United Kingdom", "short_name": "GB", "types": ["country"] },
  { "long_name": "Wales", "short_name": "Wales", "types": ["administrative_area_level_1"] }
]
```
**When** `parseAddressComponents(components)` is called
**Then** the result is `{ country: "Wales", region: undefined }`

---

### Requirement: Non-UK Address Component Parsing (REQ-SDS-023)
**Priority:** MUST
**Category:** Functional

The system MUST parse Google Geocoding API responses to extract country and region for non-UK addresses using standard international administrative hierarchy.

**Acceptance Criteria:**
- Component with type "country" AND short_name not "GB" identifies non-UK address
- For non-UK addresses, country = component with type "country" (long_name)
- For non-UK addresses, region = component with type "administrative_area_level_1"
- If "administrative_area_level_1" is missing, region = undefined
- long_name is used for both country and region values

#### Scenario: Parse US Address
**Given** a Google Geocoding response with address_components:
```json
[
  { "long_name": "United States", "short_name": "US", "types": ["country"] },
  { "long_name": "California", "short_name": "CA", "types": ["administrative_area_level_1"] }
]
```
**When** `parseAddressComponents(components)` is called
**Then** the result is `{ country: "United States", region: "California" }`

#### Scenario: Parse French Address
**Given** a Google Geocoding response with address_components:
```json
[
  { "long_name": "France", "short_name": "FR", "types": ["country"] },
  { "long_name": "Île-de-France", "short_name": "Île-de-France", "types": ["administrative_area_level_1"] }
]
```
**When** `parseAddressComponents(components)` is called
**Then** the result is `{ country: "France", region: "Île-de-France" }`

#### Scenario: Parse Non-UK Address with No Region
**Given** a Google Geocoding response with address_components:
```json
[
  { "long_name": "Monaco", "short_name": "MC", "types": ["country"] }
]
```
**When** `parseAddressComponents(components)` is called
**Then** the result is `{ country: "Monaco", region: undefined }`

---

## MODIFIED Requirements

### Requirement: Pub Data Extraction (REQ-SDS-001)
**Priority:** MUST
**Category:** Functional

**Changes:**
- ADD: Country and region extraction via geocoding
- ADD: Postcode-based geocoding integration

The system MUST extract comprehensive pub data from web pages including geographic metadata via geocoding.

**Updated Acceptance Criteria:**
- All existing extraction criteria remain unchanged
- **ADDED:** Postcode is extracted from address using `extractPostcode()`
- **ADDED:** Postcode is used to call `geocodePostcode()` for country/region
- **ADDED:** Country and region are added to ScrapedPubData if geocoding succeeds
- **ADDED:** Geocoding failures do not block pub data extraction
- **ADDED:** Geocoding errors are logged as warnings
- **ADDED:** If geocoding returns null, country and region are undefined

#### Scenario: Extract Pub Data with Successful Geocoding
**ADDED:**
**Given** a pub page with address "123 High Street, Manchester, M1 1AA"
**And** the geocoding API returns country "England" and region "Greater Manchester"
**When** `scrapePubData(url, imageUrl)` is called
**Then** the ScrapedPubData includes all existing fields
**And** `country` equals "England"
**And** `region` equals "Greater Manchester"

#### Scenario: Extract Pub Data with Geocoding Failure
**ADDED:**
**Given** a pub page with address "123 High Street, Manchester, M1 1AA"
**And** the geocoding API times out or returns an error
**When** `scrapePubData(url, imageUrl)` is called
**Then** the ScrapedPubData includes all existing fields
**And** `country` is undefined
**And** `region` is undefined
**And** a warning is logged: "Failed to geocode postcode: M1 1AA"
**And** the function returns non-null ScrapedPubData

#### Scenario: Extract Pub Data with No Postcode
**ADDED:**
**Given** a pub page with address "The Pub, Manchester"
**And** the address has no comma-separated postcode
**When** `scrapePubData(url, imageUrl)` is called
**Then** `extractPostcode()` returns null
**And** geocoding is skipped
**And** `country` is undefined
**And** `region` is undefined
**And** a warning is logged: "No postcode found in address"

---

### Requirement: Environment Configuration (REQ-SDS-010)
**Priority:** MUST
**Category:** Configuration

**Changes:**
- ADD: Google Geocoding API key configuration

The system MUST load configuration from environment variables including Google Geocoding API credentials.

**Updated Acceptance Criteria:**
- All existing environment variable criteria remain unchanged
- **ADDED:** `GOOGLE_GEOCODING_API_KEY` is loaded from environment
- **ADDED:** Missing API key is detected and logged on first geocoding attempt
- **ADDED:** API key is never logged or exposed in error messages
- **ADDED:** `.env.example` documents GOOGLE_GEOCODING_API_KEY with description

#### Scenario: Load Google Geocoding API Key
**ADDED:**
**Given** `GOOGLE_GEOCODING_API_KEY` is set to "AIzaSyABC123..." in environment
**When** the geocoding service is initialized
**Then** the API key is loaded successfully
**And** the key is used in geocoding API requests

#### Scenario: Detect Missing API Key
**ADDED:**
**Given** `GOOGLE_GEOCODING_API_KEY` is not set in environment
**When** the first geocoding request is made
**Then** an error is logged: "Google Geocoding API key not configured"
**And** the geocoding function returns null
**And** the API key value is not included in the log message
