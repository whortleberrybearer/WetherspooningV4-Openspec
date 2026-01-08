# Implementation Tasks

## Overview
This task list implements caching for Firestore data using Firebase's built-in features: Cloud Functions with CDN caching for pub data, and Firestore SDK persistence for visit data. Tasks are ordered for incremental, testable progress.

## Pre-Implementation
- [x] Review and approve proposal.md, design.md, and spec deltas
- [x] Ensure Firebase Hosting and Cloud Functions are enabled in Firebase project
- [x] Confirm Firebase emulator is available for testing

**Testing Setup:**
Run from root directory:
1. `npm run functions:build` - Build Cloud Functions
2. `npm run dev` - Start emulators (Terminal 1)
3. `cd Wetherspooning && npm run dev` - Start frontend (Terminal 2)
4. Open http://localhost:5173

## Phase 1: Firestore SDK Persistence (Visit Data Caching)
### Task 1.1: Enable Firestore Persistence
- [x] Open `Wetherspooning/src/lib/firebase.ts`
- [x] Import `enableIndexedDbPersistence` from `firebase/firestore`
- [x] Call `enableIndexedDbPersistence(db)` after Firestore init
- [x] Add `.then()` handler to log "✅ Firestore persistence enabled"
- [x] Add `.catch()` handler for error codes: 'failed-precondition', 'unimplemented'
- [x] Log appropriate warnings for each error type
- [x] Ensure graceful fallback if persistence fails (no throw)

**Validation:**
- App loads without errors
- Console logs success message in normal case
- Console logs appropriate warning when multiple tabs open
- TypeScript compilation succeeds

**Dependencies:** None

---

### Task 1.2: Test Firestore Persistence in Browser
- [ ] Run Firebase emulator
- [ ] Load map page and trigger visit data load
- [ ] Check browser DevTools → Application → IndexedDB
- [ ] Verify Firestore persistence database exists
- [ ] Reload page and observe Network tab (no visits query on second load)
- [ ] Test multi-tab scenario (open second tab, verify warning logged)

**Validation:**
- IndexedDB contains Firestore cache
- Visit data loads from cache on reload (<20ms)
- Multi-tab warning appears correctly

**Dependencies:** Task 1.1

---

### Task 1.3: Update useAuth to Handle Cache Lifecycle
- [x] Open `Wetherspooning/src/composables/useAuth.ts`
- [x] Add comment documenting cache behavior:
  - "Pub cache in sessionStorage persists (user-agnostic data)"
  - "Firestore persistence cache remains for offline access; naturally refreshes on next session"
- [x] Verify `clearVisits()` still called on logout (clears user-specific reactive state)

**Validation:**
- Logout clears reactive visit state only
- Pub cache persists in sessionStorage (expected behavior)
- Firestore cache persists in IndexedDB (expected behavior)
- Next login refreshes visit data from Firestore

**Dependencies:** Task 1.1

---

## Phase 2: Cloud Function for Pub Data
### Task 2.1: Create Cloud Function getPubs
- [x] Create `functions/src/callable/getPubs.ts`
- [x] Import `onRequest` from `firebase-functions/v2/https`
- [x] Import Firestore methods: `getDocs`, `collection`
- [x] Implement function with CORS enabled: `{ cors: true }`
- [x] Check `req.query.nocache === '1'` for cache bypass
- [x] Set cache headers:  
  - Normal: `Cache-Control: public, max-age=86400`  
  - Bypass: `Cache-Control: no-cache, no-store, must-revalidate`
- [x] Query Firestore `pubs` collection
- [x] Return JSON: `{ pubs: [...] }` with status 200
- [x] Handle errors: log to console, return status 500 with `{ error: string }`

**Validation:**
- Function exports correctly
- TypeScript compiles without errors
- Function signature matches v2 https.onRequest

**Dependencies:** None

---

### Task 2.2: Export and Deploy Cloud Function
- [ ] Open `functions/src/index.ts`
- [ ] Export getPubs: `export { getPubs } from './callable/getPubs'`
- [ ] Build functions: `npm run build` in `functions/` directory
- [ ] Deploy function: `firebase deploy --only functions:getPubs`
- [ ] Test deployed function URL manually (browser or curl)
- [ ] Verify cache headers in response (use browser DevTools Network tab)

**Validation:**
- Function deploys successfully
- Function URL accessible
- Response includes correct cache headers
- Response contains valid pub data JSON

**Dependencies:** Task 2.1

---

