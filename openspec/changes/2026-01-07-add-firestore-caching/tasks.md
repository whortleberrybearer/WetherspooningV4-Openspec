# Implementation Tasks

## Overview
This task list implements client-side caching for Firestore data to reduce read operations by >90%. Tasks are ordered for incremental, testable progress.

## Pre-Implementation
- [ ] Review and approve proposal.md, design.md, and spec deltas
- [ ] Ensure all stakeholders understand caching strategy and TTL values
- [ ] Confirm Firebase emulator is available for testing

## Phase 1: Caching Service Foundation
### Task 1.1: Implement Generic Caching Service
- [ ] Create `Wetherspooning/src/services/cachingService.ts`
- [ ] Define `CacheEntry<T>` interface with `data`, `timestamp`, `ttl` fields
- [ ] Implement in-memory Map storage for cache entries
- [ ] Implement `get<T>(key: string): T | null` with TTL validation
- [ ] Implement `set<T>(key: string, data: T, ttl: number): void`
- [ ] Implement `invalidate(key: string): void`
- [ ] Implement `invalidateAll(): void`
- [ ] Add cache expiry logic in `get()` (auto-remove expired entries)
- [ ] Export singleton instance

**Validation:**
- Service exports type-safe interface
- No runtime errors on import
- TypeScript compilation succeeds

**Dependencies:** None

---

### Task 1.2: Create Cache Configuration Constants
- [ ] Add `CACHE_CONFIG` object to `cachingService.ts` or separate config file
- [ ] Define `PUBS_TTL: 24 * 60 * 60 * 1000` (24 hours)
- [ ] Define `VISITS_TTL: Infinity` (never expire)
- [ ] Document TTL values and rationale in code comments

**Validation:**
- Constants are exported and importable
- TypeScript recognizes constant values

**Dependencies:** Task 1.1

---

### Task 1.3: Unit Test Caching Service
- [ ] Create `Wetherspooning/src/services/__tests__/cachingService.test.ts`
- [ ] Test: `get()` returns null for missing key
- [ ] Test: `set()` and `get()` round-trip with valid TTL
- [ ] Test: `get()` returns null for expired TTL (mock time or use short TTL)
- [ ] Test: `invalidate()` removes entry
- [ ] Test: `invalidateAll()` clears all entries
- [ ] Test: Type safety with generic types (compile-time check)
- [ ] Test: Multiple cache keys are isolated

**Validation:**
- All tests pass
- Coverage >90% for cachingService.ts

**Dependencies:** Task 1.1, 1.2

---

## Phase 2: Pub Data Caching Integration
### Task 2.1: Refactor getAllPubs() for Caching
- [ ] Import `cachingService` into `firebaseDataService.ts`
- [ ] Define cache key constant: `PUBS_CACHE_KEY = 'pubs:all'`
- [ ] Modify `getAllPubs()` to check cache before Firestore read
- [ ] On cache hit: log "Returning cached pub data" and return cached array
- [ ] On cache miss: proceed with existing Firestore query logic
- [ ] After successful Firestore read: call `cachingService.set(PUBS_CACHE_KEY, pubs, CACHE_CONFIG.PUBS_TTL)`
- [ ] Ensure errors do not populate cache (existing error handling preserved)

**Validation:**
- `getAllPubs()` compiles without errors
- Existing unit tests for `getAllPubs()` still pass
- Manual test: first call logs Firestore read, second call logs cache hit

**Dependencies:** Task 1.1, 1.2

---

### Task 2.2: Test Pub Data Caching Behavior
- [ ] Update existing `firebaseDataService.test.ts` to mock `cachingService`
- [ ] Test: `getAllPubs()` on cache miss queries Firestore and caches result
- [ ] Test: `getAllPubs()` on cache hit returns cached data without Firestore query
- [ ] Test: Firestore error does not cache invalid data
- [ ] Test: Cache TTL expiry triggers fresh Firestore read (mock expired cache)

