# Change: Prevent Duplicate Pubs From Sitemap

## Why
The Wetherspoon sitemap can contain multiple pub URLs that point to the same physical location (e.g., URLs ending in `-2`, `-3`, etc.). Today, the scheduled sync can create multiple Firestore pub records during a single run because newly created pubs are not available for subsequent in-run matching.

This leads to duplicate pubs in Firestore and duplicate markers / entries in the app.

## What Changes
- Detect potential duplicates where the URL slug ends in `-<number>` (e.g. `the-five-stones-filey-2`) and compare them against the corresponding non-suffixed URL (e.g. `the-five-stones-filey`).
- Confirm duplicates by matching the scraped pub address; if addresses match, treat as the same location.
- When a duplicate is confirmed:
  - Do NOT create a new pub record.
  - Prefer the URL that has an image in the sitemap: if one of the duplicates has a non-empty `imageUrl`, that URL SHALL become the stored pub `url`.
- Ensure the duplicate logic applies within a single sync invocation (full sync and update sync), so that duplicates in the same run do not create separate new records.
- Add unit tests covering duplicate detection, canonical selection, and “prefer URL with image” behavior.

## Impact
- Affected OpenSpec capability: `scheduled-data-sync`
- Affected backend areas:
  - Sitemap entry processing / sync loop
  - Pub matching and in-run state management
- Data model/schema: no changes
- Migration: none (existing duplicates are not removed by this change)

## Out of Scope / Non-Goals
- Automatically merging or deleting pub duplicates that already exist in Firestore.
- Heuristics beyond the requested rules (e.g., fuzzy address matching, geo-distance matching).

## Open Questions
- Address comparison: should it be strict string equality after trimming, or should we also normalize whitespace/case? (Proposal assumes trimmed equality, with minimal normalization.)
