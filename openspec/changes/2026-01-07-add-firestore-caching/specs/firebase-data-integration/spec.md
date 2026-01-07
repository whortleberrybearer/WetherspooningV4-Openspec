# firebase-data-integration Spec Delta

## ADDED Requirements

### Requirement: Client-Side Data Caching Service (REQ-FDI-017)
**Priority:** MUST  
**Category:** Performance

The system MUST provide a generic client-side caching service for Firestore data with configurable time-to-live (TTL) support.

**Acceptance Criteria:**
- Generic caching service implemented in `cachingService.ts`
- In-memory Map-based storage for cache entries
- Each cache entry stores data, timestamp, and TTL
- Type-safe generic interface supports any data type
- Cache keys follow pattern: `{entity}:{identifier}` (e.g., `pubs:all`, `visits:${userId}`)
- TTL specified in milliseconds
- Automatic expiry on `get()` if TTL exceeded
- Manual invalidation via `invalidate(key)` method
- Global invalidation via `invalidateAll()` method
- No persistence to localStorage or IndexedDB (memory-only)

#### Scenario: Cache Entry with Valid TTL
**Given** pub data is cached with 24-hour TTL  
**And** 10 hours have elapsed since cache write  
**When** `cachingService.get('pubs:all')` is called  
**Then** cached pub data is returned  
**And** no Firestore read occurs

#### Scenario: Cache Entry Expired TTL
**Given** pub data is cached with 24-hour TTL  
**And** 25 hours have elapsed since cache write  
**When** `cachingService.get('pubs:all')` is called  
**Then** null is returned (cache miss)  
**And** cache entry is removed from memory

#### Scenario: Manual Cache Invalidation
**Given** visit data is cached for user "uid-123"  
**When** `cachingService.invalidate('visits:uid-123')` is called  
**Then** cached entry is immediately removed  
**And** next `get('visits:uid-123')` returns null

#### Scenario: Global Cache Invalidation
**Given** multiple cache entries exist (`pubs:all`, `visits:uid-123`, `visits:uid-456`)  
**When** `cachingService.invalidateAll()` is called  
**Then** all cache entries are removed  
**And** all subsequent `get()` calls return null

---

## MODIFIED Requirements

### Requirement: Firestore Pub Data Operations (REQ-FDI-002)
**Priority:** MUST  
**Category:** Functional

**Changes:**
- ADD: `getAllPubs()` checks cache before Firestore read
- ADD: Pub data cached with 24-hour TTL
- ADD: Cache miss triggers Firestore read and cache update

The system MUST provide methods to retrieve pub data from Firestore with caching to reduce read operations, while maintaining proper error handling and data validation.

**Updated Acceptance Criteria:**
- `getAllPubs()` checks cache via `cachingService.get('pubs:all')` before Firestore read
- Cache hit returns cached data without Firestore read
- Cache miss or expired TTL triggers Firestore read
- Successful Firestore read updates cache with 24-hour TTL
- Firestore errors do not populate cache (throw/log as before)
- `getPubById(pubId)` continues direct Firestore reads (no caching for single-pub queries)
- All methods return properly typed Pub objects
- Invalid or missing fields in Firestore documents are handled gracefully
- Network errors are caught and logged
- Empty results return empty array or null (not error)
- Query results are validated against Pub interface schema
- Queries have 10-second timeout
- Console logs "Returning cached pub data" on cache hits

#### Scenario: Retrieve All Pubs with Cache Hit
**ADDED:**
**Given** pub data was cached 5 hours ago with 24-hour TTL  
**And** the Firestore `pubs` collection has not been accessed since  
**When** `getAllPubs()` is called  
**Then** cache is checked first  
**And** cached pub array is returned  
**And** no Firestore read occurs  
**And** console logs "Returning cached pub data"  
**And** the operation completes in <50ms