**Validation:**
- All tests pass
- Tests verify cache interactions (spies/mocks on cachingService)

**Dependencies:** Task 2.1

---

### Task 2.3: E2E Test Pub Caching in Browser
- [ ] Run Firebase emulator
- [ ] Load map page and observe Network tab (Firestore read occurs)
- [ ] Reload page and verify no Firestore read (cache hit)
- [ ] Check console for "Returning cached pub data" log
- [ ] Clear cache manually (`cachingService.invalidateAll()` in console) and reload
- [ ] Verify Firestore read occurs again

**Validation:**
- Observable reduction in Firestore reads
- Map loads faster on cache hits (<100ms vs ~300ms)

**Dependencies:** Task 2.1

---

## Phase 3: Visit Data Caching Integration
### Task 3.1: Refactor getUserVisits() for Caching
- [ ] Define cache key factory: `VISITS_CACHE_KEY = (userId: string) => \`visits:${userId}\``
- [ ] Modify `getUserVisits(userId)` to check cache before Firestore read
- [ ] On cache hit: log "Returning cached visit data for user {userId}" and return cached array
- [ ] On cache miss: proceed with existing Firestore query logic
- [ ] After successful Firestore read: call `cachingService.set(VISITS_CACHE_KEY(userId), visits, CACHE_CONFIG.VISITS_TTL)`
- [ ] Ensure errors return empty array (existing behavior preserved)

**Validation:**
- `getUserVisits()` compiles without errors
- Existing unit tests for `getUserVisits()` still pass

**Dependencies:** Task 1.1, 1.2

---

### Task 3.2: Add Cache Invalidation to Visit Mutations
- [ ] Modify `createVisit()` to invalidate cache after successful Firestore write
- [ ] Add `cachingService.invalidate(VISITS_CACHE_KEY(visit.userId))` after write succeeds
- [ ] Modify `updateVisit()` to fetch visit, update Firestore, then invalidate cache for `visit.userId`
- [ ] Modify `deleteVisit()` to fetch visit, delete from Firestore, then invalidate cache for `visit.userId`
- [ ] Ensure invalidation only occurs after successful Firestore operation (not on error)

**Validation:**
- Visit mutation functions compile without errors
- Manual test: create visit, observe cache invalidation, verify next load fetches fresh data

**Dependencies:** Task 3.1

---

### Task 3.3: Test Visit Data Caching and Invalidation
- [ ] Update `firebaseDataService.test.ts` to mock `cachingService` for visit operations
- [ ] Test: `getUserVisits()` on cache miss queries Firestore and caches result
- [ ] Test: `getUserVisits()` on cache hit returns cached data without Firestore query
- [ ] Test: `createVisit()` invalidates cache for affected user
- [ ] Test: `updateVisit()` invalidates cache for affected user
- [ ] Test: `deleteVisit()` invalidates cache for affected user
- [ ] Test: Multi-user isolation (user A's cache not invalidated by user B's mutation)

**Validation:**
- All tests pass
- Tests verify cache invalidation on mutations

**Dependencies:** Task 3.2

---

### Task 3.4: E2E Test Visit Caching in Browser
- [ ] Run Firebase emulator with test user account
- [ ] Load map page and trigger `loadVisits()` (observe Firestore read)
- [ ] Add a visit via UI (verify Firestore write + cache invalidation)
- [ ] Reload visit data (verify fresh Firestore read occurs)
- [ ] Navigate away and back (verify cache miss due to invalidation)
- [ ] Login/logout and verify cache isolation per user

**Validation:**
- Visit mutations trigger cache invalidation
- Next load after mutation fetches fresh data
- Cache isolation between users verified

**Dependencies:** Task 3.2

---

## Phase 4: Testing and Validation
### Task 4.1: Update Integration Tests
- [ ] Verify all existing tests in `Wetherspooning/src/services/__tests__/` pass
- [ ] Add integration test for full pub data flow (cache miss → Firestore → cache hit)
- [ ] Add integration test for full visit data flow with mutation (load → cache → mutate → invalidate → reload)
- [ ] Ensure tests do not leak cache state between test cases (call `invalidateAll()` in `beforeEach`)

