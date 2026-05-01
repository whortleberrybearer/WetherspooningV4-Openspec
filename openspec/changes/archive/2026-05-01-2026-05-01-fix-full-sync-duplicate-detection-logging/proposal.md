# Change: Fix false “duplicate detected” logging in full pub sync

## Why
Full pub sync currently logs “Duplicate detected; using canonical pub …” for pubs that are not duplicates. This is noisy and makes it difficult to spot real sitemap variant duplicates, and it risks masking genuine data quality issues.

## What Changes
- Treat “duplicate” as **multiple distinct sitemap URLs** mapping to the same physical location within a single sync invocation.
- During full sync, match existing pubs by exact URL first; only then apply location-based dedupe logic when a second, distinct URL for the same location is encountered.
- Emit “duplicate detected” logs only for true duplicates (i.e., a distinct URL being mapped onto an already-selected canonical pub for that location).

## Impact
- Affected spec: `scheduled-data-sync` (REQ-SDS-020)
- Affected code (implementation stage):
  - `functions/src/scheduled/syncPubs.ts` (full sync processing order + logging)
  - `functions/test/scheduled/syncPubs.test.ts` (add coverage for full sync behavior)

## Non-Goals
- Changing the canonical selection rules (image first, then non-suffixed URL, then first processed).
- Changing the criteria for “same physical location” (still address match after trimming).
