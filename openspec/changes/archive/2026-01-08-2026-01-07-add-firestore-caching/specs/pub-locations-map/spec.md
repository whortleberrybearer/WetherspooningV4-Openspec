# pub-locations-map Spec Delta

## MODIFIED Requirements

### Requirement: Pub Data Loading (REQ-PLM-002)
**Priority:** MUST  
**Category:** Functional

**Changes:**
- ADD: Pub data loaded via Cloud Function with CDN caching
- ADD: sessionStorage provides instant loads within same session
- ADD: Multi-layer cache (sessionStorage → CDN → Cloud Function → Firestore)

The system MUST load pub data via Cloud Function with multi-layer caching for optimal performance.

**Updated Acceptance Criteria:**
- Component calls `getAllPubs()` from pubDataService on mount
- **ADDED:** `getAllPubs()` checks sessionStorage first
- **ADDED:** sessionStorage hit returns data in <10ms
- **ADDED:** sessionStorage miss triggers HTTP request to Cloud Function
- **ADDED:** Cloud Function request hits Firebase CDN cache if available (<50ms globally)
- **ADDED:** CDN miss triggers Cloud Function execution (queries Firestore, ~300-500ms)
- **ADDED:** Cloud Function returns data with `Cache-Control: public, max-age=86400` header
- **ADDED:** CDN caches response for 24 hours
- **ADDED:** Response cached in sessionStorage for current session
- Pub data is stored in reactive ref `pubs`
- Loading state is tracked via `isLoading` ref
- Error state is tracked via `error` ref
- Empty pub list is handled gracefully (no error)
- Network errors are caught, logged, and displayed to user
- Timeout after 10 seconds displays error state

#### Scenario: Load Pub Data on First Page Load (First Global Request in 24h)
**MODIFIED:**
**Given** the user navigates to the map page  
**And** this is the first global request in 24h (CDN cache expired)  
**When** the component mounts  
**Then** `isLoading` is set to true  
**And** `getAllPubs()` checks sessionStorage (empty)  
**And** HTTP request made to Cloud Function `/api/pubs`  
**And** CDN cache miss routes to function  
**And** Cloud Function queries Firestore `pubs` collection  
**And** Function returns pub data with cache headers  
**And** CDN caches response for 24h  
**And** sessionStorage caches response  
**And** pubs are stored in reactive `pubs` ref  
**And** `isLoading` is set to false  
**And** the operation completes within 1 second (cold function start)

#### Scenario: Load Pub Data with CDN Cache Hit
**ADDED:**
**Given** another user or same user in new session navigates to map  
**And** CDN cached pub data from previous request within 24h  
**When** the component mounts  
**Then** `isLoading` is set to true  
**And** `getAllPubs()` checks sessionStorage (empty in new session)  
**And** HTTP request made to `/api/pubs`  
**And** Firebase CDN serves cached response  
**And** no Cloud Function invocation occurs  
**And** sessionStorage caches response  
**And** pubs are stored in reactive `pubs` ref  
**And** `isLoading` is set to false  
**And** the operation completes in <100ms

#### Scenario: Load Pub Data with sessionStorage Hit (Same Session)
**ADDED:**
**Given** the user navigated to the map 5 minutes ago  
**And** sessionStorage contains cached pub data  
**When** the user navigates to the map again in same session  
**And** the component mounts  
**Then** `isLoading` is set to true  
**And** `getAllPubs()` checks sessionStorage  
**And** cached pub data is returned immediately  
**And** no HTTP request occurs  
**And** pubs are stored in reactive `pubs` ref  
**And** `isLoading` is set to false  
**And** the operation completes in <20ms

#### Scenario: Cloud Function Error Does Not Cache
**ADDED:**
**Given** CDN cache is empty (expired or first request)  
**And** Firestore is unavailable  
**When** the component mounts  
**And** `getAllPubs()` is called  
**Then** sessionStorage check returns null  
**And** HTTP request made to Cloud Function  
**And** Cloud Function queries Firestore and fails  
**And** Function returns 500 error  
**And** error is logged to console  
**And** `error` ref is set with error message  
**And** no data is cached in sessionStorage or CDN  
**And** `pubs` remains empty array