**Validation:**
- All tests pass in CI/local environment
- No test flakiness due to cache state

**Dependencies:** Task 2.2, 3.3

---

### Task 4.2: Manual QA Checklist
- [ ] Load map page multiple times, verify cache hits reduce Firestore reads
- [ ] Add/update/delete visit, verify cache invalidation and fresh data on next load
- [ ] Test with multiple users (different Firebase UIDs), verify cache isolation
- [ ] Test cache expiry by manually advancing browser time or waiting 24h (pub cache)
- [ ] Test offline scenario (cached data available during network outage)
- [ ] Verify console logs show cache hits/misses as expected
- [ ] Verify no regressions in existing features (map, sidebar, filters, search)

**Validation:**
- All QA scenarios pass
- No user-facing regressions

**Dependencies:** All previous tasks

---

### Task 4.3: Performance Benchmarking
- [ ] Measure initial page load time (fresh cache vs cache hit)
- [ ] Record Firestore read count per user session (before and after caching)
- [ ] Document cache hit rate after 1 week of usage (if possible)
- [ ] Compare memory usage (Chrome DevTools) before/after caching

**Validation:**
- >90% reduction in Firestore reads
- >50% faster page loads on cache hits
- <1MB memory overhead

**Dependencies:** Task 4.2

---

## Phase 5: Documentation and Deployment
### Task 5.1: Update Code Documentation
- [ ] Add JSDoc comments to `cachingService.ts` explaining TTL behavior
- [ ] Document cache keys and TTL values in code comments
- [ ] Update `firebaseDataService.ts` comments to mention caching layer
- [ ] Add inline comments for cache invalidation logic in mutation functions

**Validation:**
- Code review confirms documentation clarity
- No missing JSDoc on public functions

**Dependencies:** All implementation tasks

---

### Task 5.2: Update Project README
- [ ] Add section to `Wetherspooning/README.md` explaining caching strategy
- [ ] Document cache TTL values and rationale
- [ ] Explain how to manually clear cache (for developers)
- [ ] Note that caching is transparent to users (no UI changes)

**Validation:**
- README clearly explains caching behavior
- Developers can understand cache architecture from README

**Dependencies:** Task 5.1

---

### Task 5.3: Deploy and Monitor
- [ ] Merge feature branch to main
- [ ] Deploy to production (or staging first)
- [ ] Monitor Firebase console for Firestore read reduction
- [ ] Monitor error logs for cache-related issues
- [ ] Collect user feedback (if any performance improvements noticed)
- [ ] Track cache hit rate via console logs (or add telemetry if needed)

**Validation:**
- Deployment successful with no errors
- Firestore reads reduced by >90% in production metrics
- No user-reported issues

**Dependencies:** All previous tasks

---

### Task 5.4: Archive Change
- [ ] Move `openspec/changes/2026-01-07-add-firestore-caching/` to `openspec/changes/archive/2026-01-07-add-firestore-caching/`
- [ ] Update affected specs in `openspec/specs/` with merged requirements from deltas
- [ ] Run `openspec validate --strict` to confirm archive consistency
- [ ] Commit archive and updated specs

**Validation:**
- `openspec validate --strict` passes
- Archived change no longer listed in `openspec list`

**Dependencies:** Task 5.3

---

## Risk Mitigation
- **Stale cache risk:** TTL set to match data update frequency (24h for pubs); manual invalidation for visits
- **Memory leak risk:** Cache is session-scoped; cleared on page refresh/logout
- **Testing complexity:** Mock cachingService in unit tests; use real cache in E2E tests

## Rollback Plan
If caching causes production issues:
1. Remove cache checks from `getAllPubs()` and `getUserVisits()` (revert to direct Firestore reads)
2. Deploy hotfix
3. No data migration needed (cache is ephemeral)
