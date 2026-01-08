# firebase-data-integration Spec Delta

## ADDED Requirements

### Requirement: Firestore SDK Persistence (REQ-FDI-017)
**Priority:** MUST  
**Category:** Performance

The system MUST enable Firestore SDK's built-in persistence to automatically cache all Firestore reads in IndexedDB.

**Acceptance Criteria:**
- `enableIndexedDbPersistence(db)` called during Firebase initialization
- Persistence enabled after Firestore database instance created
- Graceful handling if persistence fails (multi-tab or unsupported browser)
- Console logs success/failure of persistence enablement
- Cache persists across page refreshes
- All `getDocs()` and `getDoc()` calls automatically use cache
- Works offline automatically with cached data
- No explicit cache invalidation needed (SDK manages cache lifecycle)

#### Scenario: Enable Persistence on App Initialization
**Given** the application is starting up  
**And** Firebase SDK is initialized  
**When** `enableIndexedDbPersistence(db)` is called  
**Then** persistence is enabled successfully  
**And** console logs "✅ Firestore persistence enabled"  
**And** all subsequent Firestore reads check IndexedDB first

#### Scenario: Persistence Fails Due to Multiple Tabs
**Given** the user has the application open in multiple tabs  
**When** `enableIndexedDbPersistence(db)` is called in a second tab  
**Then** persistence fails with code 'failed-precondition'  
**And** console warns "⚠️ Firestore persistence failed: Multiple tabs open"  
**And** Firestore falls back to network-only mode  
**And** the application continues to function normally

#### Scenario: Persistence Unsupported in Browser
**Given** the browser does not support IndexedDB  
**When** `enableIndexedDbPersistence(db)` is called  
**Then** persistence fails with code 'unimplemented'  
**And** console warns "⚠️ Firestore persistence not supported in this browser"  
**And** Firestore falls back to network-only mode  
**And** the application continues to function normally

#### Scenario: Cached Visit Data Loads Instantly
**Given** Firestore persistence is enabled  
**And** visit data for user "uid-123" was previously loaded  
**When** the page is refreshed  
**And** `getUserVisits('uid-123')` is called  
**Then** Firestore SDK checks IndexedDB cache first  
**And** cached visit data is returned in <20ms  
**And** no network request to Firestore occurs

---

### Requirement: Cloud Function for Pub Data with CDN Caching (REQ-FDI-018)
**Priority:** MUST  
**Category:** Performance

The system MUST provide an HTTP Cloud Function that serves pub data with cache headers for CDN caching.

**Acceptance Criteria:**
- Cloud Function `getPubs` implemented in `functions/src/callable/getPubs.ts`
- Function queries Firestore `pubs` collection and returns JSON
- Returns HTTP header: `Cache-Control: public, max-age=86400` (24 hours)
- Firebase Hosting CDN caches response globally for 24 hours
- Supports `?nocache=1` query parameter to bypass cache
- When `?nocache=1` present, returns `Cache-Control: no-cache, no-store, must-revalidate`
- CORS enabled for cross-origin requests
- Returns 200 OK with `{ pubs: Pub[] }` on success
- Returns 500 Error with `{ error: string }` on Firestore failure
- Function endpoint routed via Firebase Hosting rewrite

#### Scenario: Serve Pub Data with Cache Headers
**Given** the Cloud Function `getPubs` is deployed  
**And** Firestore contains 1000 pubs  
**When** a client requests `/api/pubs`  
**Then** the function queries Firestore `pubs` collection  
**And** returns JSON: `{ pubs: [...] }` with 1000 pub objects  
**And** response includes header `Cache-Control: public, max-age=86400`  
**And** Firebase Hosting CDN caches the response for 24 hours  
**And** subsequent requests within 24h are served from CDN (<50ms)

#### Scenario: Cache Bypass with nocache Parameter
**Given** the Cloud Function `getPubs` is deployed  
**When** a client requests `/api/pubs?nocache=1`  
**Then** the function queries Firestore (bypasses any internal caching)  
**And** returns fresh pub data  
**And** response includes header `Cache-Control: no-cache, no-store, must-revalidate`  
**And** CDN does not cache the response  
**And** next request without `?nocache=1` uses normal caching

#### Scenario: CDN Cache Hit for Pub Data
**Given** user A requested `/api/pubs` 2 hours ago  
**And** CDN cached the response with 24h TTL  
**When** user B requests `/api/pubs` from a different location  
**Then** Firebase Hosting CDN serves the cached response  
**And** no Cloud Function invocation occurs  
**And** response is delivered in <50ms globally  
**And** user B receives same pub data as user A

#### Scenario: Firestore Query Error in Function
**Given** Firestore is unavailable  
**When** a client requests `/api/pubs`  
**Then** the function catches the Firestore error  
**And** logs error to console: "Error fetching pubs: {error}"  
**And** returns status 500  
**And** returns JSON: `{ error: "Failed to fetch pubs" }`  
**And** no data is cached by CDN

---

## MODIFIED Requirements

### Requirement: Firestore Pub Data Operations (REQ-FDI-002)
**Priority:** MUST  
**Category:** Functional

**Changes:**
- REMOVE: Direct `getAllPubs()` Firestore reads
- ADD: `getAllPubs()` fetches from Cloud Function via HTTP
- ADD: sessionStorage caching layer for same-session instant loads

