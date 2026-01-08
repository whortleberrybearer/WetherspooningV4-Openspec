# pub-visit-data Spec Delta

## MODIFIED Requirements

### Requirement: Visit Data Source (REQ-PVD-001)
**Priority:** MUST  
**Category:** Functional

**Changes:**
- ADD: Visit data automatically cached by Firestore SDK persistence
- ADD: Cache is session-scoped (cleared on logout)
- REMOVE: Custom cache invalidation logic

The system MUST load visit data from Firestore with automatic SDK-based persistence caching.

**Updated Acceptance Criteria:**
- Visit data is loaded from Firestore `visits` collection via `firebaseDataService.getUserVisits(userId)`
- **ADDED:** Firestore SDK persistence automatically caches all visit reads in IndexedDB
- **ADDED:** First call queries Firestore and caches result
- **ADDED:** Subsequent calls return IndexedDB cached data (<20ms)
- **ADDED:** Cache persists across page refreshes
- **ADDED:** Cache cleared on logout (session-scoped lifecycle)
- **ADDED:** Cross-device changes reflected on new session (cache refreshed)
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
**And** Firestore persistence is enabled  
**And** no visit data is cached (first session)  
**And** the Firestore `visits` collection contains 5 visits for "uid-123"  
**When** `loadVisits("uid-123")` is called  
**Then** the system calls `firebaseDataService.getUserVisits("uid-123")`  
**And** Firestore SDK checks IndexedDB cache (empty)  
**And** Firestore is queried for visits  
**And** receives an array of 5 Visit objects  
**And** Firestore SDK caches visit data in IndexedDB  
**And** stores the visited pub IDs in a Set for quick lookup  
**And** updates reactive state with visit data

#### Scenario: Load Visit Data from SDK Cache (Subsequent Load)
**ADDED:**
**Given** a user is authenticated with Firebase UID "uid-123"  
**And** Firestore persistence is enabled  
**And** visit data for "uid-123" was previously cached by Firestore SDK  
**When** `loadVisits("uid-123")` is called again (same or new session)  
**Then** the system calls `firebaseDataService.getUserVisits("uid-123")`  
**And** Firestore SDK returns cached data from IndexedDB  
**And** no network request to Firestore occurs  
**And** stores the visited pub IDs in a Set for quick lookup  
**And** updates reactive state with visit data  
**And** the operation completes in <20ms

#### Scenario: Visit Data Auto-Updated by SDK After Mutation
**ADDED:**
**Given** visit data for user "uid-123" is cached in IndexedDB  
**And** user creates a new visit for pub "pub-42"  
**When** `addVisit('pub-42', ...)` calls `createVisit()` and succeeds  
**Then** Firestore SDK automatically updates IndexedDB cache  
**And** reactive state is updated immediately with new visit  
**And** next `loadVisits("uid-123")` returns data including new visit from cache  
**And** no network request occurs

#### Scenario: Fresh Data on New Session (Cross-Device Sync)
**ADDED:**
**Given** user adds visit from device A (written to Firestore)  
**When** user logs in on device B (new session)  
**And** `loadVisits("uid-123")` is called for the first time on device B  
**Then** Firestore SDK queries Firestore (new session = cache refresh)  
**And** receives all visits including new one from device A  
**And** caches complete visit list in IndexedDB  
**And** subsequent calls on device B use cached data

---

### Requirement: Visit State Management (REQ-PVD-005)
**Priority:** MUST  
**Category:** Functional

**Changes:**
- CLARIFY: Reactive state updates occur immediately on mutations (optimistic UI)
- CLARIFY: Firestore SDK persistence ensures data consistency

The system MUST maintain reactive visit state with immediate UI updates and automatic SDK cache management.

**Updated Acceptance Criteria:**
- Visit state is stored in reactive refs (`visitState.visits`, `visitState.visitedPubIds`)
- **CLARIFIED:** Visit mutations update reactive state immediately (optimistic UI)
- **CLARIFIED:** Firestore write occurs in background
- **CLARIFIED:** Firestore SDK persistence automatically updates cache after successful write
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
**And** Firestore SDK updates IndexedDB cache after write succeeds  
**And** UI remains responsive during Firestore write

#### Scenario: Eventual Consistency After Cache Invalidation
**ADDED:**
**Given** a visit was created and IndexedDB cache was updated  
**And** user navigates away and returns to map page  
**When** `loadVisits()` is called  
**Then** Firestore SDK returns data from IndexedDB cache  
**And** reactive state is updated with cached data  
**And** UI reflects accurate visit status  
**And** no network request occurs
