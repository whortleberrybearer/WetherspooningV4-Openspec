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
- ADD: Visit documents can be created via client SDK (in addition to server-side)
- ADD: Visit ID generation strategy for client-created documents

The system MUST define and validate the Visit entity structure for both read and write operations.

**Updated Acceptance Criteria:**
- Visit interface includes required fields: `id`, `userId`, `pubId`
- Visit interface includes optional fields: `visitedAt`, `rating`, `notes`
- `pubId` references a valid pub from the pub data source
- `userId` references the authenticated user
- `rating` is between 1 and 5 (inclusive) if provided
- **NEW:** `visitedAt` can be explicitly undefined to indicate unknown date
- **NEW:** New visit `id` values are unique and do not conflict with existing visits
- Invalid visits are logged and skipped during data load

#### Scenario: Generate Unique Visit ID
**ADDED:**
**Given** the latest visit in Firestore has id 150
**When** a new visit is created
**Then** the visit is assigned id 151
**And** the id does not conflict with any existing visit

#### Scenario: Handle Visit ID Collision
**ADDED:**
**Given** two users create visits simultaneously
**And** both generate id 151
**When** the second create attempt is made
**Then** Firestore rejects the duplicate document ID
**And** the client retries with id 152

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

The system MUST allow authenticated users to create a new visit record for a pub they have visited.

**Acceptance Criteria:**
- `addVisit(pubId: number, options?: { visitedAt?: string, notes?: string })` method creates or updates visit
- If visit already exists for the pub, updates the existing visit instead of creating duplicate
- `visitedAt` defaults to current date/time (ISO 8601) if not provided
- `visitedAt` can be explicitly set to undefined to indicate unknown date
- `notes` field is optional
- Creates visit with authenticated user's Firebase UID
- Generates unique numeric ID for new visit
- Persists visit to Firestore `visits` collection
- Updates local reactive state after successful creation
- Returns Promise that resolves when operation completes
- Throws error if user is not authenticated

#### Scenario: Create Visit with Default Date
**Given** user is authenticated with UID "user123"
**And** user has not visited pub 42
**When** `addVisit(42)` is called without date parameter
**Then** a new visit is created in Firestore
**And** the visit has `visitedAt` set to current ISO 8601 timestamp
**And** the visit has `userId` set to "user123"
**And** the visit has `pubId` set to 42
**And** local state is updated to include pub 42 in visited pubs
**And** `isVisited(42)` returns true

#### Scenario: Create Visit with Specific Date
**Given** user is authenticated with UID "user123"
**When** `addVisit(42, { visitedAt: '2025-11-15T14:30:00Z' })` is called
**Then** a new visit is created with `visitedAt` set to '2025-11-15T14:30:00Z'
**And** local state is updated
**And** `getVisitDate(42)` returns '2025-11-15T14:30:00Z'

#### Scenario: Create Visit with Unknown Date
**Given** user is authenticated
**When** `addVisit(42, { visitedAt: undefined })` is called
**Then** a new visit is created without `visitedAt` field
**And** `getVisitDate(42)` returns null

#### Scenario: Create Visit with Notes
**Given** user is authenticated
**When** `addVisit(42, { notes: 'Great atmosphere!' })` is called
**Then** a new visit is created with notes field
**And** the visit is retrievable with notes intact

#### Scenario: Update Existing Visit on Re-Add
**Given** user has already visited pub 42 on '2025-11-01T10:00:00Z'
**When** `addVisit(42, { visitedAt: '2025-12-15T14:00:00Z' })` is called
**Then** the existing visit is updated (not duplicated)
**And** `getVisitDate(42)` returns '2025-12-15T14:00:00Z'
**And** only one visit exists for pub 42

#### Scenario: Reject Create When Unauthenticated
**Given** user is not authenticated
**When** `addVisit(42)` is called
**Then** an error is thrown
**And** no visit is created in Firestore
**And** local state is not modified

---

### Requirement: Update Visit (REQ-PVD-008)
**Priority:** MUST
**Category:** Functional

The system MUST allow authenticated users to modify their existing visit records.

**Acceptance Criteria:**
- `updateVisit(pubId: number, updates: { visitedAt?: string | null, notes?: string })` method updates existing visit
- Can update `visitedAt` to a new date
- Can set `visitedAt` to null/undefined to indicate unknown date
- Can update `notes` field
- Updates persist to Firestore
- Updates reflect immediately in local state
- Returns Promise that resolves when operation completes
- Throws error if visit does not exist
- Throws error if user is not authenticated

#### Scenario: Update Visit Date
**Given** user has visited pub 42 on '2025-11-15T14:30:00Z'
**When** `updateVisit(42, { visitedAt: '2025-12-01T10:00:00Z' })` is called
**Then** the visit date in Firestore is updated
**And** `getVisitDate(42)` returns '2025-12-01T10:00:00Z'

#### Scenario: Clear Visit Date
**Given** user has visited pub 42 with a specific date
**When** `updateVisit(42, { visitedAt: undefined })` is called
**Then** the `visitedAt` field is removed from the visit
**And** `getVisitDate(42)` returns null

#### Scenario: Update Visit Notes
**Given** user has visited pub 42
**When** `updateVisit(42, { notes: 'Updated notes' })` is called
**Then** the notes field is updated in Firestore
**And** the visit retains its original `visitedAt` value

#### Scenario: Reject Update of Nonexistent Visit
**Given** user has not visited pub 42
**When** `updateVisit(42, { visitedAt: '2025-12-01' })` is called
**Then** an error is thrown
**And** no changes are made to Firestore

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

The system MUST update local reactive state immediately after successful visit mutations and expose reactive state to components.

**Acceptance Criteria:**
- After `addVisit()` succeeds, `visitedPubIds` Set includes the new pub ID
- After `addVisit()` succeeds, `visits` array includes the new visit
- After `updateVisit()` succeeds, the visit in `visits` array reflects changes
- After `removeVisit()` succeeds, pub ID is removed from `visitedPubIds` Set
- After `removeVisit()` succeeds, visit is removed from `visits` array
- **NEW:** `useVisits()` composable exposes readonly `visits` array for components to watch
- **NEW:** Components can watch `visits` array with deep watching to detect updates to individual visits
- UI components that depend on visit state re-render automatically
- Map markers update colors to reflect visit status changes
- Map info windows update content when visit data changes (create, update, or remove)

#### Scenario: UI Updates After Adding Visit
**Given** the map is displaying pub 42 with an unvisited marker
**When** `addVisit(42)` completes successfully
**Then** the map marker for pub 42 changes color to indicate visited status
**And** the sidebar shows pub 42 as visited

#### Scenario: UI Updates After Removing Visit
**Given** the map is displaying pub 42 with a visited marker
**When** `removeVisit(42)` completes successfully
**Then** the map marker for pub 42 changes color to indicate unvisited status
**And** the sidebar shows pub 42 as not visited

#### Scenario: UI Updates After Updating Visit Date
**Given** the map info window is open for pub 42
**And** pub 42 was visited on "2025-11-15"
**And** the info window shows visit badge with "15/11/25"
**When** `updateVisit(42, { visitedAt: '2025-12-01T00:00:00Z' })` completes successfully
**Then** the info window visit badge updates to show "01/12/25"
**And** the update happens automatically via reactive watch on `visits` array
**And** the map marker color remains the same (still visited)

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

