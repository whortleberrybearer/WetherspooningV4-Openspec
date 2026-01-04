# Implementation Tasks

**Change ID:** `2026-01-04-enhance-pub-sync-with-updates-and-closures`  
**Status:** Draft

## Overview
This document outlines the implementation tasks for enhancing the scheduled pub sync with intelligent matching, change detection, and closure management.

## Prerequisites
- [ ] Proposal reviewed and approved
- [ ] Design document reviewed
- [ ] Spec deltas reviewed

## Implementation Tasks

### Phase 1: Matching Logic

- [ ] **Task 1.1:** Add `findMatchingPub` function to `pubSyncService.ts`
  - Input: `ScrapedPubData`, array of existing `Pub[]`
  - Output: matched `Pub | null`
  - Implement tier 1: URL matching
  - Implement tier 2: Name + TownCity matching (open pubs only)
  - Implement tier 3: Address matching (min length check)
  - Return first match found, null if no matches
  - **Validation:** Function compiles without errors
  
- [ ] **Task 1.2:** Write unit tests for `findMatchingPub`
  - Test tier 1: URL match
  - Test tier 2: Name + TownCity match
  - Test tier 3: Address match
  - Test no match (new pub)
  - Test tier priority (URL > Name+TownCity > Address)
  - Test tier 2 skips closed pubs
  - Test tier 3 skips short addresses
  - **Validation:** All tests pass with >90% coverage

### Phase 2: Change Detection

- [ ] **Task 2.1:** Add `hasDataChanged` function to `pubSyncService.ts`
  - Input: existing `Pub`, scraped `ScrapedPubData`
  - Output: `boolean`
  - Compare all mutable fields: name, url, imageUrl, address, townCity, openState, isHotel, inAirport, inTrainStation, country, county
  - Implement `positionsEqual` helper for position comparison
  - Handle null/undefined edge cases
  - **Validation:** Function compiles without errors

- [ ] **Task 2.2:** Write unit tests for `hasDataChanged`
  - Test no changes detected (all fields identical)
  - Test single field change (name, url, address, etc.)
  - Test position changes (null → value, value → null, value → different value)
  - Test position unchanged (null === null, same lat/lng)
  - Test multiple field changes
  - **Validation:** All tests pass with >90% coverage

### Phase 3: Batch Operations

