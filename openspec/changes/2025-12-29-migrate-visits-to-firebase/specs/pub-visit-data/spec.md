# pub-visit-data Spec Delta

## MODIFIED Requirements

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

## REMOVED Requirements

None - all existing requirements remain, only implementation details change.
