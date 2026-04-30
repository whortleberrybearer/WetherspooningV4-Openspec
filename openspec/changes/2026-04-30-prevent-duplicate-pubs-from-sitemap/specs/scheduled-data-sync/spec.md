# scheduled-data-sync Spec Delta

**Change:** `2026-04-30-prevent-duplicate-pubs-from-sitemap`

## ADDED Requirements

### Requirement: Prevent Duplicate Pub Records From Sitemap Variants (REQ-SDS-020)
**Priority:** MUST  
**Category:** Functional

The system MUST prevent creating duplicate Firestore pub records when the sitemap contains multiple pub URLs that represent the same physical location.

**Acceptance Criteria:**
- The system MUST treat URLs whose last path segment ends with `-<number>` (e.g. `.../the-five-stones-filey-2/`) as potential duplicates of the corresponding non-suffixed URL (e.g. `.../the-five-stones-filey/`).
- The system MUST compute a canonical base slug by stripping a trailing `-<number>` from the last path segment.
- The system MUST only confirm a duplicate when the scraped pub addresses are equal after trimming.
- When a duplicate is confirmed, the system MUST NOT create an additional Firestore pub record for the duplicate.
- Duplicate handling MUST apply within a single sync invocation (including full sync and update sync).
- When duplicates are confirmed, the system MUST select a single canonical record using these rules (in order):
  - Prefer the pub whose sitemap entry has a non-empty `imageUrl`.
  - If both have an image (or both lack one), prefer the non-suffixed URL over the suffixed (`-2`, `-3`, etc.) URL.
  - If still tied, prefer the first processed entry.
- If a duplicate entry is later discovered to be the better canonical choice (e.g., it has an image but the current canonical does not), the system MUST update the canonical pub’s stored `url` (and `imageUrl`) to match the better canonical entry.

#### Scenario: Skip Creating Duplicate When Address Matches
**Given** the sitemap contains entries:
- `https://www.jdwetherspoon.com/pubs/the-five-stones-filey/` with `imageUrl: ""`
- `https://www.jdwetherspoon.com/pubs/the-five-stones-filey-2/` with `imageUrl: "https://.../feature.png"`
**And** scraping both pages yields the same address string
**When** the sync processes these entries in a single invocation
**Then** exactly one Firestore pub record is created/updated for that location
**And** no additional record is created for the duplicate entry
**And** the stored pub `url` is `https://www.jdwetherspoon.com/pubs/the-five-stones-filey-2/`
**And** the stored pub `imageUrl` is `https://.../feature.png`

#### Scenario: Do Not Dedupe When Address Differs
**Given** the sitemap contains entries:
- `https://www.jdwetherspoon.com/pubs/example-town/the-sample-pub/`
- `https://www.jdwetherspoon.com/pubs/example-town/the-sample-pub-2/`
**And** scraping yields different addresses for the two pages
**When** the sync processes these entries
**Then** two distinct Firestore pub records are created/updated

#### Scenario: Prefer Non-suffixed URL When Image Presence Is Equal
**Given** the sitemap contains entries:
- `https://www.jdwetherspoon.com/pubs/example-town/the-sample-pub/` with `imageUrl: ""`
- `https://www.jdwetherspoon.com/pubs/example-town/the-sample-pub-2/` with `imageUrl: ""`
**And** scraping both pages yields the same address string
**When** the sync processes these entries
**Then** exactly one Firestore pub record is created/updated
**And** the stored pub `url` is `https://www.jdwetherspoon.com/pubs/example-town/the-sample-pub/`

#### Scenario: Handle Multiple Numeric Variants
**Given** the sitemap contains entries:
- `https://www.jdwetherspoon.com/pubs/example-town/the-sample-pub/`
- `https://www.jdwetherspoon.com/pubs/example-town/the-sample-pub-2/`
- `https://www.jdwetherspoon.com/pubs/example-town/the-sample-pub-3/`
**And** scraping all pages yields the same address string
**And** only `the-sample-pub-3` has a non-empty `imageUrl`
**When** the sync processes these entries
**Then** exactly one Firestore pub record is created/updated
**And** the stored pub `url` is `https://www.jdwetherspoon.com/pubs/example-town/the-sample-pub-3/`

## MODIFIED Requirements

### Requirement: Full Sync Data Loading (REQ-SDS-013)
**Priority:** MUST  
**Category:** Functional

The system MUST load all existing pub records from Firestore at the start of a full sync to enable closure detection and efficient matching.

**Updated Acceptance Criteria:**
- At the start of a full sync, all documents in the `pubs` collection are fetched
- Fetched pubs are stored in an in-memory array for the duration of the sync
- Matching logic uses the in-memory array instead of individual Firestore queries
- **ADDED:** Newly created pubs during the current sync invocation are added to the in-memory array, so subsequent entries can match against them
- Closure detection uses the in-memory array to identify unmatched pubs
- If the Firestore query fails, the sync terminates with an error
- The number of loaded pubs is logged

#### Scenario: In-Run Matching Uses Newly Created Pubs
**ADDED:**
**Given** a full sync invocation is processing sitemap entries
**And** a pub is newly created during this invocation
**When** a later sitemap entry represents the same location (confirmed by address match)
**Then** the later entry matches the in-run pub
**And** no second pub record is created