#### Scenario: Retrieve All Pubs with Cache Miss
**ADDED:**
**Given** no pub data is cached (first load or expired TTL)  
**When** `getAllPubs()` is called  
**Then** cache is checked and returns null  
**And** Firestore `pubs` collection is queried  
**And** query results are validated and returned  
**And** results are cached with 24-hour TTL  
**And** the operation completes within 2 seconds

#### Scenario: Firestore Error Does Not Cache
**ADDED:**
**Given** cache is empty (no cached pub data)  
**And** Firestore is unavailable (network error)  
**When** `getAllPubs()` is called  
**Then** cache check returns null  
**And** Firestore read is attempted  
**And** Firestore throws error  
**And** error is logged to console  
**And** no data is written to cache  
**And** error is thrown to caller

---

### Requirement: Firestore Visit Data Operations (REQ-FDI-003)
**Priority:** MUST  
**Category:** Functional

**Changes:**
- ADD: `getUserVisits()` checks cache before Firestore read
- ADD: Visit data cached with infinite TTL (manual invalidation only)
- ADD: Visit mutations invalidate cache for affected user

The system MUST provide methods to manage visit data in Firestore with caching and automatic invalidation on mutations.

**Updated Acceptance Criteria:**
- `getUserVisits(userId)` checks cache via `cachingService.get(\`visits:${userId}\`)` before Firestore read
- Cache hit returns cached visit data without Firestore read
- Cache miss triggers Firestore read and cache update with infinite TTL
- Visit data cached per user (isolated by userId)
- `createVisit()` invalidates cache for `visits:${userId}` after successful write
- `updateVisit()` invalidates cache for affected user after successful update
- `deleteVisit()` invalidates cache for affected user after successful delete
- Cache invalidation forces fresh Firestore read on next `getUserVisits()` call
- All methods return properly typed Visit objects
- Validation and error handling unchanged from previous behavior
- Console logs "Returning cached visit data for user {userId}" on cache hits

#### Scenario: Retrieve User Visits with Cache Hit
**ADDED:**
**Given** visit data for user "uid-123" was cached earlier in session  
**And** no visit mutations have occurred since  
**When** `getUserVisits('uid-123')` is called  
**Then** cache is checked first  
**And** cached visit array is returned  
**And** no Firestore read occurs  
**And** console logs "Returning cached visit data for user uid-123"  
**And** the operation completes in <50ms

#### Scenario: Visit Creation Invalidates Cache
**ADDED:**
**Given** visit data for user "uid-123" is cached  
**When** `createVisit({ userId: 'uid-123', pubId: 'pub-42', ... })` is called  
**And** Firestore write succeeds  
**Then** cache entry `visits:uid-123` is invalidated  
**And** next `getUserVisits('uid-123')` triggers fresh Firestore read

#### Scenario: Visit Update Invalidates Cache
**ADDED:**
**Given** visit data for user "uid-123" is cached  
**And** visit "visit-999" belongs to user "uid-123"  
**When** `updateVisit('visit-999', { rating: 5 })` is called  
**And** Firestore update succeeds  
**Then** cache entry `visits:uid-123` is invalidated  
**And** next `getUserVisits('uid-123')` triggers fresh Firestore read

#### Scenario: Visit Deletion Invalidates Cache
**ADDED:**
**Given** visit data for user "uid-123" is cached  
**And** visit "visit-888" belongs to user "uid-123"  
**When** `deleteVisit('visit-888')` is called  
**And** Firestore delete succeeds  
**Then** cache entry `visits:uid-123` is invalidated  
**And** next `getUserVisits('uid-123')` triggers fresh Firestore read

#### Scenario: Multi-User Cache Isolation
**ADDED:**
**Given** visit data for users "uid-123" and "uid-456" are both cached  
**When** `createVisit({ userId: 'uid-123', ... })` invalidates "uid-123" cache  
**Then** cache entry `visits:uid-456` remains valid  
**And** `getUserVisits('uid-456')` returns cached data  
**And** `getUserVisits('uid-123')` triggers fresh Firestore read
