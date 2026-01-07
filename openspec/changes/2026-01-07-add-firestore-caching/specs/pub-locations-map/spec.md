# pub-locations-map Spec Delta

## MODIFIED Requirements

### Requirement: Pub Data Loading (REQ-PLM-002)
**Priority:** MUST  
**Category:** Functional

**Changes:**
- ADD: Pub data loading uses cached data from firebaseDataService
- ADD: Initial page loads after first load use cached data (sub-100ms response)

The system MUST load pub data on component mount with caching support for improved performance.

**Updated Acceptance Criteria:**
- Component calls `getAllPubs()` from firebaseDataService on mount
- **ADDED:** First load fetches from Firestore and caches for 24 hours
- **ADDED:** Subsequent page loads (within 24h) return cached data without Firestore read
- **ADDED:** Cache automatically expires after 24 hours, triggering fresh Firestore read
- Pub data is stored in reactive ref `pubs`
- Loading state is tracked via `isLoading` ref
- Error state is tracked via `error` ref
- Empty pub list is handled gracefully (no error)
- Network errors are caught, logged, and displayed to user
- Timeout after 10 seconds displays error state

#### Scenario: Load Pub Data on First Page Load
**MODIFIED:**
**Given** the user navigates to the map page for the first time  
**And** no pub data is cached  
**When** the component mounts  
**Then** `isLoading` is set to true  
**And** `getAllPubs()` is called  
**And** Firestore is queried for pub data  
**And** pub data is cached with 24-hour TTL  
**And** pubs are stored in reactive `pubs` ref  
**And** `isLoading` is set to false  
**And** the operation completes within 2 seconds

#### Scenario: Load Pub Data on Subsequent Page Load (Cache Hit)
**ADDED:**
**Given** the user navigated to the map page 2 hours ago  
**And** pub data was cached with 24-hour TTL  
**When** the user navigates to the map page again  
**And** the component mounts  
**Then** `isLoading` is set to true  
**And** `getAllPubs()` is called  
**And** cached pub data is returned (no Firestore read)  
**And** pubs are stored in reactive `pubs` ref  
**And** `isLoading` is set to false  
**And** the operation completes in <100ms

#### Scenario: Load Pub Data After Cache Expiry
**ADDED:**
**Given** the user last loaded the map 25 hours ago  
**And** cached pub data has expired (24-hour TTL exceeded)  
**When** the user navigates to the map page  
**And** the component mounts  
**Then** `isLoading` is set to true  
**And** `getAllPubs()` is called  
**And** cache returns null (expired)  
**And** Firestore is queried for fresh pub data  
**And** fresh data is cached with new 24-hour TTL  
**And** pubs are stored in reactive `pubs` ref  
**And** `isLoading` is set to false  
**And** the operation completes within 2 seconds

#### Scenario: Pub Data Load Error Does Not Use Stale Cache
**ADDED:**
**Given** no pub data is cached (expired or first load)  
**And** Firestore is unavailable  
**When** the component mounts  
**And** `getAllPubs()` is called  
**Then** cache check returns null  
**And** Firestore query fails  
**And** error is logged to console  
**And** `error` ref is set with error message  
**And** no data is written to cache  
**And** `pubs` remains empty array
