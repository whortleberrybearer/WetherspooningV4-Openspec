# Spec Delta: scheduled-data-sync

**Change ID:** `2026-01-07-fix-sync-closure-and-timeout`  
**Spec:** `scheduled-data-sync`  
**Type:** Bug Fix

## Summary

Fix critical bugs in pub sync system:
1. Prevent incorrect closure marking during partial syncs
2. Fix callable function timeout configuration to respect 10-minute limit

---

## MODIFIED Requirements

### Requirement: Full Sync Execution (REQ-SDS-003)
**Priority:** MUST  
**Category:** Functional

The system MUST support full sync mode which processes all sitemap entries, updates existing pubs, and marks missing pubs as closed **only when processing the complete sitemap**.

**Acceptance Criteria:**
- Full sync loads all existing pubs from Firestore at initialization
- Full sync processes all sitemap entries (or a specified subset via count/start parameters)
- Matching logic is applied to find existing pubs for each sitemap entry
- Change detection determines which pubs need database writes
- Matched pub IDs are tracked in a set during processing
- **[MODIFIED]** Closure detection runs **only when processing the complete sitemap** (i.e., when `start === 0` AND `count === undefined`)
- **[ADDED]** When processing a partial subset (start > 0 OR count is specified), closure detection is skipped and logged
- When closure detection runs, unmatched open pubs are marked as closed
- All writes (updates, new pubs, closures) are batched and committed to Firestore
- Function logs summary: total processed, new, updated, closed, skipped, errors

**Changes:**
- Added: Closure detection conditional logic based on sync parameters
- Added: Logging when closure detection is skipped

#### Scenario: Full Sync with Complete Sitemap (Closure Detection Runs)
**Given** the sitemap contains 100 pub entries  
**And** Firestore has 102 existing pubs (98 in sitemap, 4 removed)  
**And** no `start` or `count` parameters are provided  
**When** a full sync runs  
**Then** `start` defaults to 0 and `count` is undefined  
**And** all 102 existing pubs are loaded from Firestore  
**And** all 100 sitemap entries are processed  
**And** 98 pubs are matched to existing records  
**And** 2 new pubs are created  
**And** **closure detection runs because it's a complete sync**  
**And** 4 unmatched pubs are marked as closed  
**And** logs indicate:
- "📍 Loaded 102 existing pubs from Firestore"
- "📋 Processing 100 of 100 pubs (start: 0, count: all)"
- "✅ Full sync complete: 100 processed, 2 new, 50 updated, 4 closed, 48 skipped, 0 errors"

#### Scenario: Partial Sync with Start Position (No Closure Detection)
**Given** the sitemap contains 800 pub entries  
**And** Firestore has 795 existing pubs  
**And** a full sync is requested with `start: 50` and no `count`  
**When** the full sync runs  
**Then** all 795 existing pubs are loaded from Firestore  
**And** sitemap entries from index 50 to 799 are processed (750 pubs)  
**And** pubs are matched, created, or updated as needed  
**And** **closure detection is skipped because start > 0**  
**And** no pubs are marked as closed  
**And** logs indicate:
- "📍 Loaded 795 existing pubs from Firestore"
- "📋 Processing 750 of 800 pubs (start: 50, count: all)"
- "⚠️ Skipping closure detection (partial sync: start=50)"
- "✅ Full sync complete: 750 processed, X new, Y updated, 0 closed, Z skipped, E errors"

#### Scenario: Partial Sync with Count Limit (No Closure Detection)
**Given** the sitemap contains 800 pub entries  
**And** Firestore has 795 existing pubs  
**And** a full sync is requested with `count: 100` and `start: 0`  
**When** the full sync runs  
**Then** all 795 existing pubs are loaded from Firestore  
**And** the first 100 sitemap entries are processed  
**And** pubs are matched, created, or updated as needed  
**And** **closure detection is skipped because count is limited**  
**And** no pubs are marked as closed  
**And** logs indicate:
- "📍 Loaded 795 existing pubs from Firestore"
- "📋 Processing 100 of 800 pubs (start: 0, count: 100)"
- "⚠️ Skipping closure detection (partial sync: count=100)"
- "✅ Full sync complete: 100 processed, X new, Y updated, 0 closed, Z skipped, E errors"

