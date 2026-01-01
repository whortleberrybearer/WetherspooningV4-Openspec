# pub-visit-data Spec Delta

This delta extends the pub-visit-data specification to document the existing rating and notes fields and ensure they are properly exposed in the UI.

## MODIFIED Requirements

### Requirement: Visit Data Structure (REQ-PVD-002)
**Priority:** MUST
**Category:** Functional

**Changes:**
- CLARIFY: Document that `rating` and `notes` fields already exist in data model
- ADD: UI must expose rating and notes fields for user input

The system MUST define and validate the Visit entity structure for both read and write operations, including rating and notes fields.

**Updated Acceptance Criteria:**
- Visit interface includes required fields: `id`, `userId`, `pubId`
- Visit interface includes optional fields: `visitedAt`, `rating`, `notes`
- `pubId` references a valid pub from the pub data source
- `userId` references the authenticated user
- **EXISTING:** `rating` is between 1 and 5 (inclusive) if provided
- **EXISTING:** `notes` is a string field for user comments
- **NEW:** `rating` is exposed in UI for user input (not just database schema)
- **NEW:** `notes` is exposed in UI for user input (not just database schema)
- `visitedAt` can be explicitly undefined to indicate unknown date
- New visit `id` values are unique and do not conflict with existing visits
- Invalid visits are logged and skipped during data load

#### Scenario: Create Visit with Rating and Notes
**ADDED:**
**Given** an authenticated user is viewing pub 42  
**And** the user wants to record their visit with feedback  
**When** the user adds a visit with rating 4 and notes "Great atmosphere, friendly staff"  
**Then** the visit is created with `rating: 4`  
**And** the visit is created with `notes: "Great atmosphere, friendly staff"`  
**And** the visit is persisted to Firestore  
**And** the rating and notes are retrievable for display

#### Scenario: Create Visit with Rating Only
**ADDED:**
**Given** an authenticated user is viewing pub 15  
**When** the user adds a visit with rating 5 but no notes  
**Then** the visit is created with `rating: 5`  
**And** the visit is created with `notes` undefined  
**And** the visit is persisted to Firestore

#### Scenario: Create Visit with Notes Only
**ADDED:**
**Given** an authenticated user is viewing pub 28  
**When** the user adds a visit with notes "Needs renovation" but no rating  
**Then** the visit is created with `rating` undefined  
**And** the visit is created with `notes: "Needs renovation"`  
**And** the visit is persisted to Firestore

#### Scenario: Validate Rating Range
**ADDED:**
**Given** an authenticated user is adding a visit  
**When** the user attempts to set rating to 6  
**Then** the system rejects the input  
**And** displays validation error message  
**When** the user attempts to set rating to 0  
**Then** the system rejects the input  
**And** displays validation error message  
**When** the user sets rating to 3  
**Then** the input is accepted

---

### Requirement: Create Visit (REQ-PVD-007)
**Priority:** MUST
**Category:** Functional

**Changes:**
- UPDATE: `addVisit` options parameter includes `rating` and `notes`
- ADD: Rating and notes are persisted to Firestore

The system MUST allow authenticated users to create a new visit record with optional rating and notes.

**Updated Acceptance Criteria:**
- **MODIFIED:** `addVisit(pubId: number, options?: { visitedAt?: string, rating?: number, notes?: string }, userId: string)` creates or updates visit
- If visit already exists for the pub, updates the existing visit instead of creating duplicate
- `visitedAt` defaults to current date/time (ISO 8601) if not provided
- `visitedAt` can be explicitly set to undefined to indicate unknown date
- **NEW:** `rating` field is optional and must be 1-5 if provided
- **NEW:** `notes` field is optional string
- **NEW:** Rating and notes are persisted to Firestore with visit record
- Creates visit with authenticated user's Firebase UID
- Generates unique string ID for new visit (Firestore auto-generated)
- Persists visit to Firestore `visits` collection
- Updates local reactive state after successful creation
- Returns Promise that resolves when operation completes
- Throws error if user is not authenticated
- **NEW:** Throws error if rating is outside 1-5 range

