## Context
The upstream sitemap may list multiple URLs for the same pub location (commonly by appending a numeric suffix like `-2`, `-3` to the slug). The current sync processes each sitemap entry independently. During a single sync invocation, the in-memory matching set is initialized only from Firestore and does not include pubs created earlier in the same run, so duplicate sitemap entries can produce duplicate Firestore records.

## Goals / Non-Goals
- Goals:
  - Prevent creating duplicate pub records when two or more sitemap URLs represent the same location.
  - Detect duplicates using the requested rule: numeric-suffixed URL + address equality.
  - When duplicates exist, persist a single record and prefer the URL that has an image in the sitemap.
  - Work in both full sync and update sync within a single invocation.
- Non-Goals:
  - Deleting / merging duplicates that already exist in Firestore.
  - Adding fuzzy matching heuristics beyond address equality.

## Decisions
### Decision: Canonical key for duplicate candidates
Compute a canonical “base slug” by removing a trailing numeric suffix from the last URL path segment:
- `.../the-five-stones-filey/` → base slug `the-five-stones-filey`
- `.../the-five-stones-filey-2/` → base slug `the-five-stones-filey`
- `.../the-five-stones-filey-3/` → base slug `the-five-stones-filey`

This key is used only to identify *candidate* duplicates; a match is confirmed only by scraped address equality.

### Decision: Duplicate confirmation rule
Two pubs are treated as duplicates if:
- Their canonical base slug is the same, AND
- Their scraped addresses are equal after trimming.

Rationale: this matches the user-provided rule and is simple/low-risk.

### Decision: Canonical record selection (“prefer URL with image”)
When a duplicate group is confirmed (same address), select the canonical record as follows:
1. Prefer the entry whose sitemap `imageUrl` is non-empty.
2. If both have an image (or both do not), prefer the non-suffixed URL over a suffixed (`-2`, `-3`) URL.
3. If still tied, prefer the earliest processed entry for determinism.

When a better canonical entry is discovered later in the same run (e.g., the `-2` URL has an image but the base URL does not), the existing pub record is updated in-memory so that the stored `url` (and `imageUrl`) are switched to the chosen canonical entry.

### Decision: In-run state must include newly created pubs
During a sync invocation, newly created pubs are added to an in-memory collection used for:
- Pub matching
- Duplicate candidate detection

This ensures that duplicates appearing later in the same run are recognized and skipped (or used to upgrade the canonical URL/image).

## Risks / Trade-offs
- False positives are possible if two distinct pubs share an identical address string and similar slugs; considered unlikely.
- False negatives are possible if addresses differ only by formatting; this proposal intentionally avoids fuzzy matching.

## Migration Plan
No migration is required. This change prevents new duplicates from being created but does not remove duplicates already in Firestore.

## Open Questions
- Should address normalization collapse repeated whitespace and standardize commas, or remain strict trim-only?