#### Scenario: Partial Sync with Both Start and Count (No Closure Detection)
**Given** the sitemap contains 800 pub entries  
**And** a full sync is requested with `start: 200` and `count: 50`  
**When** the full sync runs  
**Then** sitemap entries from index 200 to 249 are processed (50 pubs)  
**And** **closure detection is skipped because both start > 0 AND count is specified**  
**And** no pubs are marked as closed  
**And** logs indicate:
- "⚠️ Skipping closure detection (partial sync: start=200, count=50)"
- "✅ Full sync complete: 50 processed, X new, Y updated, 0 closed, Z skipped, E errors"

---

### Requirement: On-Demand Sync Invocation (REQ-SDS-015)
**Priority:** MUST  
**Category:** Functional

The system MUST provide a Firebase Callable Function that allows authorized administrators to trigger pub syncs on-demand with proper timeout configuration.

**Acceptance Criteria:**
- Function is exposed as `syncPubsOnDemand` using Firebase `onCall` trigger
- Function is deployed to the same region as scheduled sync (europe-west2)
- Function has the same memory allocation as scheduled sync (256MiB)
- **[MODIFIED]** Function has a timeout of 600 seconds (10 minutes) that is properly enforced
- **[ADDED]** Function configuration includes `maxInstances: 1` to prevent concurrent execution issues
- **[ADDED]** Function runtime options are correctly configured for Firebase Functions v2 API
- Function requires authentication (caller must be signed in with Firebase Auth)
- Function execution is logged with caller UID, parameters, and execution duration
- Function returns success/failure counts to caller
- **[ADDED]** Function completes long-running syncs (100+ pubs, 5-10 minutes) without timing out prematurely
- Function can be invoked via Firebase SDK, CLI, or other Firebase functions
- Deployment includes the function in Firebase Functions export

**Changes:**
- Added: `maxInstances: 1` configuration requirement
- Added: Runtime options validation
- Added: Execution duration logging
- Clarified: Timeout must be enforced correctly for long operations

#### Scenario: Long-Running Sync Completes Within Timeout
**Given** an authenticated admin user with matching UID  
**And** a valid request with `{ mode: 'full', count: 100 }`  
**And** the sync takes approximately 8 minutes to process 100 pubs  
**When** the callable function is invoked  
**Then** the function starts execution and logs start time  
**And** the function processes all 100 pubs  
**And** the function completes successfully after ~8 minutes  
**And** the function does NOT timeout before the 10-minute limit  
**And** execution duration is logged: "Sync completed in 8m 15s"  
**And** the function returns success/failure counts  
**And** pub data is synced to Firestore

#### Scenario: Sync Exceeds Timeout and Fails
**Given** an authenticated admin user  
**And** a sync operation that takes longer than 10 minutes  
**When** the callable function is invoked  
**Then** the function runs for up to 10 minutes  
**And** after 10 minutes, the function times out  
**And** a timeout error is returned to the caller  
**And** logs indicate the timeout: "Function execution timed out after 600 seconds"

#### Scenario: Concurrent Invocations Are Prevented
**Given** an authenticated admin user invokes the function  
**And** the function is currently processing a long-running sync  
**When** the same or different admin attempts to invoke the function again  
**Then** the second invocation waits or is rejected (based on `maxInstances: 1`)  
**And** no concurrent execution occurs  
**And** the first invocation completes normally

---

## ADDED Requirements

_None - this change only modifies existing requirements_

---

## REMOVED Requirements

_None - no requirements are removed by this change_