#### Scenario: Create Visit with All Fields
**ADDED:**
**Given** an authenticated user with UID "user-123"  
**And** the user is viewing pub 99  
**When** `addVisit(99, { visitedAt: "2026-01-01T12:00:00Z", rating: 5, notes: "Excellent!" }, "user-123")` is called  
**Then** a new visit is created in Firestore  
**And** the visit has `pubId: 99`  
**And** the visit has `userId: "user-123"`  
**And** the visit has `visitedAt: "2026-01-01T12:00:00Z"`  
**And** the visit has `rating: 5`  
**And** the visit has `notes: "Excellent!"`  
**And** local state is updated with the new visit

---

### Requirement: Update Visit (REQ-PVD-008)
**Priority:** MUST
**Category:** Functional

**Changes:**
- ADD: Update visit requirement with rating and notes support

The system MUST allow authenticated users to update an existing visit record, including rating and notes.

**Acceptance Criteria:**
- `updateVisit(pubId: number, updates: { visitedAt?: string | null, rating?: number | null, notes?: string | null })` updates existing visit
- Only updates fields provided in `updates` parameter
- **NEW:** Can update `rating` to value 1-5 or null to clear
- **NEW:** Can update `notes` to new text or null to clear
- Can update `visitedAt` to new date or null to clear
- Persists changes to Firestore
- Updates local reactive state
- Returns Promise that resolves when operation completes
- Throws error if visit does not exist
- Throws error if user is not authenticated
- **NEW:** Throws error if rating is outside 1-5 range (when not null)

#### Scenario: Update Visit Rating and Notes
**ADDED:**
**Given** an authenticated user has an existing visit for pub 42  
**And** the visit currently has no rating or notes  
**When** `updateVisit(42, { rating: 4, notes: "Nice place" })` is called  
**Then** the visit is updated in Firestore  
**And** the visit now has `rating: 4`  
**And** the visit now has `notes: "Nice place"`  
**And** other fields (visitedAt, userId, pubId) remain unchanged  
**And** local state reflects the updated visit

#### Scenario: Clear Rating and Notes
**ADDED:**
**Given** an authenticated user has a visit with rating 3 and notes "Good"  
**When** `updateVisit(42, { rating: null, notes: null })` is called  
**Then** the visit is updated in Firestore  
**And** the visit `rating` field is removed/nullified  
**And** the visit `notes` field is removed/nullified  
**And** local state reflects the cleared fields

#### Scenario: Update Only Rating
**ADDED:**
**Given** an authenticated user has a visit with notes "Great pub"  
**When** `updateVisit(42, { rating: 5 })` is called  
**Then** the visit is updated with `rating: 5`  
**And** the notes "Great pub" remain unchanged

---

## ADDED Requirements

### Requirement: Get Visit Details (REQ-PVD-009)
**Priority:** MUST
**Category:** Functional

The system MUST provide a method to retrieve complete visit details including rating and notes.

**Acceptance Criteria:**
- `getVisit(pubId: number)` method returns complete Visit object or null
- Returns Visit with all fields: id, userId, pubId, visitedAt, rating, notes
- Returns `null` if pub has not been visited
- Rating field is undefined if not set
- Notes field is undefined if not set
- Works correctly when no visit data is loaded (returns null)

#### Scenario: Get Complete Visit Details
**Given** an authenticated user has visited pub 42  
**And** the visit has rating 4 and notes "Good food"  
**When** `getVisit(42)` is called  
**Then** the method returns Visit object  
**And** the Visit has `rating: 4`  
**And** the Visit has `notes: "Good food"`  
**And** the Visit includes all other fields (id, userId, pubId, visitedAt)

#### Scenario: Get Visit Without Rating or Notes
**Given** an authenticated user has visited pub 15  
**And** the visit has no rating or notes  
**When** `getVisit(15)` is called  
**Then** the method returns Visit object  
**And** the Visit has `rating: undefined`  
**And** the Visit has `notes: undefined`

#### Scenario: Get Visit for Unvisited Pub
**Given** an authenticated user has not visited pub 99  
**When** `getVisit(99)` is called  
**Then** the method returns `null`
