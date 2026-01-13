# pub-visit-data Specification

## Purpose
TBD - created by archiving change add-visited-pubs-display. Update Purpose after archive.
## Requirements
### Requirement: Visit Data Source (REQ-PVD-001)
**Priority:** MUST  
**Category:** Functional

**Changes:**
- REMOVE: Load from static JSON file `/data/visits-sample.json`
- ADD: Load visit data from Firestore `visits` collection via Firebase service

The system MUST load visit data from Firestore when a user authenticates.

**Updated Acceptance Criteria:**
- Visit data is loaded from Firestore `visits` collection
- Loading is triggered by calling `firebaseDataService.getUserVisits(userId)`
- Service returns array of Visit objects
- Each Visit object includes: `id`, `userId`, `pubId`
- Optional fields: `visitedAt` (ISO date string), `rating` (1-5), `notes` (string)
- Loading errors are caught and logged
- Failed loads don't prevent application from functioning
- Empty results (no visits) are handled gracefully
- Network timeouts return empty state after 10 seconds

#### Scenario: Load Visit Data for Authenticated User
**MODIFIED:**
**Given** a user is authenticated with Firebase UID "uid-123"  
**And** the Firestore `visits` collection contains 5 visits for "uid-123"  
**When** `loadVisits("uid-123")` is called  
**Then** the system calls `firebaseDataService.getUserVisits("uid-123")`  
**And** receives an array of 5 Visit objects  
**And** stores the visited pub IDs in a Set for quick lookup  
**And** updates reactive state with visit data

#### Scenario: Handle Visit Data Load Failure
**MODIFIED:**
**Given** the Firestore service throws a network error  
**When** the system attempts to load visit data  
**Then** the error is caught and logged to console  
**And** the visit state remains empty (all pubs appear unvisited)  
**And** the map and sidebar continue to function normally

#### Scenario: Handle Firebase Emulator Not Running
**ADDED:**
**Given** the Firebase emulator is not running in development mode  
**When** `loadVisits(userId)` is called  
**Then** Firestore connection fails  
**And** a warning is logged: "Failed to load visits from Firestore"  
**And** visit state is set to empty  
**And** the application continues to function (zero visits shown)

---

### Requirement: Visit Data Structure (REQ-PVD-002)
**Priority:** MUST
**Category:** Functional

**Changes:**
- CLARIFY: Optional fields (rating, notes, visitedAt) can be `null`, `undefined`, or have a value
- ADD: Validation must accept both `null` and `undefined` for optional fields
- ADD: TypeScript types must allow `null | undefined` for optional fields

The system MUST define and validate the Visit entity structure for both read and write operations, handling `null` values gracefully.

**Updated Acceptance Criteria:**
- Visit interface includes required fields: `id`, `userId`, `pubId`
- Visit interface includes optional fields: `visitedAt`, `rating`, `notes`
- **NEW:** Optional fields are typed as `field?: type | null` to allow both undefined and null
- **NEW:** Firestore stores `null` for cleared optional fields
- **NEW:** Application code handles both `null` and `undefined` identically
- `pubId` references a valid pub from the pub data source
- `userId` references the authenticated user
- `rating` is between 1 and 5 (inclusive) if provided, or `null`/`undefined`
- **MODIFIED:** Validation accepts `null` for rating (previously rejected)
- **MODIFIED:** Validation accepts `null` for notes (previously only checked type when present)
- **MODIFIED:** Validation accepts `null` for visitedAt (previously only checked type when present)
- `notes` is a string field for user comments, or `null`/`undefined`
- `visitedAt` can be `null` or `undefined` to indicate unknown date
- New visit `id` values are unique and do not conflict with existing visits
- **MODIFIED:** Invalid visits are logged but `null` optional fields are not considered invalid

#### Scenario: Load Visit with Null Rating from Firestore
**ADDED:**
**Given** a visit document exists in Firestore with `rating: null`
**When** the visit is loaded via `getUserVisits()`
**Then** the visit passes validation
**And** the in-memory Visit object has `rating: null`
**And** no warning is logged about invalid rating

#### Scenario: Load Visit with Null Notes from Firestore
**ADDED:**
**Given** a visit document exists in Firestore with `notes: null`
**When** the visit is loaded via `getUserVisits()`
**Then** the visit passes validation
**And** the in-memory Visit object has `notes: null`
**And** no warning is logged about invalid notes

#### Scenario: Validate Rating is in Range When Present
**MODIFIED:**
**Given** a visit document has `rating: 6`
**When** the visit is validated
**Then** validation fails with warning "rating must be between 1 and 5"
**And** the visit is excluded from the loaded visits array
**Given** a visit document has `rating: null`
**When** the visit is validated
**Then** validation succeeds
**And** the visit is included in the loaded visits array

