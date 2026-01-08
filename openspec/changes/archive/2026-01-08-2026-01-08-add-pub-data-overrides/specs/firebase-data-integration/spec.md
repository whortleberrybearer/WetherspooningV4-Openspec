# firebase-data-integration Spec Delta

## ADDED Requirements

### Requirement: Pub Data Override Fields (REQ-FDI-017)
**Priority:** MUST  
**Category:** Functional

The system MUST support optional override fields for county and townCity to allow manual correction of scraped data while preserving original values.

**Acceptance Criteria:**
- Pub interface includes optional `countyOverride?: string` field
- Pub interface includes optional `townCityOverride?: string` field
- Override fields are stored in Firestore pub documents as optional fields
- Override fields are not set or modified by scraping or sync operations
- Override fields can be set via direct Firestore updates
- Override validation treats undefined, null, and omitted as equivalent (no override)
- Non-empty string overrides are type-checked (must be string)

#### Scenario: Store Pub with County Override
**Given** a pub document in Firestore with:
```json
{
  "id": "abc-123",
  "name": "The Test Pub",
  "townCity": "Westminster",
  "county": "London",
  "countyOverride": "Greater London"
}
```
**When** the pub data is retrieved from Firestore  
**Then** the pub object includes both `county: "London"` and `countyOverride: "Greater London"`  
**And** validation passes  
**And** both fields are available to consuming code

#### Scenario: Store Pub with TownCity Override
**Given** a pub document in Firestore with:
```json
{
  "id": "abc-123",
  "name": "The Test Pub",
  "townCity": "City of London",
  "townCityOverride": "London"
}
```
**When** the pub data is retrieved from Firestore  
**Then** the pub object includes both `townCity: "City of London"` and `townCityOverride: "London"`  
**And** validation passes  
**And** both fields are available to consuming code

#### Scenario: Store Pub with Both Overrides
**Given** a pub document in Firestore with both countyOverride and townCityOverride set  
**When** the pub data is retrieved from Firestore  
**Then** the pub object includes all four fields: county, countyOverride, townCity, townCityOverride  
**And** validation passes

#### Scenario: Store Pub Without Overrides
**Given** a pub document in Firestore with no override fields  
**When** the pub data is retrieved from Firestore  
**Then** the pub object has `countyOverride: undefined` and `townCityOverride: undefined`  
**And** validation passes  
**And** original county and townCity values are unchanged

---

### Requirement: Override Application in Data Retrieval (REQ-FDI-018)
**Priority:** MUST  
**Category:** Functional

The system MUST apply override values before returning pub data to clients, making corrections transparent.

**Acceptance Criteria:**
- `getPubs` callable function applies overrides before returning pub data
- When `countyOverride` is defined, returned `county` field uses override value
- When `townCityOverride` is defined, returned `townCity` field uses override value
- When override is undefined/null, returned field uses original scraped value
- Override application happens server-side (clients receive merged data)
- Override fields (`countyOverride`, `townCityOverride`) are removed from returned data
- Original scraped values are not returned to clients when overrides exist

#### Scenario: Apply County Override Before Return
**Given** a pub in Firestore with:
```json
{
  "id": "abc-123",
  "county": "London",
  "countyOverride": "Greater London",
  "townCity": "Westminster"
}
```
**When** `getPubs()` is called  
**Then** the returned pub data contains:
```json
{
  "id": "abc-123",
  "county": "Greater London",
  "townCity": "Westminster"
}
```
**And** `countyOverride` field is not present in returned data  
**And** original scraped value "London" is not visible to clients

#### Scenario: Apply TownCity Override Before Return
**Given** a pub in Firestore with:
```json
{
  "id": "abc-123",
  "townCity": "City of London",
  "townCityOverride": "London",
  "county": "Greater London"
}
```
**When** `getPubs()` is called  
**Then** the returned pub data contains:
```json
{
  "id": "abc-123",
  "townCity": "London",
  "county": "Greater London"
}
```
**And** `townCityOverride` field is not present in returned data  
**And** original scraped value "City of London" is not visible to clients

#### Scenario: Apply Both Overrides Before Return
**Given** a pub in Firestore with both countyOverride and townCityOverride  
**When** `getPubs()` is called  
**Then** returned `county` field uses countyOverride value  
**And** returned `townCity` field uses townCityOverride value  
**And** neither override field is present in returned data