- [ ] **Task 3.1:** Add `batchWritePubs` function to `pubSyncService.ts`
  - Input: array of `Pub[]`, optional `batchSize` (default 500)
  - Split array into chunks of `batchSize`
  - For each chunk, create Firestore batch
  - Use `batch.set()` with merge option
  - Commit batch
  - Log batch number and pub count
  - Add 100ms delay between batches
  - Catch and log batch commit errors (don't throw)
  - **Validation:** Function compiles without errors

- [ ] **Task 3.2:** Write unit tests for `batchWritePubs`
  - Test single batch (< 500 pubs)
  - Test multiple batches (> 500 pubs)
  - Test batch size boundary (exactly 500)
  - Test batch commit failure (mock error)
  - Test logging output
  - **Validation:** All tests pass with >90% coverage

### Phase 4: Closure Management

- [ ] **Task 4.1:** Add `markClosedPubs` function to `pubSyncService.ts`
  - Input: `Set<string>` of processed pub IDs, array of all existing `Pub[]`
  - Filter existing pubs: `openState === 'Open'` AND ID not in processed set
  - For each unmatched pub: set `openState = 'Closed'`, `url = ''`, update `lastSyncedAt`
  - Return array of pubs to close
  - Log each closure (pub ID and name)
  - **Validation:** Function compiles without errors

- [ ] **Task 4.2:** Write unit tests for `markClosedPubs`
  - Test mark single unmatched open pub as closed
  - Test skip already closed pubs
  - Test skip matched pubs (in processed set)
  - Test multiple closures
  - Test no closures (all matched)
  - **Validation:** All tests pass with >90% coverage

### Phase 5: Full Sync Data Loading

- [ ] **Task 5.1:** Add `getAllPubs` function to `pubSyncService.ts`
  - Query Firestore `pubs` collection for all documents
  - Return array of `Pub[]`
  - Log number of pubs loaded
  - Catch and throw Firestore query errors
  - **Validation:** Function compiles without errors

- [ ] **Task 5.2:** Write unit tests for `getAllPubs`
  - Test successful query (mock Firestore)
  - Test empty collection
  - Test Firestore query failure
  - **Validation:** All tests pass with >90% coverage

### Phase 6: Update Sync Logic

- [ ] **Task 6.1:** Refactor `processPubEntries` in `syncPubs.ts`
  - Accept optional `existingPubs` parameter (for full sync)
  - If `existingPubs` provided, use for matching
  - If not provided, call `getExistingPubByUrl` per entry (update sync)
  - Call `findMatchingPub` if `existingPubs` provided
  - Reuse matched pub's ID
  - Call `hasDataChanged` before queueing write
  - Track processed pub IDs in a Set
  - Collect pubs to write in an array (don't write immediately)
  - Return `{ pubsToWrite, processedIds, successCount, failureCount }`
  - **Validation:** Function compiles without errors

- [ ] **Task 6.2:** Update `runFullSync` in `syncPubs.ts`
  - At start, call `getAllPubs()` to load existing pubs
  - Pass `existingPubs` to `processPubEntries`
  - After processing, call `markClosedPubs` with `processedIds` and `existingPubs`
  - Append closed pubs to `pubsToWrite`
  - Call `batchWritePubs` with all pubs to write
  - Update logs: "Loaded X existing pubs", summary with new/updated/closed/skipped counts
  - **Validation:** Function compiles without errors

- [ ] **Task 6.3:** Update `runUpdateSync` in `syncPubs.ts`
  - Do NOT call `getAllPubs` (optimization)
  - Pass `undefined` for `existingPubs` to `processPubEntries`
  - Do NOT call `markClosedPubs` (no closure detection)
  - Call `batchWritePubs` with pubs to write
  - Update logs: summary with new/updated/skipped counts (no closures)
  - **Validation:** Function compiles without errors

### Phase 7: Integration Testing

- [ ] **Task 7.1:** Create integration test for full sync
  - Mock Firestore with sample existing pubs
  - Mock sitemap with sample entries (some matching, some new, some removed)
  - Run `runFullSync`
  - Verify: existing pubs loaded, matches found, changes detected, closures identified, batch writes called
  - **Validation:** Integration test passes

- [ ] **Task 7.2:** Create integration test for update sync
  - Mock Firestore with sample existing pubs
  - Mock sitemap with filtered entries (lastmod filter)
  - Run `runUpdateSync`
  - Verify: existing pubs NOT loaded, individual queries made, no closure detection
  - **Validation:** Integration test passes

### Phase 8: Logging Enhancements

- [ ] **Task 8.1:** Enhance logging in `syncPubs.ts`
  - Add log: "📍 Loaded X existing pubs from Firestore" (full sync)
  - Add log: "No changes detected for pub [id]" (per pub)
  - Add log: "Marked pub as closed: [id] - [name]" (per closure)
  - Update summary log: "✅ Full sync complete: X processed, Y new, Z updated, W closed, V skipped, E errors"
  - **Validation:** Logs appear correctly when running sync

### Phase 9: Code Cleanup & Documentation

- [ ] **Task 9.1:** Add JSDoc comments to all new functions
  - Document parameters, return values, and behavior
  - Include examples where helpful
  - **Validation:** All functions have JSDoc comments

- [ ] **Task 9.2:** Update README or RUN_PUB_SYNC.md
  - Document new matching logic
  - Explain change detection behavior
  - Describe closure management in full sync
  - **Validation:** Documentation is clear and accurate

### Phase 10: Final Validation

- [ ] **Task 10.1:** Run full test suite
  - Execute `npm test` in functions directory
  - Ensure all tests pass
  - Verify coverage is >80%
  - **Validation:** All tests pass, coverage meets threshold

- [ ] **Task 10.2:** Run sync manually against emulator
  - Start Firebase emulator
  - Seed emulator with sample pubs
  - Run full sync with small count (e.g., 10 pubs)
  - Verify: matching works, changes detected, closures identified, logs accurate
  - **Validation:** Sync runs successfully without errors

- [ ] **Task 10.3:** Run sync manually with real data (optional)
  - Run update sync with count=5 against production
  - Verify no unexpected behavior
  - Check Firestore for correct updates
  - **Validation:** Sync behaves as expected

## Dependencies

- **Task 1.1 → Task 6.1:** Matching function must exist before refactoring processPubEntries
- **Task 2.1 → Task 6.1:** Change detection must exist before refactoring processPubEntries
- **Task 3.1 → Task 6.2, 6.3:** Batch writing must exist before updating sync functions
- **Task 4.1 → Task 6.2:** Closure logic must exist before updating full sync
- **Task 5.1 → Task 6.2:** Data loading must exist before updating full sync
- **Phase 6 → Phase 7:** Refactored sync functions must exist before integration tests
- **Phase 1-6 → Phase 10:** All core logic must be complete before final validation

## Parallelizable Work

- **Tasks 1.1, 2.1, 3.1, 4.1, 5.1** can be implemented in parallel (independent functions)
- **Tasks 1.2, 2.2, 3.2, 4.2, 5.2** can be written in parallel after corresponding implementation tasks

## Estimated Effort

- Phase 1: 2 hours (matching logic + tests)
- Phase 2: 1.5 hours (change detection + tests)
- Phase 3: 2 hours (batch operations + tests)
- Phase 4: 1.5 hours (closure management + tests)
- Phase 5: 1 hour (data loading + tests)
- Phase 6: 3 hours (refactor sync logic)
- Phase 7: 2 hours (integration tests)
- Phase 8: 1 hour (logging enhancements)
- Phase 9: 1 hour (documentation)
- Phase 10: 1 hour (final validation)

**Total: ~16 hours**

## Success Criteria

- ✅ All unit tests pass with >80% coverage
- ✅ Integration tests pass
- ✅ Manual sync runs successfully
- ✅ Matching logic correctly identifies existing pubs (3 tiers)
- ✅ Change detection prevents unnecessary writes
- ✅ Full sync marks unmatched pubs as closed
- ✅ Batch operations manage database load
- ✅ Logs provide clear visibility into sync operations
- ✅ Code is documented and maintainable

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Test coverage insufficient | Set coverage threshold in Jest config; fail CI if not met |
| Integration tests flaky | Use deterministic mocks; avoid time-dependent assertions |
| Performance regression | Test with large datasets (1000+ pubs) in emulator |
| Incorrect closures | Log all closures; review logs before deploying to production |