#### Scenario: Validate Rating is Number or Null
**ADDED:**
**Given** a visit document has `rating: "3"` (string instead of number)
**When** the visit is validated
**Then** validation fails with warning about type mismatch
**Given** a visit document has `rating: null`
**When** the visit is validated
**Then** validation succeeds

---

### Requirement: Visit Lookup (REQ-PVD-003)
**Priority:** MUST  
**Category:** Functional

The system MUST provide a method to check if a specific pub has been visited by the current user.

**Acceptance Criteria:**
- `isVisited(pubId: number)` method returns boolean
- Lookup is performant (O(1) using Set data structure)
- Returns `false` for invalid or undefined pub IDs
- Returns `false` if no visit data is loaded
- Works correctly after visit data changes

#### Scenario: Check if Pub is Visited
**Given** the authenticated user has visited pubs with IDs [5, 12, 23]  
**When** `isVisited(12)` is called  
**Then** the method returns `true`

#### Scenario: Check if Pub is Not Visited
**Given** the authenticated user has visited pubs with IDs [5, 12, 23]  
**When** `isVisited(8)` is called  
**Then** the method returns `false`

#### Scenario: Check Visit Before Data Loaded
**Given** visit data has not been loaded yet  
**When** `isVisited(5)` is called  
**Then** the method returns `false`  
**And** no error is thrown

---

### Requirement: Visit Counts (REQ-PVD-004)
**Priority:** MUST  
**Category:** Functional

The system MUST calculate the number of visited pubs within a given group of pubs.

**Acceptance Criteria:**
- `getGroupCounts(pubs: Pub[])` method returns `{ visited: number, total: number }`
- Counts only pubs in the provided array
- `visited` is the count of pubs with visited status
- `total` is the total number of pubs in the array
- Works correctly with empty arrays (returns `{ visited: 0, total: 0 }`)

#### Scenario: Calculate Visit Counts for Group
**Given** the authenticated user has visited pubs with IDs [5, 12]  
**And** a county group contains pubs with IDs [5, 8, 12, 15]  
**When** `getGroupCounts(countyPubs)` is called  
**Then** the method returns `{ visited: 2, total: 4 }`

#### Scenario: Calculate Counts for Group with No Visits
**Given** the authenticated user has visited pubs with IDs [5, 12]  
**And** a county group contains pubs with IDs [20, 21, 22]  
**When** `getGroupCounts(countyPubs)` is called  
**Then** the method returns `{ visited: 0, total: 3 }`

#### Scenario: Calculate Counts for Empty Group
**Given** the visit data is loaded  
**When** `getGroupCounts([])` is called with an empty array  
**Then** the method returns `{ visited: 0, total: 0 }`

---

### Requirement: Authentication Integration (REQ-PVD-005)
**Priority:** MUST  
**Category:** Functional

**Changes:**
- UPDATE: Use Firebase UID (string) instead of numeric userId

The system MUST only load visit data for authenticated users using their Firebase UID.

**Updated Acceptance Criteria:**
- Visit loading requires Firebase Authentication user object
- `loadVisits()` is called with `auth.currentUser.uid` (string)
- **CHANGED:** userId parameter type is `string` (was `number`)
- Visits are filtered by matching userId field in Firestore
- Unauthenticated state shows zero visits (no load attempt)
- Re-authentication triggers visit reload with new UID
- Logout clears all visit state

#### Scenario: Load Visits After Authentication
**MODIFIED:**
**Given** a user signs in with email/password  
**And** Firebase Auth returns user with UID "abc123xyz"  
**When** the application detects auth state change  
**Then** `loadVisits("abc123xyz")` is called  
**And** visits for UID "abc123xyz" are loaded from Firestore  
**And** the map and sidebar update to show visited pubs

#### Scenario: Clear Visits on Logout
**Given** a user is logged in with visits loaded  
**When** the user signs out  
**Then** the visit state is cleared  
**And** visitedPubIds Set is emptied  
**And** all pubs appear as unvisited on the map

#### Scenario: Switch Users
**ADDED:**
**Given** user A is logged in with 10 visits loaded  
**When** user A signs out and user B signs in  
**Then** user A's visits are cleared  
**And** user B's visits are loaded from Firestore  
**And** the map updates to show only user B's visited pubs

---

### Requirement: Visit Date Retrieval (REQ-PVD-006)
**Priority:** MUST  
**Category:** Functional

The system MUST provide a method to retrieve the visit date for a specific pub.

**Acceptance Criteria:**
- `getVisitDate(pubId: number)` method returns visit date as string or null
- Returns ISO date string (visitedAt field) if pub is visited
- Returns `null` if pub is not visited
- Returns `null` if visit has no visitedAt field
- Works correctly when no visit data is loaded