#### Scenario: Return Original Values When No Override
**Given** a pub in Firestore with county and townCity but no overrides  
**When** `getPubs()` is called  
**Then** returned `county` field uses original scraped county value  
**And** returned `townCity` field uses original scraped townCity value  
**And** no override fields are present in returned data

#### Scenario: Handle Override with Empty Scraped Value
**Given** a pub in Firestore with:
```json
{
  "id": "abc-123",
  "townCity": "",
  "townCityOverride": "London"
}
```
**When** `getPubs()` is called  
**Then** the returned pub data contains `townCity: "London"`  
**And** empty scraped value is overridden by non-empty override

---

## MODIFIED Requirements

### Requirement: Data Schema Validation (REQ-FDI-003)
**Priority:** MUST  
**Category:** Functional

**Changes:**
- ADD: Optional countyOverride and townCityOverride fields to pub validation
- ADD: Type checking for override fields when present

The system SHALL validate pub data including optional override fields, enforcing type constraints when override values are provided.

**Updated Acceptance Criteria:**
- Pub documents SHALL be validated for required fields: id, name, townCity, address
- county, country, and region SHALL be optional fields
- **ADDED:** countyOverride and townCityOverride SHALL be optional fields
- **ADDED:** countyOverride SHALL be type-checked as string if present
- **ADDED:** townCityOverride SHALL be type-checked as string if present
- Optional fields SHALL be allowed as null, undefined, or omitted
- Optional fields SHALL be type-checked if present (must be string if provided)
- Invalid documents SHALL be logged with document ID
- Invalid documents SHALL be skipped without throwing errors
- Valid documents from the same query SHALL still be returned

#### Scenario: Accept Pub with County Override
**ADDED:**
**Given** a Firestore pub document with countyOverride field:
```json
{
  "id": "abc-123",
  "name": "The Test Pub",
  "townCity": "Westminster",
  "county": "London",
  "countyOverride": "Greater London",
  "address": "123 Test St",
  "position": {"lat": 51.5, "lng": -0.1}
}
```
**When** validation occurs  
**Then** the pub is validated successfully  
**And** no warning is logged  
**And** the pub is included in results  
**And** countyOverride value is preserved

#### Scenario: Accept Pub with TownCity Override
**ADDED:**
**Given** a Firestore pub document with townCityOverride field:
```json
{
  "id": "abc-123",
  "name": "The Test Pub",
  "townCity": "City of London",
  "townCityOverride": "London",
  "county": "Greater London",
  "address": "123 Test St",
  "position": {"lat": 51.5, "lng": -0.1}
}
```
**When** validation occurs  
**Then** the pub is validated successfully  
**And** no warning is logged  
**And** the pub is included in results  
**And** townCityOverride value is preserved

#### Scenario: Accept Pub with Both Overrides
**ADDED:**
**Given** a Firestore pub document with both countyOverride and townCityOverride:
```json
{
  "id": "abc-123",
  "name": "The Test Pub",
  "townCity": "Westminster",
  "townCityOverride": "London",
  "county": "London",
  "countyOverride": "Greater London",
  "address": "123 Test St",
  "position": {"lat": 51.5, "lng": -0.1}
}
```
**When** validation occurs  
**Then** the pub is validated successfully  
**And** both override values are preserved

#### Scenario: Reject Pub with Invalid County Override Type
**ADDED:**
**Given** a Firestore pub document with countyOverride as a number:
```json
{
  "id": "abc-123",
  "name": "The Test Pub",
  "townCity": "Westminster",
  "countyOverride": 123,
  "address": "123 Test St"
}
```
**When** validation occurs  
**Then** a warning is logged with the document ID and field name  
**And** the document is skipped  
**And** the application does not crash

#### Scenario: Reject Pub with Invalid TownCity Override Type
**ADDED:**
**Given** a Firestore pub document with townCityOverride as an object:
```json
{
  "id": "abc-123",
  "name": "The Test Pub",
  "townCity": "Westminster",
  "townCityOverride": {"value": "London"},
  "address": "123 Test St"
}
```
**When** validation occurs  
**Then** a warning is logged with the document ID and field name  
**And** the document is skipped  
**And** the application does not crash
