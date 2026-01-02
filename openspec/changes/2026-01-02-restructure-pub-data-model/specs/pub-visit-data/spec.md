# pub-visit-data Specification Delta

## MODIFIED Requirements

### Requirement: Visit Data Structure (REQ-PVD-002)
**Priority:** MUST  
**Category:** Functional

**Changes:**
- MODIFIED: `pubId` field changes from `number` to `string` to match GUID-based pub identifiers
- MODIFIED: Visit queries use string-based pub IDs

**Updated Acceptance Criteria:**
- Each Visit object includes: `id`, `userId`, `pubId`
- Visit interface includes required fields: `id`, `userId`, `pubId`
- **MODIFIED:** `pubId` is a string type matching the pub's GUID identifier
- `userId` references the authenticated user's Firebase UID
- `pubId` references a valid pub from the pub data source
- Visit data is stored in Firestore `visits` collection

#### Scenario: Create Visit with GUID Pub ID
**MODIFIED:**
**Given** an authenticated user with userId "user123"  
**And** a pub exists with id "550e8400-e29b-41d4-a716-446655440000"  
**When** the user creates a visit for the pub  
**Then** a Visit object is created with `pubId: "550e8400-e29b-41d4-a716-446655440000"`  
**And** the visit is stored in Firestore with the GUID pubId

#### Scenario: Query Visits by GUID Pub ID
**ADDED:**
**Given** a visit exists with `pubId: "7c9e6679-7425-40de-944b-e07fc1f90ae7"`  
**When** visits are queried for that pub  
**Then** the visit is found using string-based ID matching  
**And** the pubId is compared as a string

---

### Requirement: Visit Status Check (REQ-PVD-003)
**Priority:** MUST  
**Category:** Functional

**Changes:**
- MODIFIED: `isVisited(pubId: string)` now accepts string parameter instead of number

**Updated Acceptance Criteria:**
- `isVisited(pubId: string)` method returns boolean
- Returns `true` if authenticated user has visited the pub
- Returns `false` if pub has not been visited
- **MODIFIED:** Accepts string-based GUID pub ID
- Returns `false` for invalid or undefined pub IDs
- Check is performant using Set-based lookup

#### Scenario: Check Visit Status with String ID
**MODIFIED:**
**Given** the authenticated user has visited pubs with IDs ["550e8400-e29b-41d4-a716-446655440000", "7c9e6679-7425-40de-944b-e07fc1f90ae7"]  
**When** `isVisited("550e8400-e29b-41d4-a716-446655440000")` is called  
**Then** the method returns `true`

#### Scenario: Check Unvisited Pub with String ID
**MODIFIED:**
**Given** the authenticated user has visited pubs with IDs ["550e8400-e29b-41d4-a716-446655440000"]  
**When** `isVisited("a1b2c3d4-e5f6-7890-abcd-ef1234567890")` is called  
**Then** the method returns `false`

---

### Requirement: Visit Count Calculation (REQ-PVD-004)
**Priority:** MUST  
**Category:** Functional

**Changes:**
- MODIFIED: Pub ID comparisons use string matching instead of number equality

**Updated Acceptance Criteria:**
- Composable provides `countVisited(pubs: Pub[])` method
- Method calculates number of visited pubs within a given array
- Counts only pubs in the provided array
- **MODIFIED:** Uses string-based pub ID matching

#### Scenario: Calculate Visit Counts with GUID IDs
**MODIFIED:**
**Given** the authenticated user has visited pubs with IDs ["550e8400-e29b-41d4-a716-446655440000", "7c9e6679-7425-40de-944b-e07fc1f90ae7"]  
**And** a county group contains pubs with IDs ["550e8400-e29b-41d4-a716-446655440000", "a1b2c3d4-e5f6-7890-abcd-ef1234567890", "7c9e6679-7425-40de-944b-e07fc1f90ae7", "f1e2d3c4-b5a6-7890-abcd-ef1234567890"]  
**When** `countVisited(countyPubs)` is called  
**Then** the method returns 2

---

### Requirement: Visit Mutations (REQ-PVD-006)
**Priority:** MUST  
**Category:** Functional

**Changes:**
- MODIFIED: `addVisit(pubId: string, ...)` accepts string-based pub ID
- MODIFIED: `updateVisit(pubId: string, ...)` accepts string-based pub ID
- MODIFIED: `removeVisit(pubId: string)` accepts string-based pub ID

**Updated Acceptance Criteria:**
- **MODIFIED:** `addVisit(pubId: string, options?: { visitedAt?: string, rating?: number, notes?: string }, userId: string)` creates or updates visit
- Method creates new visit if none exists for pub
- Method updates existing visit if one already exists
- **MODIFIED:** pubId parameter is string type
- Visit includes authenticated user's ID
- Success updates reactive visited pub set
- Failure shows error message and does not update state

#### Scenario: Add Visit with GUID Pub ID
**MODIFIED:**
**Given** the authenticated user "user123" has not visited a pub  
**And** the pub has id "550e8400-e29b-41d4-a716-446655440000"  
**When** `addVisit("550e8400-e29b-41d4-a716-446655440000", {}, "user123")` is called  
**Then** a new visit is created in Firestore  
**And** the visit has `pubId: "550e8400-e29b-41d4-a716-446655440000"`  
**And** the visit has `userId: "user123"`

#### Scenario: Update Visit with String ID
**MODIFIED:**
**Given** the authenticated user has visited pub "550e8400-e29b-41d4-a716-446655440000"  
**When** `updateVisit("550e8400-e29b-41d4-a716-446655440000", { rating: 4 })` is called  
**Then** the visit's rating is updated to 4  
**And** the pubId remains "550e8400-e29b-41d4-a716-446655440000"

#### Scenario: Remove Visit with String ID
**MODIFIED:**
**Given** the authenticated user has visited pub "550e8400-e29b-41d4-a716-446655440000"  
**When** `removeVisit("550e8400-e29b-41d4-a716-446655440000")` is called  
**Then** the visit is deleted from Firestore  
**And** `isVisited("550e8400-e29b-41d4-a716-446655440000")` returns false

---

### Requirement: Visit Date Retrieval (REQ-PVD-006)
**Priority:** MUST  
**Category:** Functional

**Changes:**
- MODIFIED: `getVisitDate(pubId: string)` accepts string-based pub ID

**Updated Acceptance Criteria:**
- **MODIFIED:** `getVisitDate(pubId: string)` method MUST return visit date as string or null
- MUST return ISO 8601 formatted date string if visit has `visitedAt`
- MUST return null if visit exists but has no `visitedAt`
- MUST return null if no visit exists for the pub
- **MODIFIED:** pubId parameter is string type

#### Scenario: Get Visit Date with String ID
**MODIFIED:**
**Given** the authenticated user visited pub "550e8400-e29b-41d4-a716-446655440000" on "2025-12-25T14:30:00Z"  
**When** `getVisitDate("550e8400-e29b-41d4-a716-446655440000")` is called  
**Then** the method returns "2025-12-25T14:30:00Z"
