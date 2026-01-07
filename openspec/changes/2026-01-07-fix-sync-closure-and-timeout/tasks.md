# Tasks: Fix Sync Closure and Timeout Issues

**Change ID:** `2026-01-07-fix-sync-closure-and-timeout`

## Task List

### 1. Fix Closure Detection Logic in Full Sync ✅ Ready
**File:** `functions/src/scheduled/syncPubs.ts`  
**Dependencies:** None  
**Validation:** Unit tests pass

- [ ] Modify `runFullSync()` to only call `markClosedPubs()` when both `start === 0` and `count === undefined`
- [ ] Add conditional check before closure detection: `if (start === 0 && count === undefined)`
- [ ] Add log message when closure detection is skipped: `console.log('Skipping closure detection (partial sync: start=X, count=Y)')`
- [ ] Update existing log messages to clarify full vs partial sync behavior
- [ ] Verify closure detection runs for complete syncs (no params)
- [ ] Verify closure detection is skipped for partial syncs (with start or count)

**Acceptance:**
- Partial syncs do not mark any pubs as closed
- Full syncs continue to mark missing pubs as closed
- Logs clearly indicate when closure detection is skipped

---

### 2. Investigate Callable Function Timeout Issue ⚠️ Investigation
**File:** `functions/src/callable/syncPubsOnDemand.ts`, `functions1/call-function.js`  
**Dependencies:** Task 1 (optional - can run in parallel)  
**Validation:** Manual testing with long-running sync

- [ ] Review Firebase callable function timeout documentation
- [ ] Check if `maxInstances: 1` configuration is needed
- [ ] Review runtime options format (v2 API)
- [ ] Check client-side timeout in `call-function.js`
- [ ] Add detailed logging at function start, during execution, at completion
- [ ] Test with 50+ pub sync to reproduce timeout
- [ ] Identify root cause (platform, config, or client issue)

**Acceptance:**
- Root cause of timeout issue is identified and documented

---

### 3. Fix Callable Function Timeout Configuration 🔧 Implementation
**File:** `functions/src/callable/syncPubsOnDemand.ts`, potentially `functions1/call-function.js`  
**Dependencies:** Task 2 (must complete investigation first)  
**Validation:** Function runs for 10 minutes successfully

- [ ] Apply fix based on investigation findings (could be one of):
  - Add `maxInstances: 1` to function configuration
  - Fix runtime options format/structure
  - Update client timeout in call-function.js
  - Add deployment configuration
- [ ] Add comprehensive logging to track execution time
- [ ] Update function configuration documentation
- [ ] Test with 100+ pub sync to verify timeout is respected

**Acceptance:**
- Callable function runs for up to 10 minutes without timing out
- Logs show function respects `timeoutSeconds: 600` configuration
- Large batch syncs (100+ pubs) complete successfully

---

### 4. Add Unit Tests for Closure Detection Logic ✅ Ready
**File:** `functions/test/services/pubSyncService.test.ts` (or create if missing)  
**Dependencies:** Task 1  
**Validation:** All tests pass

- [ ] Add test: "should mark unmatched open pubs as closed in full sync"
- [ ] Add test: "should NOT mark pubs as closed in partial sync with start position"
- [ ] Add test: "should NOT mark pubs as closed in partial sync with count limit"
- [ ] Add test: "should mark pubs as closed when count equals total sitemap entries"
- [ ] Add test: "should mark pubs as closed when start is 0 and count is undefined"
- [ ] Verify all tests pass in CI

**Acceptance:**
- Test coverage for closure detection edge cases is >90%
- All new tests pass
- No regressions in existing tests

---

### 5. Add Integration Test for Timeout Configuration 🧪 Testing
**File:** `functions/test/callable/syncPubsOnDemand.test.ts` (or create if missing)  
**Dependencies:** Task 3  
**Validation:** Test passes

- [ ] Create test that mocks long-running sync (5+ minutes)
- [ ] Verify function does not timeout before configured limit
- [ ] Verify function configuration includes correct timeout value
- [ ] Add test to verify timeout is enforced (function fails after 10 minutes)

**Acceptance:**
- Integration test verifies timeout configuration
- Test can run in emulator or CI environment

---

### 6. Update Spec Documentation 📝 Documentation
**File:** `openspec/specs/scheduled-data-sync/spec.md`  
**Dependencies:** Tasks 1, 3, 4, 5  
**Validation:** Spec validation passes

- [ ] Update REQ-SDS-003 to clarify closure detection only runs for complete syncs
- [ ] Add scenario: "Full Sync with Start Position (No Closure Detection)"
- [ ] Add scenario: "Full Sync with Count Limit (No Closure Detection)"
- [ ] Update REQ-SDS-015 to document timeout configuration requirements
- [ ] Add note about `maxInstances` or other required config
- [ ] Update acceptance criteria to reflect partial sync behavior
- [ ] Run `openspec validate scheduled-data-sync --strict`

**Acceptance:**
- Spec accurately reflects new closure detection behavior
- Spec documents timeout configuration requirements
- No validation errors

---

### 7. Update CHANGELOG and Documentation 📋 Finalization
**File:** `openspec/changes/2026-01-07-fix-sync-closure-and-timeout/CHANGELOG.md`, README if needed  
**Dependencies:** All previous tasks  
**Validation:** Documentation review

- [ ] Create CHANGELOG.md summarizing fixes
- [ ] Document breaking changes (none expected)
- [ ] Document new behavior for partial syncs
- [ ] Add troubleshooting guide for timeout issues
- [ ] Update README or RUN_PUB_SYNC.md if sync behavior changed

**Acceptance:**
- CHANGELOG clearly describes fixes
- Documentation helps users understand new behavior

---

### 8. Manual Testing and Verification ✅ QA
**File:** N/A (manual testing)  
**Dependencies:** All previous tasks  
**Validation:** Manual test checklist

- [ ] Deploy to test environment
- [ ] Run full sync (no params) and verify pubs are closed correctly
- [ ] Run partial sync (start=0, count=10) and verify no pubs are closed
- [ ] Run partial sync (start=50, count=20) and verify no pubs are closed
- [ ] Run on-demand sync with 100+ pubs and verify it completes within 10 minutes
- [ ] Check logs for correct closure detection messages
- [ ] Verify database state is correct after each test

**Acceptance:**
- All manual tests pass
- No unexpected database changes
- Logs are clear and informative

---

## Task Ordering

**Parallel Tracks:**
- Track A (Closure): Tasks 1 → 4 → 6
- Track B (Timeout): Tasks 2 → 3 → 5 → 6

**Sequential Dependencies:**
- Task 7 requires all previous tasks
- Task 8 requires all previous tasks

**Estimated Timeline:**
- Track A: 2-3 hours
- Track B: 2-4 hours (depends on investigation)
- Tasks 7-8: 1-2 hours
- **Total: 5-9 hours**
