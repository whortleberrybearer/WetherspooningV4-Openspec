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

The system MUST define and validate the Visit entity structure.

**Acceptance Criteria:**
- Visit interface includes required fields: `id`, `userId`, `pubId`
- Visit interface includes optional fields: `visitedAt`, `rating`, `notes`
- `pubId` references a valid pub from the pub data source
- `userId` references the authenticated user
- `rating` is between 1 and 5 (inclusive) if provided
- Invalid visits are logged and skipped during data load

#### Scenario: Process Valid Visit Data
**Given** the visits JSON contains a valid visit entry  
```json
{
  "id": 1,
  "userId": 1,
  "pubId": 5,
  "visitedAt": "2025-12-15T14:30:00Z",
  "rating": 4,
  "notes": "Great atmosphere!"
}
```
**When** the visit data is loaded  
**Then** the visit is successfully added to the user's visited pubs  
**And** `pubId` 5 is marked as visited

#### Scenario: Skip Invalid Visit Entry
**Given** the visits JSON contains an entry missing required field `pubId`  
**When** the visit data is processed  
**Then** a warning is logged to console  
**And** the invalid entry is skipped  
**And** other valid visits are still processed

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

