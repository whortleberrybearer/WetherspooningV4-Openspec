# scheduled-data-sync Delta

## ADDED Requirements

### Requirement: Persist Sitemap Snapshot for Diffing (REQ-SDS-011)
**Priority:** MUST  
**Category:** Functional

The system MUST persist the most recently fetched pubs sitemap snapshot so that future runs can compute a sitemap diff.

**Acceptance Criteria:**
- After a successful sitemap fetch + parse, the system writes a snapshot to Firestore.
- Snapshot includes:
  - `fetchedAt` timestamp
  - `entryCount` number
  - `hash` string (deterministic; see REQ-SDS-012)
  - `entries` list containing `{ url, imageUrl, lastmod? }`
- Snapshot write is performed only after the run completes its processing successfully.
- Snapshot storage is server-only (not readable by client applications).

#### Scenario: First Run Creates Baseline Snapshot
**Given** no previous sitemap snapshot exists in Firestore  
**When** the scheduled sync fetches and parses the sitemap successfully  
**Then** the system stores the sitemap snapshot  
**And** the run proceeds with normal processing of the sitemap entries

---

### Requirement: Skip Scraping When Sitemap Is Unchanged (REQ-SDS-012)
**Priority:** MUST  
**Category:** Performance

The system MUST skip pub scraping when the current sitemap snapshot is identical to the previous snapshot.

**Acceptance Criteria:**
- The system computes a deterministic `hash` over the current sitemap entries.
- If the computed hash matches the stored snapshot hash:
  - No pub pages are fetched/scraped
  - No Firestore pub writes are performed
  - The run logs a "no changes" summary and exits successfully

#### Scenario: No-Change Skip
**Given** a stored sitemap snapshot exists with hash `H1`  
**And** the current sitemap computes to the same hash `H1`  
**When** the scheduled sync runs  
**Then** the system logs that the sitemap is unchanged  
**And** the system performs zero pub page scrapes  
**And** the system performs zero pub writes

---

### Requirement: Incremental Processing From Sitemap Diff (REQ-SDS-013)
**Priority:** MUST  
**Category:** Functional

When the sitemap changes, the system MUST compute a sitemap diff and process only entries that were added or changed.

**Acceptance Criteria:**
- The system computes a diff between the stored snapshot entries and current entries.
- Diff categories:
  - **Added:** URL exists only in current sitemap
  - **Removed:** URL exists only in previous sitemap
  - **Changed:** URL exists in both, but `lastmod` and/or `imageUrl` differs
- The system scrapes and syncs pubs for **Added** and **Changed** entries only.
- The system does not scrape pubs whose sitemap entries are unchanged.

#### Scenario: One Pub Updated
**Given** the previous snapshot contains 800 entries  
**And** the current sitemap contains the same 800 URLs  
**And** exactly 1 entry has a newer `lastmod` value  
**When** the scheduled sync runs  
**Then** only that 1 pub page is scraped  
**And** other pubs are not scraped

---

### Requirement: Deletion Detection From Removed Sitemap Entries (REQ-SDS-014)
**Priority:** MUST  
**Category:** Functional

The system MUST detect pubs removed from the sitemap and mark them as closed.

**Acceptance Criteria:**
- The system computes the set of **Removed** sitemap entries.
- For each removed sitemap entry, the system attempts to locate a matching existing pub record.
- When a matching pub is found and the removal is not explained by a URL rename (REQ-SDS-015):
  - The pub is marked as closed
  - `lastSyncedAt` is updated
  - The action is logged
- Removal handling occurs only when the system has successfully fetched and parsed the complete sitemap.

#### Scenario: Pub Removed From Sitemap
**Given** the previous snapshot contained URL `https://www.jdwetherspoon.com/pubs/example-town/the-sample-pub/`  
**And** the current sitemap does not contain that URL  
**And** the pub exists in Firestore with `openState` "Open"  
**When** the scheduled sync runs  
**Then** the pub is updated to `openState` "Closed"  
**And** the update is logged

---

### Requirement: Preserve Pub Identity Across URL Renames (REQ-SDS-015)
**Priority:** MUST  
**Category:** Functional

When a pub’s URL changes, the system MUST update the existing pub record rather than creating a new record.

**Acceptance Criteria:**
- If a sitemap diff contains both removed and added URLs, the system attempts to detect rename pairs.
- For an added URL that is not found by direct URL lookup:
  - The system scrapes the pub data
  - The system searches for an existing pub using the existing matching strategy (URL → name+townCity → address)
- If a match is found:
  - The existing pub’s `id` is preserved
  - The existing pub’s `url` is updated to the new URL
  - The "removed" URL is not treated as a deletion for that pub

#### Scenario: URL Rename Preserves Visits
**Given** the previous snapshot included URL `.../old-url/`  
**And** the current sitemap includes URL `.../new-url/`  
**And** the pub in Firestore has visits referencing its existing `id`  
**When** the scheduled sync runs  
**Then** the system updates the existing pub’s `url` to `.../new-url/`  
**And** the pub `id` remains unchanged  
**And** no duplicate pub document is created
