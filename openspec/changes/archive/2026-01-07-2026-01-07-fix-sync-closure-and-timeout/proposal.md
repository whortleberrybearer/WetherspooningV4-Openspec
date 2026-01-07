# Proposal: Fix Sync Closure and Timeout Issues

**Change ID:** `2026-01-07-fix-sync-closure-and-timeout`  
**Date:** 2026-01-07  
**Status:** Draft

## Problem Statement

The pub sync system has two critical bugs that prevent proper operation:

1. **Incorrect closure behavior in partial syncs**: When running a full sync with `start` or `count` parameters (processing only a subset of pubs), the system incorrectly marks pubs as closed if they weren't in the processed subset. This happens because `markClosedPubs()` is called after processing any subset of sitemap entries, not just complete syncs.

   **Example:** If syncing pubs 0-50 out of 800, the remaining 750 open pubs get marked as closed because they weren't in the `processedIds` set.

2. **Callable function timeout not respected**: The `syncPubsOnDemand` callable function is configured with `timeoutSeconds: 600` (10 minutes) but times out after less than 1 minute. This prevents successful completion of on-demand sync operations, particularly for larger batch sizes.

## Solution Overview

### Issue 1: Closure Detection
Only invoke `markClosedPubs()` when processing the **complete** sitemap (i.e., when both `start === 0` and `count === undefined`). Add a parameter to `runFullSync()` to track whether closure detection should run.

### Issue 2: Timeout Configuration
Investigate and fix the timeout configuration. The issue may be:
- Missing `maxInstances: 1` configuration allowing concurrent invocations
- Incorrect runtime options format
- Missing deployment configuration
- Client-side timeout overriding server-side timeout

The fix will ensure the 10-minute timeout is properly enforced for long-running sync operations.

## Impact Assessment

### User Impact
- **High**: Administrators cannot reliably run partial syncs for testing or debugging without corrupting the database
- **High**: On-demand syncs fail prematurely, preventing manual data refresh

### Technical Impact
- **Medium**: Requires changes to sync service and callable function
- **Low**: No database schema changes required
- **Low**: No breaking changes to callable function interface

### Risk Assessment
- **Low Risk**: Changes are isolated to sync logic
- **Testing**: Can be verified with existing test fixtures
- **Rollback**: Easy - revert deployment if issues occur

## Alternatives Considered

1. **Always load all pubs for partial syncs**: Would work but defeats the performance benefit of partial syncs
2. **Remove partial sync capability**: Too restrictive - useful for testing and debugging
3. **Add explicit flag for closure detection**: Considered but implicit detection based on parameters is cleaner

## Dependencies

- No external dependencies
- No changes to other specs required
- Compatible with existing database schema

## Affected Capabilities

- **scheduled-data-sync**: Core spec affected by both issues
- No other specs directly affected

## Questions & Open Issues

1. ✅ **Resolved**: Should we add explicit validation to prevent accidental closure when using partial sync? 
   - **Answer**: Implicit detection based on parameters is sufficient and cleaner.

2. ⚠️ **Investigation Required**: What is the root cause of the timeout issue?
   - Could be `maxInstances` configuration
   - Could be client-side timeout in call-function.js
   - Could be Firebase platform issue

3. ⚠️ **To Determine**: Should we add logging to indicate when closure detection is skipped?
   - **Recommendation**: Yes, add log message like "Skipping closure detection (partial sync: start=X, count=Y)"

## Success Criteria

- [ ] Partial syncs (with `start` or `count`) do not mark pubs as closed
- [ ] Full syncs (no `start` or `count`) continue to mark missing pubs as closed
- [ ] On-demand sync completes successfully within 10-minute timeout for large batches
- [ ] All existing tests pass
- [ ] New tests verify closure detection behavior
- [ ] New tests verify timeout configuration
- [ ] Documentation updated to clarify partial sync behavior
