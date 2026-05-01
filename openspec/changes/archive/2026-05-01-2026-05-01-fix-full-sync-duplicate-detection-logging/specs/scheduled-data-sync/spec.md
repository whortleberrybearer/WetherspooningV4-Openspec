# scheduled-data-sync Delta

## MODIFIED Requirements

### Requirement: Prevent Duplicate Pub Records From Sitemap Variants (REQ-SDS-020)
**Priority:** MUST  
**Category:** Functional

The system MUST prevent creating duplicate Firestore pub records when the sitemap contains multiple pub URLs that represent the same physical location.

**Acceptance Criteria:**
- The system MUST treat URLs whose last path segment ends with `-<number>` (e.g. `.../the-five-stones-filey-2/`) as potential duplicates of the corresponding non-suffixed URL (e.g. `.../the-five-stones-filey/`).
- The system MUST compute a canonical base slug by stripping a trailing `-<number>` from the last path segment.
- The system MUST only confirm a duplicate when ALL of the following are true:
  - The current sitemap entry URL is different from the canonical URL already selected for the location key, AND
  - The scraped pub addresses are equal after trimming.
- When a sitemap entry matches an existing pub by exact URL, the system MUST treat this as a normal “existing pub” match and MUST NOT classify it as a duplicate.
- When a duplicate is confirmed, the system MUST NOT create an additional Firestore pub record for the duplicate.
- Duplicate handling MUST apply within a single sync invocation (including full sync and update sync).
- When duplicates are confirmed, the system MUST select a single canonical record using these rules (in order):
  - Prefer the pub whose sitemap entry has a non-empty `imageUrl`.
  - If both have an image (or both lack one), prefer the non-suffixed URL over the suffixed (`-2`, `-3`, etc.) URL.
  - If still tied, prefer the first processed entry.
- If a duplicate entry is later discovered to be the better canonical choice (e.g., it has an image but the current canonical does not), the system MUST update the canonical pub’s stored `url` (and `imageUrl`) to match the better canonical entry.
- When a duplicate is confirmed, the system MUST log a “duplicate detected” message that includes the duplicate URL and the canonical pub ID.

#### Scenario: Full Sync Does Not Flag Self-Match As Duplicate
**Given** the system is running a full sync invocation
**And** the sitemap contains a single entry for a pub URL
**And** the pub already exists in Firestore with the same URL
**When** the sync processes the entry
**Then** the system matches the existing pub by URL
**And** the system does not log a “duplicate detected” message for that entry

#### Scenario: Duplicate Logged Only For Distinct URL Variant
**Given** the sitemap contains entries:
- `https://www.jdwetherspoon.com/pubs/the-five-stones-filey/` with `imageUrl: ""`
- `https://www.jdwetherspoon.com/pubs/the-five-stones-filey-2/` with `imageUrl: "https://.../feature.png"`
**And** scraping both pages yields the same address string
**When** the sync processes these entries in a single invocation
**Then** exactly one Firestore pub record is created/updated for that location
**And** the system logs a “duplicate detected” message for the non-canonical entry only
