# Proposal: Update Scheduled Pub Sync to Use Sitemap Diffs

**Change ID:** `2026-04-30-update-scheduled-sync-sitemap-diff`  
**Status:** Proposed  
**Created:** 2026-04-30

## Problem Statement

The current scheduled pub sync performs a weekly full pass across all sitemap entries in order to detect deletions (pubs removed from the sitemap). This guarantees correctness, but it also re-scrapes every pub page even when nothing has changed.

This creates unnecessary:
- Outbound requests to the Wetherspoons site (scraping load)
- Cloud Function runtime and cost
- Risk of transient failures due to rate limits/timeouts

## Proposed Solution

Persist the previously-seen sitemap state and use a sitemap diff to drive incremental processing.

On each scheduled run:
1. Fetch and parse the pub sitemap.
2. Compute a deterministic hash of the sitemap’s relevant fields.
3. Compare the hash and/or entries against the stored previous sitemap state.
4. If there are no changes, skip scraping entirely.
5. If there are changes, only scrape/process pubs whose sitemap entries were added or changed.
6. Perform a deletion check by detecting sitemap entries that were removed since the previous snapshot.

This approach keeps deletion detection while avoiding reprocessing unchanged pubs.

## Scope

### In Scope
- Store a compact representation of the prior sitemap state (and a hash) in Firestore.
- Compute a sitemap diff (added/changed/removed entries).
- Skip pub scraping when the sitemap is unchanged.
- Scrape only the pubs that require reprocessing (added/changed).
- Detect removals and mark matching pubs as closed.
- Preserve stable pub identity when a pub’s URL changes (avoid creating a new pub record when it is a rename).

### Out of Scope
- Frontend UX changes.
- Changing the scraping/parsing logic beyond what is needed to support incremental selection.
- Introducing new infrastructure (e.g., Cloud Storage buckets) unless Firestore storage proves insufficient.

## Impact Analysis

### Affected Specifications
- `scheduled-data-sync`
- `firebase-data-integration` (sync-state persistence)

### Affected Code (Expected)
- Firebase Functions scheduled sync entry point (currently `functions/src/scheduled/syncPubs.ts`)
- New/updated services for sitemap state persistence and diffing
- Unit tests for diffing and incremental behavior

### Breaking Changes
None expected. Data schema changes are additive (new internal sync-state documents/collections).

## Success Criteria

1. When the sitemap is unchanged since the previous run, the scheduled sync completes successfully without scraping any pub pages.
2. When the sitemap adds or updates a small number of entries, only those entries are scraped and synced.
3. When a sitemap entry is removed, the system marks the corresponding pub as closed without requiring a full scrape of every pub.
4. When a pub’s URL changes (old URL removed, new URL added), the system updates the existing pub record rather than creating a new one (preserving visits/history).
5. All existing tests pass and new tests cover sitemap state hashing + diffing.

## Alternatives Considered

1. **Keep weekly full sync but add early exit by comparing a sitemap hash**
   - Pro: Minimal change
   - Con: Still requires a full pass often (and would miss URL-rename identity preservation unless additional matching is added)

2. **Rely only on `<lastmod>` update sync**
   - Pro: Already implemented
   - Con: Does not detect deletions; does not reliably detect URL renames without additional logic

3. **Store sitemap snapshot in Cloud Storage instead of Firestore**
   - Pro: Avoids Firestore document limits; good for large snapshots
   - Con: Adds infrastructure; Firestore is likely sufficient for the sitemap size

## Open Questions

These items are resolved for this change:

1. **Safety full sync:** Yes. Run a full sync on the 1st of every month as a backstop for edge cases (e.g., missing/incorrect `<lastmod>`, complex URL changes).
2. **Snapshot retention:** Only the latest sitemap snapshot matters. Store/overwrite a single “latest” snapshot.
3. **Missing `<lastmod>`:** Treat entries without `<lastmod>` as always-changed during incremental runs (i.e., include them in the scrape/process set when the run is not an early-exit “no-change” run).