#### Scenario: Get Visit Date for Visited Pub
**Given** the authenticated user has visited pub 5 on "2025-11-15T14:30:00Z"  
**When** `getVisitDate(5)` is called  
**Then** the method returns "2025-11-15T14:30:00Z"

#### Scenario: Get Visit Date for Unvisited Pub
**Given** the authenticated user has not visited pub 8  
**When** `getVisitDate(8)` is called  
**Then** the method returns `null`

#### Scenario: Get Visit Date for Visit Without Date
**Given** the authenticated user has visited pub 10  
**And** the visit record has no `visitedAt` field  
**When** `getVisitDate(10)` is called  
**Then** the method returns `null`

#### Scenario: Get Visit Date When Not Authenticated
**Given** the user is not authenticated  
**When** `getVisitDate(5)` is called  
**Then** the method returns `null`

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
- CLARIFY: Setting rating or notes to `null` clears the field in Firestore
- ADD: Firestore rules validate rating range server-side

The system MUST allow authenticated users to update an existing visit record, including clearing rating and notes by setting them to `null`.

**Updated Acceptance Criteria:**
- `updateVisit(pubId: number, updates: { visitedAt?: string | null, rating?: number | null, notes?: string | null })` updates existing visit
- Only updates fields provided in `updates` parameter
- Can update `rating` to value 1-5 or null to clear
- Can update `notes` to new text or null to clear
- Can update `visitedAt` to new date or null to clear
- **NEW:** When rating is set to `null`, Firestore stores `null` (field is not deleted)
- **NEW:** When notes is set to `null`, Firestore stores `null` (field is not deleted)
- **NEW:** Application handles `null` values correctly in all operations
- Persists changes to Firestore
- Updates local reactive state
- Returns Promise that resolves when operation completes
- Throws error if visit does not exist
- Throws error if user is not authenticated
- Throws error if rating is outside 1-5 range (when not null)
- **NEW:** Firestore security rules validate rating is 1-5 or null server-side

#### Scenario: Clear Rating Sets Null in Database
**ADDED:**
**Given** an authenticated user has a visit with rating 4
**When** `updateVisit(42, { rating: null })` is called
**Then** the Firestore document is updated with `rating: null`
**And** local state is updated with `rating: null`
**And** the visit remains valid on subsequent loads

#### Scenario: Clear Notes Sets Null in Database
**ADDED:**
**Given** an authenticated user has a visit with notes "Great pub"
**When** `updateVisit(42, { notes: null })` is called
**Then** the Firestore document is updated with `notes: null`
**And** local state is updated with `notes: null`
**And** the visit remains valid on subsequent loads

#### Scenario: Firestore Rules Reject Invalid Rating
**ADDED:**
**Given** an authenticated user attempts to update a visit via Firestore API
**When** the update sets `rating: 10`
**Then** Firestore security rules reject the operation
**And** an error is returned to the client
**When** the update sets `rating: null`
**Then** Firestore security rules accept the operation
**When** the update sets `rating: 3`
**Then** Firestore security rules accept the operation

---

### Requirement: Delete Visit (REQ-PVD-009)
**Priority:** MUST
**Category:** Functional

The system MUST allow authenticated users to delete their visit records.

**Acceptance Criteria:**
- `removeVisit(pubId: number)` method deletes the visit
- Visit is removed from Firestore `visits` collection
- Local state is updated immediately
- `isVisited(pubId)` returns false after deletion
- `getVisitDate(pubId)` returns null after deletion
- Returns Promise that resolves when operation completes
- Does not throw error if visit doesn't exist (idempotent)
- Throws error if user is not authenticated

#### Scenario: Delete Existing Visit
**Given** user has visited pub 42
**And** `isVisited(42)` returns true
**When** `removeVisit(42)` is called
**Then** the visit is deleted from Firestore
**And** local state is updated
**And** `isVisited(42)` returns false
**And** `getVisitDate(42)` returns null

#### Scenario: Delete Nonexistent Visit (Idempotent)
**Given** user has not visited pub 42
**When** `removeVisit(42)` is called
**Then** no error is thrown
**And** the operation completes successfully
**And** `isVisited(42)` remains false

#### Scenario: Reject Delete When Unauthenticated
**Given** user is not authenticated
**When** `removeVisit(42)` is called
**Then** an error is thrown
**And** no changes are made to Firestore

---

### Requirement: Reactive State Updates (REQ-PVD-010)
**Priority:** MUST
**Category:** Functional

**Changes:**
- ADD: UI components must handle both `null` and `undefined` for optional fields

The system MUST update local reactive state immediately after successful visit mutations and ensure UI components safely handle `null` and `undefined` values.

