# Design: Sitemap-Diff Driven Scheduled Pub Sync

## Overview

This change reduces unnecessary scraping by persisting the last-seen sitemap state and using a diff to determine which pubs need to be reprocessed.

Key idea: the sitemap itself is the authoritative source of “what exists.” If it hasn’t changed, there is no need to re-scrape pubs. If it has changed, only the changed portion should be scraped.

## Architectural Decisions

### 1. Persist Sitemap Snapshot in Firestore

**Decision:** Store the latest sitemap snapshot in Firestore as an internal-only document (not readable by clients).

**Rationale:**
- No new infrastructure required.
- Snapshot size is expected to be within Firestore limits.
- Easy to read/update transactionally at the end of a successful run.

**Shape (illustrative):**
- Document: `syncState/pubsSitemap`
- Fields:
  - `hash`: string (e.g., SHA-256)
  - `fetchedAt`: timestamp
  - `entryCount`: number
  - `entries`: array of `{ url, lastmod?, imageUrl }`

**Trade-offs:**
- If sitemap grows substantially, document size could become an issue.
- Array-based snapshots require in-memory diffing.

### 2. Deterministic Hash for Fast “No-Change” Skips

**Decision:** Compute a deterministic hash over a stable serialization of sitemap entries.

**Rationale:**
- Constant-time change detection (compare hash strings).
- Avoids doing per-entry diff when nothing changed.

**Hash input:**
- Sort entries by URL.
- Serialize each as `url|lastmod|imageUrl` (with empty strings for missing fields).

### 3. Diff Algorithm

**Decision:** Use a simple set/map diff in memory:
- Key: `url` (normalized)
- Compare:
  - Added: in new, not in old
  - Removed: in old, not in new
  - Changed: same URL but `lastmod` and/or `imageUrl` differs

**Rationale:**
- Minimal, testable, deterministic.

### 4. Deletion Detection Without Full Scrape

**Decision:** Treat “removed from sitemap” as a signal to mark a pub as closed.

**Rationale:**
- Current weekly full sync exists primarily to discover removals.
- A sitemap diff provides the same signal without scraping everything.

**Guardrails:**
- Only perform removal handling when a full sitemap fetch + parse succeeded.
- Record removal actions in logs.

### 5. Preserving Identity Across URL Changes

**Problem:** A URL rename appears as “removed URL + added URL”. Closing the old and creating a new record would lose visit history.

**Decision:** For added URLs where an existing pub is not found by URL, scrape the pub and attempt a “rename match” against existing pubs using the existing three-tier strategy (URL → name+townCity → address), but without loading all pubs when possible.

**Implementation options:**
- Prefer targeted Firestore queries (e.g., `where('name','==',...)` and `where('townCity','==',...)`) to find candidates.
- Fallback to broader matching only when needed (e.g., on first run or when targeted queries are insufficient).

**Trade-offs:**
- Requires new query patterns/indexes (or careful fallback) to avoid expensive full collection reads.

## Failure and Fallback Behavior

- If there is no stored snapshot (first run), treat the run as “baseline”: process the sitemap normally and persist the initial snapshot.
- If snapshot read fails, proceed with processing rather than skipping, and log the failure.
- If snapshot write fails at the end, do not delete the prior snapshot; log the failure so the next run can retry.

## Testing Strategy

- Unit-test the hash + diff logic using fixed fixture inputs.
- Unit-test incremental selection behavior:
  - unchanged sitemap → no scraping
  - one changed entry → only one scrape
  - removed entry → closes matching pub
  - rename scenario → updates existing pub doc, no duplicate created