### Task 2.3: Configure Firebase Hosting Rewrite
- [x] Open `firebase.json`
- [x] Add rewrite rule in `hosting.rewrites` array:  
  ```json
  {
    "source": "/api/pubs",
    "function": "getPubs"
  }
  ```
- [ ] Deploy hosting config: `firebase deploy --only hosting`
- [ ] Test `/api/pubs` endpoint via hosting URL
- [ ] Verify CDN caching by making multiple requests (check X-Cache-Status header)

**Validation:**
- `/api/pubs` route resolves to Cloud Function
- First request hits function (cache miss)
- Subsequent requests within 24h hit CDN (cache hit)

**Dependencies:** Task 2.2

---

## Phase 3: Client-Side Pub Data Service with sessionStorage
### Task 3.1: Create pubDataService
- [x] Create `Wetherspooning/src/services/pubDataService.ts`
- [x] Import `Pub` type from `firebaseDataService`
- [x] Define `SESSION_CACHE_KEY = 'pubs_cache'`
- [x] Define interface `CachedPubData { pubs: Pub[], timestamp: number }`
- [x] Implement `getAllPubs(nocache = false): Promise<Pub[]>`
- [x] Check sessionStorage for cached data (skip if `nocache === true`)
- [x] On cache hit: parse JSON, log "Returning sessionStorage cached pub data", return pubs
- [x] On cache miss or error: fetch from Cloud Function URL
- [x] Build URL: `${VITE_FIREBASE_FUNCTIONS_URL}/getPubs${nocache ? '?nocache=1' : ''}`
- [x] Fetch data, check response.ok, parse JSON
- [x] Cache in sessionStorage (skip if `nocache === true`)
- [x] Implement `clearPubCache()`: remove from sessionStorage

**Validation:**
- Service exports `getAllPubs` and `clearPubCache`
- TypeScript compiles without errors
- Function signature matches expected usage

**Dependencies:** Task 2.3

---

### Task 3.2: Add Environment Variable for Functions URL
- [x] Open `Wetherspooning/.env` (or create if missing)
- [x] Add `VITE_FIREBASE_FUNCTIONS_URL=https://your-project.cloudfunctions.net` (production URL)
- [x] For emulator: `VITE_FIREBASE_FUNCTIONS_URL=http://localhost:5001/your-project/us-central1`
- [x] Update `.env.example` with placeholder
- [ ] Document in README how to configure this variable

**Validation:**
- Environment variable accessible in code via `import.meta.env.VITE_FIREBASE_FUNCTIONS_URL`
- Variable changes based on dev vs production environment

**Dependencies:** None

---

### Task 3.3: Test pubDataService
- [x] Create `Wetherspooning/src/services/__tests__/pubDataService.test.ts`
- [x] Mock `fetch` global function
- [x] Mock sessionStorage (use jest-localstorage-mock or similar)
- [x] Test: `getAllPubs()` on sessionStorage miss fetches from function
- [x] Test: `getAllPubs()` on sessionStorage hit returns cached data without fetch
- [x] Test: `getAllPubs(true)` bypasses sessionStorage and adds `?nocache=1`
- [x] Test: Corrupted sessionStorage JSON triggers re-fetch
- [x] Test: sessionStorage persists across multiple calls in same session

**Validation:**
- All tests pass
- Coverage >90% for pubDataService.ts

**Dependencies:** Task 3.1

---

## Phase 4: Integrate pubDataService into Components
### Task 4.1: Update PubLocationsMap to Use pubDataService
- [x] Open `Wetherspooning/src/views/PubLocationsMap.vue`
- [x] Replace `import { getAllPubs } from '@/services/firebaseDataService'` with `import { getAllPubs } from '@/services/pubDataService'`
- [x] No changes to usage (function signature unchanged)
- [ ] Test in browser: load map, check Network tab for `/api/pubs` request
- [ ] Reload page: verify no network request (sessionStorage hit)

**Validation:**
- Map loads successfully with pub data
- First load triggers HTTP request to `/api/pubs`
- Subsequent loads use sessionStorage (no network request)
- Console logs indicate cache hits/misses

**Dependencies:** Task 3.1

---

## Phase 5: Testing and Validation
### Task 5.1: Integration Tests for Caching Flows
- [ ] Update `firebaseDataService.test.ts` to verify Firestore persistence behavior
- [ ] Add test: Visit data uses SDK persistence (mock IndexedDB if needed)
- [ ] Update `PubLocationsMap.test.ts` to mock pubDataService
- [ ] Test: Component loads pubs from pubDataService
- [ ] Test: Loading state updates correctly

**Validation:**
- All existing tests pass
- New cache-related tests pass
- No test flakiness due to cache state

