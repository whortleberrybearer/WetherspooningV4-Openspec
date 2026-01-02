# firebase-data-integration Delta

**Change:** `2026-01-02-add-optional-location-fields`

## MODIFIED Requirements

### Requirement: Data Schema Validation (REQ-FDI-003)
**Priority:** MUST  
**Category:** Functional

**Changes:**
- MODIFY: Make `country` and `region` optional in pub validation
- MODIFY: Update required fields list to exclude country and region

The system SHALL validate pub data with optional country and region fields, treating them as valid when null, undefined, or omitted while still enforcing type checking when values are provided.

**Updated Acceptance Criteria:**
- Pub documents SHALL be validated for required fields: id, name, townCity, address, county
- **REMOVED:** country and region from required fields list
- **ADDED:** country and region SHALL be optional fields
- **ADDED:** Optional fields SHALL be allowed as null, undefined, or omitted
- Optional fields SHALL be type-checked if present (must be string if provided)
- Invalid documents SHALL be logged with document ID
- Invalid documents SHALL be skipped without throwing errors
- Valid documents from the same query SHALL still be returned

#### Scenario: Accept Pub Without Country
**ADDED:**
**Given** a Firestore pub document with all required fields except country
**And** the document structure is:
```json
{
  "id": "abc-123",
  "name": "The Test Pub",
  "townCity": "TestCity",
  "address": "123 Test St",
  "county": "TestCounty",
  "region": "Test Region",
  "position": {"lat": 51.5, "lng": -0.1}
}
```
**When** `getAllPubs()` processes the document
**Then** the pub is validated successfully
**And** no warning is logged
**And** the pub is included in results
**And** pub.country is undefined

#### Scenario: Accept Pub Without Region
**ADDED:**
**Given** a Firestore pub document with all required fields except region
**And** the document structure is:
```json
{
  "id": "abc-123",
  "name": "The Test Pub",
  "townCity": "TestCity",
  "address": "123 Test St",
  "county": "TestCounty",
  "country": "England",
  "position": {"lat": 51.5, "lng": -0.1}
}
```
**When** `getAllPubs()` processes the document
**Then** the pub is validated successfully
**And** no warning is logged
**And** the pub is included in results
**And** pub.region is undefined

#### Scenario: Accept Pub Without Both Country and Region
**ADDED:**
**Given** a Firestore pub document with all required fields but no country or region
**And** the document structure is:
```json
{
  "id": "abc-123",
  "name": "The Test Pub",
  "townCity": "TestCity",
  "address": "123 Test St",
  "county": "TestCounty",
  "position": {"lat": 51.5, "lng": -0.1}
}
```
**When** `getAllPubs()` processes the document
**Then** the pub is validated successfully
**And** no warning is logged
**And** the pub is included in results
**And** pub.country is undefined
**And** pub.region is undefined

#### Scenario: Reject Pub with Invalid Country Type
**ADDED:**
**Given** a Firestore pub document with country as a number instead of string
**And** the document has `"country": 123`
**When** `getAllPubs()` processes the document
**Then** a warning is logged with the document ID and field name
**And** the document is skipped
**And** the application does not crash
