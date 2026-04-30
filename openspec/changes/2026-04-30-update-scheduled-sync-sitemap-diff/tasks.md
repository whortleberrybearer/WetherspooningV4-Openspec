# Implementation Tasks

**Change ID:** `2026-04-30-update-scheduled-sync-sitemap-diff`

## Task Breakdown

### 1. Add Sitemap State Persistence
- [ ] Add a Firestore document for storing the latest sitemap snapshot (e.g., `syncState/pubsSitemap`).
- [ ] Implement read/write helpers for sitemap snapshots (hash, entryCount, fetchedAt, entries).
- [ ] Ensure snapshot writes occur only after a successful run.

### 2. Implement Hashing + Diffing
- [ ] Implement deterministic sitemap hashing (stable sort + stable serialization).
- [ ] Implement sitemap diff computation (added/changed/removed).
- [ ] Add logging for diff summary (counts of added/changed/removed).

### 3. Update Scheduled Sync Flow
- [ ] Update scheduled sync to fetch sitemap, compare against stored snapshot, and early-exit when unchanged.
- [ ] Update sync to scrape/process only added/changed entries.
- [ ] Update sync to handle removed entries by marking corresponding pubs as closed.

### 4. Preserve Pub Identity on URL Renames
- [ ] When an added URL is not found by URL, scrape it and attempt to match against existing pubs by name+townCity and address.
- [ ] Ensure a rename results in updating the existing pub record’s `url` (and related scraped fields) rather than creating a new pub doc.
- [ ] Add or document any required Firestore indexes for new query patterns.

### 5. Tests
- [ ] Add unit tests for sitemap hashing (stable output).
- [ ] Add unit tests for diffing (added/changed/removed).
- [ ] Add unit tests for “no-change skip” behavior.
- [ ] Add unit tests for deletion handling.
- [ ] Add unit tests for rename handling (no duplicate pubs created).

### 6. Validation
- [ ] Run `openspec validate 2026-04-30-update-scheduled-sync-sitemap-diff --strict` and fix all issues.
- [ ] Ensure existing Jest test suite passes.

## Parallel Work Opportunities

- Diffing + hashing (Task 2) can be done in parallel with persistence scaffolding (Task 1).
- Scheduled flow integration (Task 3) can proceed once Task 2 has a tested API.

## Rollback Plan

- Revert the scheduled sync flow changes; the prior full sync approach continues to work.
- Remove the sync-state document usage; no user-facing schema changes are required.
