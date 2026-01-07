# pub-visit-data Spec Delta

## MODIFIED Requirements

### Requirement: Visit Data Source (REQ-PVD-001)
**Priority:** MUST  
**Category:** Functional

**Changes:**
- ADD: Visit data loading uses cached data from firebaseDataService
- ADD: Cache invalidation on visit mutations ensures UI reactivity

The system MUST load visit data from Firestore with caching support, while maintaining automatic invalidation on data changes.

**Updated Acceptance Criteria:**
- Visit data is loaded from Firestore `visits` collection via `firebaseDataService.getUserVisits(userId)`
- **ADDED:** First call to `getUserVisits()` fetches from Firestore and caches result
- **ADDED:** Subsequent calls return cached data (no Firestore read)
- **ADDED:** Cache automatically invalidated after `createVisit()`, `updateVisit()`, or `deleteVisit()`
- **ADDED:** Post-mutation, next `loadVisits()` call fetches fresh data from Firestore
- Loading is triggered by calling `firebaseDataService.getUserVisits(userId)`
- Service returns array of Visit objects
- Each Visit object includes: `id`, `userId`, `pubId`
- Optional fields: `visitedAt` (ISO date string), `rating` (1-5), `notes` (string)
- Loading errors are caught and logged
- Failed loads don't prevent application from functioning
- Empty results (no visits) are handled gracefully
- Network timeouts return empty state after 10 seconds

#### Scenario: Load Visit Data for Authenticated User (First Load)
**MODIFIED:**
**Given** a user is authenticated with Firebase UID "uid-123"  
**And** no visit data is cached  
**And** the Firestore `visits` collection contains 5 visits for "uid-123"  
**When** `loadVisits("uid-123")` is called  
**Then** the system calls `firebaseDataService.getUserVisits("uid-123")`  
**And** Firestore is queried for visits  
**And** receives an array of 5 Visit objects  
**And** visit data is cached in memory  
**And** stores the visited pub IDs in a Set for quick lookup  
**And** updates reactive state with visit data

#### Scenario: Load Visit Data from Cache (Subsequent Load)
**ADDED:**
**Given** a user is authenticated with Firebase UID "uid-123"  
**And** visit data for "uid-123" was cached from previous `loadVisits()` call  
**And** no visit mutations have occurred  
**When** `loadVisits("uid-123")` is called again  
**Then** the system calls `firebaseDataService.getUserVisits("uid-123")`  
**And** cached visit data is returned (no Firestore read)  
**And** stores the visited pub IDs in a Set for quick lookup  
**And** updates reactive state with visit data  
**And** the operation completes in <50ms

#### Scenario: Cache Invalidation After Visit Creation
**ADDED:**
**Given** visit data for user "uid-123" is cached  
**And** user creates a new visit for pub "pub-42"  
**When** `addVisit('pub-42', ...)` calls `createVisit()` and succeeds  
**Then** cache for "uid-123" is invalidated  
**And** reactive state is updated immediately with new visit  
**And** next `loadVisits("uid-123")` fetches fresh data from Firestore

#### Scenario: Cache Invalidation After Visit Update
**ADDED:**
**Given** visit data for user "uid-123" is cached  
**And** user updates rating for visit "visit-999"  
**When** `updateVisitRating('visit-999', 5)` calls `updateVisit()` and succeeds  
**Then** cache for "uid-123" is invalidated  
**And** reactive state is updated immediately with new rating  
**And** next `loadVisits("uid-123")` fetches fresh data from Firestore

#### Scenario: Cache Invalidation After Visit Deletion
**ADDED:**
**Given** visit data for user "uid-123" is cached  
**And** user removes visit "visit-888"  
**When** `removeVisit('visit-888')` calls `deleteVisit()` and succeeds  
**Then** cache for "uid-123" is invalidated  
**And** reactive state is updated immediately (visit removed)  
**And** next `loadVisits("uid-123")` fetches fresh data from Firestore

---

### Requirement: Visit State Management (REQ-PVD-005)
**Priority:** MUST  
**Category:** Functional

**Changes:**
- CLARIFY: Reactive state updates occur immediately on mutations (optimistic UI)
- CLARIFY: Cache invalidation ensures eventual consistency with Firestore

The system MUST maintain reactive visit state with immediate UI updates and eventual Firestore consistency.

**Updated Acceptance Criteria:**
- Visit state is stored in reactive refs (`visitState.visits`, `visitState.visitedPubIds`)
- **CLARIFIED:** Visit mutations update reactive state immediately (optimistic UI)
- **CLARIFIED:** Firestore write occurs in background
- **CLARIFIED:** Cache invalidation ensures next load reflects Firestore truth
- State cleared on user logout via `clearVisits()`
- Set-based lookup for O(1) `isVisited()` checks
- `getVisitDate()` returns visit date from in-memory state
- State updates trigger Vue reactivity for UI re-renders

#### Scenario: Optimistic UI Update on Visit Creation
**ADDED:**
**Given** a user is viewing pub "pub-42" detail sheet  
**And** the pub is not yet visited  
**When** user clicks "Mark as Visited"  
**Then** reactive state is updated immediately (UI shows visited checkmark)  
**And** Firestore write occurs in background  
**And** cache for user is invalidated after write succeeds  
**And** UI remains responsive during Firestore write

#### Scenario: Eventual Consistency After Cache Invalidation
**ADDED:**
**Given** a visit was created and cache was invalidated  
**And** user navigates away and returns to map page  
**When** `loadVisits()` is called  
**Then** cache is empty (was invalidated)  
**And** fresh visit data is fetched from Firestore  
**And** reactive state is updated with Firestore truth  
**And** UI reflects accurate visit status