**Dependencies:** Task 3.3, 4.1

---

### Task 5.2: E2E Testing Checklist
- [ ] **Pub Data:**
  - [ ] Load map (first global load) → verify Cloud Function invoked
  - [ ] Reload page → verify sessionStorage cache hit (<10ms)
  - [ ] Open in new tab → verify CDN cache hit (<50ms)
  - [ ] Wait 24h or manually expire CDN → verify fresh function call
  - [ ] Test `?nocache=1` bypasses all caches
- [ ] **Visit Data:**
  - [ ] Load visits → verify Firestore query
  - [ ] Reload page → verify IndexedDB cache hit (<20ms)
  - [ ] Add visit → verify immediate UI update
  - [ ] Reload → verify new visit in cache
  - [ ] Login on different device → verify cross-device data sync
- [ ] **Error Scenarios:**
  - [ ] Cloud Function fails → verify error handling
  - [ ] Firestore unavailable → verify error handling
  - [ ] Corrupted cache → verify re-fetch behavior

**Validation:**
- All scenarios pass
- No regressions in existing features

**Dependencies:** Task 5.1

---

### Task 5.3: Performance Benchmarking
- [ ] Measure initial pub load time (cold function start): target <1s
- [ ] Measure CDN cache hit: target <100ms
- [ ] Measure sessionStorage hit: target <20ms
- [ ] Measure visit cache hit (IndexedDB): target <20ms
- [ ] Record Firestore read count before and after implementation
- [ ] Document results in task comments or README

**Validation:**
- Pub data: 95%+ reduction in Firestore reads
- Visit data: 90%+ reduction in Firestore reads
- Performance targets met

**Dependencies:** Task 5.2

---

## Phase 6: Documentation and Deployment
### Task 6.1: Update Code Documentation
- [ ] Add JSDoc to `pubDataService.ts` explaining caching layers
- [ ] Add comments to `getPubs.ts` explaining cache headers
- [ ] Update `firebase.ts` with persistence behavior comments
- [ ] Document sessionStorage cache key and structure

**Validation:**
- Code review confirms documentation clarity
- No missing JSDoc on public functions

**Dependencies:** All implementation tasks

---

### Task 6.2: Update Project README
- [ ] Add section to `Wetherspooning/README.md` explaining caching architecture
- [ ] Document that pub data uses Cloud Function + CDN + sessionStorage
- [ ] Document that visit data uses Firestore SDK persistence
- [ ] Explain cache TTLs and session-scoped lifecycle
- [ ] Note `?nocache=1` parameter for admin/testing

**Validation:**
- README clearly explains caching strategy
- Developers understand cache architecture

**Dependencies:** Task 6.1

---

### Task 6.3: Deploy to Production
- [ ] Merge feature branch to main
- [ ] Deploy Cloud Function: `firebase deploy --only functions:getPubs`
- [ ] Deploy Hosting config: `firebase deploy --only hosting`
- [ ] Deploy frontend: (follow project deployment process)
- [ ] Monitor Firebase console for Firestore read reduction
- [ ] Monitor Cloud Function invocations (should be ~1 per 24h)
- [ ] Monitor error logs for cache-related issues

**Validation:**
- Deployment successful with no errors
- Firestore reads reduced by >90% in production
- No user-reported issues

**Dependencies:** All previous tasks

---

### Task 6.4: Archive Change
- [ ] Move `openspec/changes/2026-01-07-add-firestore-caching/` to `openspec/changes/archive/2026-01-07-add-firestore-caching/`
- [ ] Update affected specs in `openspec/specs/` with merged requirements from deltas
- [ ] Run `openspec validate --strict` to confirm archive consistency
- [ ] Commit archive and updated specs

**Validation:**
- `openspec validate --strict` passes
- Archived change no longer listed in `openspec list`

**Dependencies:** Task 6.3

---

## Risk Mitigation
- **Cold start latency:** CDN caching minimizes impact after first global request
- **Cache stale risk:** 24h TTL matches pub update frequency; visits are session-scoped
- **Browser compatibility:** Firestore persistence gracefully degrades if unsupported
- **Multi-tab issues:** Firestore handles multi-tab scenarios with warnings

## Rollback Plan
If caching causes production issues:
1. **Pub data:** Revert components to use `firebaseDataService.getAllPubs()` (direct Firestore reads)
2. **Visit data:** Remove `enableIndexedDbPersistence()` call in `firebase.ts`
3. **Cloud Function:** Can remain deployed (unused if clients revert)
4. No data migration needed (caches are ephemeral or auto-managed)