**Updated Acceptance Criteria:**
- After `addVisit()` succeeds, `visitedPubIds` Set includes the new pub ID
- After `addVisit()` succeeds, `visits` array includes the new visit
- After `updateVisit()` succeeds, the visit in `visits` array reflects changes
- After `removeVisit()` succeeds, pub ID is removed from `visitedPubIds` Set
- After `removeVisit()` succeeds, visit is removed from `visits` array
- `useVisits()` composable exposes readonly `visits` array for components to watch
- Components can watch `visits` array with deep watching to detect updates to individual visits
- **NEW:** UI components use optional chaining (`visit?.rating`) and nullish checks to safely access optional fields
- **NEW:** UI components treat `null` and `undefined` identically for display purposes
- **NEW:** Rating display only shows stars when `visit?.rating` is a number (handles null and undefined)
- **NEW:** Notes display only shows content when `visit?.notes` is a truthy non-empty string (handles null and undefined)
- UI components that depend on visit state re-render automatically
- Map markers update colors to reflect visit status changes
- Map info windows update content when visit data changes (create, update, or remove)

#### Scenario: Display Rating with Null-Safe Check
**ADDED:**
**Given** the map info window is displaying a visited pub
**And** the visit has `rating: null`
**When** the info window renders the rating display
**Then** no stars are displayed (conditional check prevents rendering)
**And** no JavaScript errors occur
**Given** the visit has `rating: undefined`
**When** the info window renders the rating display
**Then** no stars are displayed (conditional check prevents rendering)
**And** no JavaScript errors occur
**Given** the visit has `rating: 4`
**When** the info window renders the rating display
**Then** 4 filled stars and 1 empty star are displayed

#### Scenario: Display Notes with Null-Safe Check
**ADDED:**
**Given** the map info window is displaying a visited pub
**And** the visit has `notes: undefined`
**When** the info window renders the notes section
**Then** no notes preview is displayed
**And** no JavaScript errors occur
**Given** the visit has `notes: null`
**When** the info window renders the notes section
**Then** no notes preview is displayed
**And** no JavaScript errors occur
**Given** the visit has `notes: ""`  (empty string)
**When** the info window renders the notes section
**Then** no notes preview is displayed
**And** no JavaScript errors occur
**Given** the visit has `notes: "Great atmosphere"`
**When** the info window renders the notes section
**Then** the notes preview displays "Great atmosphere"

---

### Requirement: Error Handling for Mutations (REQ-PVD-011)
**Priority:** MUST
**Category:** Functional

The system MUST handle mutation errors gracefully without corrupting local state.

**Acceptance Criteria:**
- Network errors during mutations are caught and logged
- User-friendly error messages are provided for common failures
- Local state is not modified if mutation fails
- Failed mutations can be retried
- Concurrent modification errors are handled (last-write-wins)

#### Scenario: Handle Network Error on Create
**Given** user is authenticated
**And** the network is disconnected
**When** `addVisit(42)` is called
**Then** a network error is caught
**And** an error message is returned to the user
**And** local state remains unchanged (pub 42 not marked as visited)
**And** the operation can be retried when network reconnects

#### Scenario: Handle Permission Denied Error
**Given** Firestore security rules reject the operation
**When** `addVisit(42)` is called
**Then** a permission error is caught
**And** an error message "Unable to save visit" is shown
**And** local state is not modified

---

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

### Requirement: Firestore Security Rules for Visit Validation (REQ-PVD-013)
**Priority:** MUST
**Category:** Security

The system MUST validate visit field constraints at the Firestore security rules level to prevent invalid data from being written to the database.

**Acceptance Criteria:**
- Firestore rules validate `rating` is a number between 1-5 (inclusive) or `null`
- Firestore rules validate `notes` is a string or `null`
- Firestore rules validate `visitedAt` is a string or `null`
- Firestore rules reject documents with invalid types for these fields
- Firestore rules reject documents with rating values outside 1-5 range
- Rules apply to both `create` and `update` operations
- Rules allow visits with all optional fields set to `null`

#### Scenario: Rules Accept Valid Rating Values
**Given** an authenticated user creates a visit document
**When** the document has `rating: 3`
**Then** Firestore rules accept the write
**When** the document has `rating: null`
**Then** Firestore rules accept the write
**When** the document has no rating field
**Then** Firestore rules accept the write

#### Scenario: Rules Reject Invalid Rating Values
**Given** an authenticated user creates a visit document
**When** the document has `rating: 0`
**Then** Firestore rules reject the write with permission error
**When** the document has `rating: 6`
**Then** Firestore rules reject the write with permission error
**When** the document has `rating: "3"` (string)
**Then** Firestore rules reject the write with permission error

#### Scenario: Rules Accept Null Notes
**Given** an authenticated user updates a visit document
**When** the update sets `notes: null`
**Then** Firestore rules accept the write
**When** the update sets `notes: "Some feedback"`
**Then** Firestore rules accept the write
**When** the update sets `notes: 123` (number)
**Then** Firestore rules reject the write with permission error