The system MUST provide methods to retrieve pub data via Cloud Function with multi-layer caching.

**Updated Acceptance Criteria:**
- `getAllPubs()` checks sessionStorage for cached data first
- sessionStorage hit returns data in <10ms
- sessionStorage miss triggers HTTP request to `/api/pubs`
- Cloud Function request hits CDN cache if available (<50ms)
- CDN miss triggers Cloud Function execution (queries Firestore, ~300-500ms)
- Successful response cached in sessionStorage for current session
- `getAllPubs(true)` bypasses all caches (adds `?nocache=1` to URL)
- All methods return properly typed Pub objects
- sessionStorage cache cleared on logout
- Network errors are caught and thrown to caller
- Empty results handled gracefully
- Queries have 10-second timeout

#### Scenario: Retrieve Pubs with sessionStorage Hit
**ADDED:**
**Given** pub data was fetched 10 minutes ago in the same browser session  
**And** sessionStorage contains valid cached pub data  
**When** `getAllPubs()` is called  
**Then** sessionStorage is checked first  
**And** cached pub array is returned  
**And** no HTTP request occurs  
**And** console logs "Returning sessionStorage cached pub data"  
**And** the operation completes in <10ms

#### Scenario: Retrieve Pubs with CDN Hit (sessionStorage Miss)
**ADDED:**
**Given** this is a new browser session (sessionStorage empty)  
**And** Firebase CDN has cached `/api/pubs` response from 5 hours ago  
**When** `getAllPubs()` is called  
**Then** sessionStorage check returns null  
**And** HTTP request made to `/api/pubs`  
**And** Firebase CDN serves cached response  
**And** pub data is cached in sessionStorage  
**And** the operation completes in <50ms

#### Scenario: Retrieve Pubs with Cloud Function (CDN Miss)
**ADDED:**
**Given** this is the first global request in 24h (CDN cache expired)  
**When** `getAllPubs()` is called  
**Then** sessionStorage check returns null  
**And** HTTP request made to `/api/pubs`  
**And** CDN cache miss routes to Cloud Function  
**And** Cloud Function queries Firestore  
**And** Function returns pub data with cache headers  
**And** CDN caches response for 24h  
**And** pub data is cached in sessionStorage  
**And** the operation completes in 300-500ms

#### Scenario: Cache Bypass for Admin Refresh
**ADDED:**
**Given** admin needs to force refresh pub data  
**When** `getAllPubs(true)` is called  
**Then** sessionStorage is not checked  
**And** HTTP request made to `/api/pubs?nocache=1`  
**And** CDN and Cloud Function caches bypassed  
**And** Cloud Function queries Firestore directly  
**And** fresh pub data returned  
**And** data is NOT cached in sessionStorage  
**And** next `getAllPubs()` call uses normal caching

---

### Requirement: Firestore Visit Data Operations (REQ-FDI-003)
**Priority:** MUST  
**Category:** Functional

**Changes:**
- ADD: Visit data automatically cached by Firestore SDK persistence
- REMOVE: Custom cache invalidation logic (SDK handles this)
- ADD: Cache cleared on logout (session-scoped)

The system MUST provide methods to manage visit data with automatic SDK-based caching.

**Updated Acceptance Criteria:**
- `getUserVisits(userId)` uses standard Firestore `getDocs()` call
- Firestore SDK automatically checks IndexedDB cache before network
- Cache hit returns visit data in <20ms
- Cache miss queries Firestore and caches result automatically
- Visit data cached per user (Firestore SDK handles isolation)
- No explicit cache invalidation on `createVisit()`, `updateVisit()`, `deleteVisit()` needed
- Cache persists across page refreshes (IndexedDB)
- Cache cleared on logout via Firestore SDK methods (future enhancement)
- All methods return properly typed Visit objects
- Validation and error handling unchanged from previous behavior

#### Scenario: Retrieve User Visits with SDK Cache Hit
**ADDED:**
**Given** Firestore persistence is enabled  
**And** visit data for user "uid-123" was loaded earlier in current or previous session  
**When** `getUserVisits('uid-123')` is called  
**Then** Firestore SDK checks IndexedDB cache first  
**And** cached visit array is returned  
**And** no network request to Firestore occurs  
**And** the operation completes in <20ms

#### Scenario: Visit Creation Automatically Cached
**ADDED:**
**Given** Firestore persistence is enabled  
**And** user creates a new visit for pub "pub-42"  
**When** `createVisit({ userId: 'uid-123', pubId: 'pub-42', ... })` is called  
**And** Firestore write succeeds  
**Then** Firestore SDK automatically updates IndexedDB cache  
**And** next `getUserVisits('uid-123')` includes the new visit  
**And** data is served from cache (no network request)

#### Scenario: Cross-Device Changes Reflected on New Session
**ADDED:**
**Given** user adds a visit from device A  
**And** visit is written to Firestore  
**When** user logs in on device B (new session)  
**And** `getUserVisits('uid-123')` is called for the first time  
**Then** Firestore SDK queries Firestore (fresh session)  
**And** receives all visits including new one from device A  
**And** caches complete visit list in IndexedDB  
**And** subsequent calls on device B use cached data
