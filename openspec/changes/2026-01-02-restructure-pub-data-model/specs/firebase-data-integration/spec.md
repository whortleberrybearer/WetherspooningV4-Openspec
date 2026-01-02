# firebase-data-integration Specification Delta

## MODIFIED Requirements

### Requirement: Firestore Pub Data Operations (REQ-FDI-002)
**Priority:** MUST  
**Category:** Functional

**Changes:**
- MODIFIED: Pub interface now uses `id: string` (UUID) instead of `id: number`
- MODIFIED: Pub interface now uses `position: { lat: number, lng: number } | null` instead of top-level `lat`, `lng`
- MODIFIED: Validation must handle optional `position` field
- MODIFIED: Validation must accept string-based `id`
- REMOVED: Required validation for `lat` and `lng` as top-level fields

**Updated Acceptance Criteria:**
- `getAllPubs()` method retrieves all pub documents from `pubs` collection
- `getPubById(pubId: string)` method retrieves a single pub by GUID
- All methods return properly typed Pub objects
- Invalid or missing fields in Firestore documents are handled gracefully
- Network errors are caught and logged
- Empty results return empty array or null (not error)
- Query results are validated against Pub interface schema
- Queries have 10-second timeout
- **MODIFIED:** Pub documents may omit `position` field (treated as `null`)
- **MODIFIED:** Pub documents with `position` must have both `lat` and `lng` as numbers
- **MODIFIED:** Pub `id` must be a non-empty string (UUID format recommended but not enforced)

#### Scenario: Retrieve Pubs with Optional Position
**ADDED:**
**Given** the Firestore `pubs` collection contains 5 pub documents  
**And** 3 pubs have `position: { lat: number, lng: number }`  
**And** 2 pubs have `position: null`  
**When** `getAllPubs()` is called  
**Then** a Promise resolves with an array of 5 Pub objects  
**And** 3 pubs have defined `position` objects  
**And** 2 pubs have `position: null`  
**And** no validation errors are thrown

#### Scenario: Retrieve Pub by GUID
**MODIFIED:**
**Given** the Firestore `pubs` collection contains a pub with id "550e8400-e29b-41d4-a716-446655440000"  
**When** `getPubById("550e8400-e29b-41d4-a716-446655440000")` is called  
**Then** a Promise resolves with the Pub object for that GUID  
**And** the Pub object contains all available fields from Firestore

#### Scenario: Handle Invalid Position Structure
**ADDED:**
**Given** a Firestore pub document has `position: { lat: 52.5 }` (missing lng)  
**When** the document is fetched and validated  
**Then** validation fails  
**And** an error is logged with details about the invalid position  
**And** the pub is excluded from results

#### Scenario: Handle Non-string Pub ID
**ADDED:**
**Given** a Firestore pub document has `id: 42` (number instead of string)  
**When** the document is fetched and validated  
**Then** validation fails  
**And** an error is logged indicating invalid ID type  
**And** the pub is excluded from results

---

## ADDED Requirements

### Requirement: GUID-based Pub Identification (REQ-FDI-007)
**Priority:** MUST  
**Category:** Functional

The system MUST use string-based GUID identifiers for all pub records to ensure global uniqueness.

**Acceptance Criteria:**
- All pub IDs are strings
- Pub IDs follow UUID format (recommended but not strictly enforced)
- Queries accept string-based pub IDs
- ID comparison is case-sensitive
- Empty or whitespace-only IDs are rejected during validation

#### Scenario: Query Pub by String ID
**Given** a pub exists with id "7c9e6679-7425-40de-944b-e07fc1f90ae7"  
**When** `getPubById("7c9e6679-7425-40de-944b-e07fc1f90ae7")` is called  
**Then** the correct pub is returned  
**And** the ID matches exactly (case-sensitive)

#### Scenario: Reject Empty ID
**Given** a Firestore pub document has `id: ""`  
**When** validation is performed  
**Then** validation fails  
**And** an error is logged  
**And** the pub is excluded from results

---

### Requirement: Position Data Validation (REQ-FDI-008)
**Priority:** MUST  
**Category:** Functional

The system MUST validate position data structure when present and allow null position values.

**Acceptance Criteria:**
- `position` field may be `null` or `undefined`
- If `position` is defined, it must be an object with `lat` and `lng` properties
- `lat` must be a number between -90 and 90 (inclusive)
- `lng` must be a number between -180 and 180 (inclusive)
- Partial position data (only lat or only lng) is rejected
- Invalid position structures are logged and excluded from results

#### Scenario: Accept Null Position
**Given** a Firestore pub document has `position: null`  
**When** validation is performed  
**Then** validation succeeds  
**And** the pub is included in results with `position: null`

#### Scenario: Accept Valid Position
**Given** a Firestore pub document has `position: { lat: 51.5074, lng: -0.1278 }`  
**When** validation is performed  
**Then** validation succeeds  
**And** the pub is included with the position data intact

#### Scenario: Reject Invalid Latitude
**Given** a Firestore pub document has `position: { lat: 100, lng: -0.1278 }`  
**When** validation is performed  
**Then** validation fails  
**And** an error is logged indicating latitude out of range  
**And** the pub is excluded from results

#### Scenario: Reject Partial Position
**Given** a Firestore pub document has `position: { lat: 51.5074 }`  
**When** validation is performed  
**Then** validation fails  
**And** an error is logged indicating missing lng  
**And** the pub is excluded from results
