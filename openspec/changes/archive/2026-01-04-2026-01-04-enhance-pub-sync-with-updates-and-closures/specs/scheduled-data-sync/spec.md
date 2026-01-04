# Spec Delta: scheduled-data-sync

**Change ID:** `2026-01-04-enhance-pub-sync-with-updates-and-closures`  
**Capability:** scheduled-data-sync

## Summary
Enhance the scheduled pub sync with intelligent matching logic to update existing pubs, change detection to minimize database writes, and closure management to mark pubs removed from the sitemap.

---

## ADDED Requirements

### Requirement: Pub Matching Logic (REQ-SDS-009)
**Priority:** MUST  
**Category:** Functional

The system MUST implement multi-tier matching logic to find existing pub records that correspond to scraped sitemap entries.

**Acceptance Criteria:**
- Three-tier matching algorithm is implemented
- Tier 1: Match by URL (exact string match on `url` field)
- Tier 2: Match by name AND townCity for pubs with `openState === 'Open'` (handles URL changes)
- Tier 3: Match by address for pubs with `openState === 'Open'` (exact string match, only if address length > 10 characters)
- Matching tiers are evaluated in order: URL → Name+TownCity → Address
- First match found is returned; no further tiers are evaluated
- If no match is found, the scraped pub is treated as new
- When a match is found, the existing pub's ID is reused for the update
- Matching logic is encapsulated in a dedicated function for testability

#### Scenario: Match by URL (Tier 1)
**Given** an existing pub with URL "https://www.jdwetherspoon.com/pubs/the-moon-under-water-leicester-square"  
**And** the scraped sitemap entry has the same URL  
**When** the matching logic runs  
**Then** the existing pub is matched via tier 1 (URL)  
**And** the existing pub's ID is reused  
**And** tiers 2 and 3 are not evaluated

#### Scenario: Match by Name and TownCity (Tier 2)
**Given** an existing pub with name "The Moon Under Water", townCity "London", `openState === 'Open'`, and URL "https://www.jdwetherspoon.com/pubs/old-url"  
**And** the scraped sitemap entry has URL "https://www.jdwetherspoon.com/pubs/new-url"  
**And** the scraped pub has name "The Moon Under Water" and townCity "London"  
**When** the matching logic runs  
**Then** tier 1 fails (URL mismatch)  
**And** tier 2 succeeds (name and townCity match, pub is open)  
**And** the existing pub is matched  
**And** the existing pub's ID is reused  
**And** tier 3 is not evaluated

#### Scenario: Match by Address (Tier 3)
**Given** an existing pub with address "123 Main Street, Leicester Square, London, WC2H 7BP"  
**And** the existing pub has name "Old Name", URL "https://old-url.com", and `openState === 'Open'`  
**And** the scraped sitemap entry has name "New Name" and URL "https://new-url.com"  
**And** the scraped pub has the same address "123 Main Street, Leicester Square, London, WC2H 7BP"  
**When** the matching logic runs  
**Then** tier 1 fails (URL mismatch)  
**And** tier 2 fails (name mismatch)  
**And** tier 3 succeeds (address match, pub is open)  
**And** the existing pub is matched  
**And** the existing pub's ID is reused

#### Scenario: No Match - New Pub
**Given** no existing pub matches the scraped pub by URL, name+townCity, or address  
**When** the matching logic runs  
**Then** all tiers fail  
**And** the scraped pub is treated as a new pub  
**And** a new ID is generated for the pub

#### Scenario: Skip Closed Pubs in Tier 2
**Given** an existing pub with name "The Moon Under Water", townCity "London", and `openState === 'Closed'`  
**And** the scraped pub has name "The Moon Under Water" and townCity "London"  
**When** tier 2 matching runs  
**Then** the existing closed pub is NOT matched  
**And** the scraped pub is treated as a new pub  
**And** a new ID is generated

#### Scenario: Skip Closed Pubs in Tier 3
**Given** an existing pub with address "123 Main Street, London" and `openState === 'Closed'`  
**And** the scraped pub has address "123 Main Street, London"  
**When** tier 3 matching runs  
**Then** the existing closed pub is NOT matched  
**And** the scraped pub is treated as a new pub  
**And** a new ID is generated

#### Scenario: Skip Short Addresses in Tier 3
**Given** an existing pub with address "N/A"  
**And** the scraped pub has address "N/A"  
**When** tier 3 matching runs  
**Then** the match is skipped (address too short)  
**And** tier 3 fails  
**And** the scraped pub is treated as a new pub if no other tiers match

---

### Requirement: Change Detection (REQ-SDS-010)
**Priority:** MUST  
**Category:** Performance

The system MUST detect whether scraped pub data differs from existing pub data and skip database writes when no changes are detected.

**Acceptance Criteria:**
- Before writing to Firestore, compare scraped data with existing pub data
- Fields compared: `name`, `url`, `imageUrl`, `address`, `townCity`, `openState`, `isHotel`, `inAirport`, `inTrainStation`, `position`, `country`, `county`
- Position comparison handles null values correctly (null === null is no change)
- Position comparison checks both `lat` and `lng` for equality
- If no fields have changed, skip the database write
- If any field has changed, update `lastSyncedAt` to current timestamp and write to Firestore
- Skipped writes are logged for monitoring
- Change detection is encapsulated in a dedicated function for testability

#### Scenario: No Changes Detected
**Given** an existing pub with name "The Moon Under Water", address "Leicester Square, London", openState "Open"  
**And** the scraped pub has the same name, address, and openState  
**And** all other fields are identical  
**When** the change detection logic runs  
**Then** no changes are detected  
**And** the database write is skipped  
**And** a log message indicates "No changes detected for pub [id]"

#### Scenario: Single Field Change
**Given** an existing pub with name "The Moon Under Water" and address "Leicester Square, London"  
**And** the scraped pub has name "The Moon Under Water" but address "123 Leicester Square, London"  
**When** the change detection logic runs  
**Then** a change is detected (address field)  
**And** `lastSyncedAt` is set to current timestamp  
**And** the pub is written to Firestore

#### Scenario: Position Change Detection
**Given** an existing pub with position `{ lat: 51.5074, lng: -0.1278 }`  
**And** the scraped pub has position `{ lat: 51.5075, lng: -0.1278 }`  
**When** the change detection logic runs  
**Then** a change is detected (lat field)  
**And** the pub is written to Firestore

#### Scenario: Position Null to Value
**Given** an existing pub with position `null`  
**And** the scraped pub has position `{ lat: 51.5074, lng: -0.1278 }`  
**When** the change detection logic runs  
**Then** a change is detected  
**And** the pub is written to Firestore

#### Scenario: Position Value to Null
**Given** an existing pub with position `{ lat: 51.5074, lng: -0.1278 }`  
**And** the scraped pub has position `null`  
**When** the change detection logic runs  
**Then** a change is detected  
**And** the pub is written to Firestore

#### Scenario: Multiple Field Changes
**Given** an existing pub with name "Old Name", url "old-url", openState "Open"  
**And** the scraped pub has name "New Name", url "new-url", openState "Opening Soon"  
**When** the change detection logic runs  
**Then** changes are detected (name, url, openState)  
**And** the pub is written to Firestore

---

### Requirement: Closure Management (REQ-SDS-011)
**Priority:** MUST  
**Category:** Functional

The system MUST mark pubs as closed when they are removed from the Wetherspoon's sitemap during a full sync.

**Acceptance Criteria:**
- Closure detection only runs during full sync (not update sync)
- All existing pubs are loaded from Firestore at the start of full sync
- As sitemap entries are processed, matched pub IDs are tracked in a set
- After processing all sitemap entries, compare tracked IDs with all existing pubs
- Pubs with `openState === 'Open'` that were NOT matched are marked for closure
- Closure involves: setting `openState = 'Closed'` and clearing `url = ''`
- `lastSyncedAt` is updated to timestamp the closure
- Closed pubs are batch-written to Firestore
- Pubs already marked as closed are NOT re-closed
- Closure operations are logged with pub ID and name

#### Scenario: Mark Unmatched Open Pub as Closed
**Given** a full sync is running  
**And** an existing pub "The Old Tavern" with `openState === 'Open'` and URL "https://old-tavern.com"  
**And** the pub's URL does not appear in the sitemap  
**And** the pub does not match any sitemap entry via name+townCity or address  
**When** closure detection runs after processing all sitemap entries  
**Then** the pub is identified as unmatched  
**And** `openState` is set to 'Closed'  
**And** `url` is cleared to ''  
**And** `lastSyncedAt` is updated to current timestamp  
**And** the pub is written to Firestore  
**And** a log message indicates "Marked pub as closed: [id] - [name]"

#### Scenario: Skip Already Closed Pub
**Given** a full sync is running  
**And** an existing pub "The Old Tavern" with `openState === 'Closed'`  
**And** the pub does not match any sitemap entry  
**When** closure detection runs  
**Then** the pub is NOT marked for closure again  
**And** no database write occurs for this pub  
**And** no log message is generated

#### Scenario: Skip Closure Detection in Update Sync
**Given** an update sync is running (not a full sync)  
**And** existing pubs were NOT loaded from Firestore  
**When** sitemap entries are processed  
**Then** closure detection does NOT run  
**And** no pubs are marked as closed

#### Scenario: Full Sync with No Closures
**Given** a full sync is running  
**And** all existing open pubs match sitemap entries  
**When** closure detection runs  
**Then** no pubs are marked for closure  
**And** a log message indicates "No pubs marked as closed"

---

### Requirement: Database Batch Operations (REQ-SDS-012)
**Priority:** MUST  
**Category:** Performance

The system MUST batch Firestore write operations to manage database load during large syncs.

**Acceptance Criteria:**
- Pub writes are collected in memory and batched before committing to Firestore
- Batch size is limited to 500 operations (Firestore's hard limit)
- Multiple batches are committed sequentially if total writes exceed 500
- Each batch commit is logged with batch number and pub count
- A small delay (100ms) is inserted between batch commits to rate-limit writes
- If a batch commit fails, the error is logged but subsequent batches are attempted
- Batch writing logic is encapsulated in a reusable function

#### Scenario: Single Batch (< 500 Pubs)
**Given** 250 pubs need to be written to Firestore  
**When** batch writing runs  
**Then** all 250 pubs are included in a single batch  
**And** the batch is committed once  
**And** a log message indicates "✓ Committed batch 1: 250 pubs"  
**And** no delay is added (last batch)

#### Scenario: Multiple Batches (> 500 Pubs)
**Given** 1200 pubs need to be written to Firestore  
**When** batch writing runs  
**Then** batch 1 contains 500 pubs and is committed  
**And** a 100ms delay occurs  
**And** batch 2 contains 500 pubs and is committed  
**And** a 100ms delay occurs  
**And** batch 3 contains 200 pubs and is committed  
**And** log messages indicate "✓ Committed batch 1: 500 pubs", "✓ Committed batch 2: 500 pubs", "✓ Committed batch 3: 200 pubs"

#### Scenario: Batch Commit Failure
**Given** 600 pubs need to be written  
**And** batch 1 (500 pubs) commits successfully  
**And** batch 2 (100 pubs) fails due to a network error  
**When** batch writing runs  
**Then** batch 1 commits and is logged  
**And** batch 2 fails  
**And** the error is logged with context: "❌ Batch 2 commit failed: [error message]"  
**And** the function does not throw (error is caught and logged)

---

### Requirement: Full Sync Data Loading (REQ-SDS-013)
**Priority:** MUST  
**Category:** Functional

The system MUST load all existing pub records from Firestore at the start of a full sync to enable closure detection and efficient matching.

**Acceptance Criteria:**
- At the start of a full sync, all documents in the `pubs` collection are fetched
- Fetched pubs are stored in an in-memory array for the duration of the sync
- Matching logic uses the in-memory array instead of individual Firestore queries
- Closure detection uses the in-memory array to identify unmatched pubs
- If the Firestore query fails, the sync terminates with an error
- The number of loaded pubs is logged

#### Scenario: Load Existing Pubs for Full Sync
**Given** the Firestore `pubs` collection contains 987 pub documents  
**And** a full sync is starting  
**When** the sync initializes  
**Then** a Firestore query fetches all 987 documents  
**And** the documents are stored in an in-memory array  
**And** a log message indicates "📍 Loaded 987 existing pubs from Firestore"  
**And** matching logic uses the in-memory array for lookups

#### Scenario: Firestore Query Failure
**Given** a full sync is starting  
**And** the Firestore query to load existing pubs fails (network error)  
**When** the sync attempts to load pubs  
**Then** the error is caught and logged  
**And** the sync terminates with an error message  
**And** no sitemap processing occurs

---

### Requirement: Update Sync Execution (REQ-SDS-014)
**Priority:** MUST  
**Category:** Functional

The system MUST support update sync mode which processes only recently updated sitemap entries without closure detection.

**Acceptance Criteria:**
- Update sync does NOT load all existing pubs from Firestore (performance optimization)
- Update sync filters sitemap entries by `lastmod` date
- Only entries with `lastmod >= sinceDate` are processed
- For each entry, individual Firestore query is made to check for existing pub by URL
- Matching logic is applied using in-memory data (no closure detection)
- Change detection determines which pubs need database writes
- Writes are batched and committed to Firestore
- Closure detection is NOT performed (can't know what's missing without full pub list)
- Function logs summary: total processed, new, updated, skipped, errors (no closures)

#### Scenario: Update Sync with Recent Changes
**Given** the sitemap contains 100 pub entries  
**And** 15 entries have `lastmod >= 2026-01-03T00:00:00Z` (last 24 hours)  
**And** 10 of those 15 match existing pubs  
**And** 5 are new pubs  
**And** 7 of the existing pubs have data changes  
**When** an update sync runs with `sinceDate = 2026-01-03T00:00:00Z`  
**Then** only 15 entries are processed  
**And** existing pubs are not loaded from Firestore  
**And** 15 individual Firestore queries are made (one per entry)  
**And** 10 existing pubs are matched  
**And** 7 pubs are updated (changes detected)  
**And** 3 pubs are skipped (no changes)  
**And** 5 new pubs are created  
**And** NO pubs are marked as closed  
**And** logs indicate:
- "🔍 Found 15 pubs updated since 2026-01-03T00:00:00Z"
- "✅ Update sync complete: 15 processed, 5 new, 7 updated, 3 skipped, 0 errors"

---

## RENAMED Requirements

- FROM: `### Requirement: Limited Pub Processing (REQ-SDS-003)`
- TO: `### Requirement: Full Sync Execution (REQ-SDS-003)`

---

## MODIFIED Requirements

### Requirement: Firestore Data Sync (REQ-SDS-005)
**Priority:** MUST  
**Category:** Functional

The system MUST write extracted pub data to the Firestore `pubs` collection **only when data has changed**.

**Acceptance Criteria:**
- Document ID is derived from pub URL slug (last segment of path) **or reused from matched existing pub**
- Before writing, compare scraped data with existing pub data (if a match was found)
- If no changes are detected, skip the write operation
- If changes are detected or the pub is new, write to Firestore
- Document contains fields: `id`, `name`, `url`, `imageUrl`, `address`, `townCity`, `position`, `openState`, `isHotel`, `inAirport`, `inTrainStation`, `lastSyncedAt`, `country`, `county`
- `imageUrl` field contains the image URL extracted from sitemap
- `address` field contains the full address string extracted from HTML
- `townCity` field contains the town/city derived from URL slug
- `position` field contains an object with `lat` and `lng` numbers or `null`
- `openState` field contains the open state string ("Open", "Opening dd/MM/yyyy", "Opening Soon", "Temporary Closed")
- `isHotel` field contains boolean indicating if pub has accommodation
- `inAirport` field contains boolean indicating if pub is in an airport
- `inTrainStation` field contains boolean indicating if pub is in a train station
- `lastSyncedAt` is set to current server timestamp **only when data is written**
- Data is written using batched operations (see REQ-SDS-012)
- Existing documents are updated (not creating duplicates)
- Write errors are caught and logged

**Changes from original:**
- Added: Change detection before writing
- Added: ID reuse from matched existing pub
- Added: Batch writing instead of individual writes

#### Scenario: Skip Write When No Changes Detected
**Given** an existing pub "Star Light" with all fields matching the scraped data  
**When** the sync processes the pub  
**Then** change detection identifies no differences  
**And** no write operation is queued  
**And** a log message indicates "No changes detected for pub [id]"

#### Scenario: Update Existing Pub When Data Changes
**Given** an existing pub "Star Light" with address "Old Address"  
**And** the scraped pub has address "New Address"  
**When** the sync processes the pub  
**Then** change detection identifies the address difference  
**And** the existing pub's ID is reused  
**And** `lastSyncedAt` is updated to current timestamp  
**And** the pub is queued for batch writing  
**And** the document is updated in Firestore with new address

#### Scenario: Write New Pub to Firestore
**Given** a scraped pub "New Tavern" that does not match any existing pub  
**When** the sync processes the pub  
**Then** a new ID is generated from the URL slug  
**And** `lastSyncedAt` is set to current timestamp  
**And** the pub is queued for batch writing  
**And** a new document is created in the `pubs` collection

_(Other scenarios from original REQ-SDS-005 remain unchanged)_

---

### Requirement: Full Sync Execution (REQ-SDS-003)
**Priority:** MUST  
**Category:** Functional

The system MUST support full sync mode which processes all sitemap entries, updates existing pubs, and marks missing pubs as closed.

**Acceptance Criteria:**
- Full sync loads all existing pubs from Firestore at initialization
- Full sync processes all sitemap entries (or a specified subset via count/start parameters)
- Matching logic is applied to find existing pubs for each sitemap entry
- Change detection determines which pubs need database writes
- Matched pub IDs are tracked in a set during processing
- After processing all entries, closure detection identifies unmatched open pubs
- Unmatched open pubs are marked as closed
- All writes (updates, new pubs, closures) are batched and committed to Firestore
- Function logs summary: total processed, new, updated, closed, skipped, errors

**Changes from original:**
- Removed: Hardcoded limit to first 5 pubs
- Added: Full sync loads existing pubs
- Added: Closure detection after processing
- Added: Comprehensive logging

#### Scenario: Full Sync with Updates and Closures
**Given** the sitemap contains 100 pub entries  
**And** Firestore has 102 existing pubs (98 in sitemap, 4 removed)  
**And** 50 pubs have data changes  
**When** a full sync runs  
**Then** all 102 existing pubs are loaded from Firestore  
**And** all 100 sitemap entries are processed  
**And** 98 pubs are matched to existing records  
**And** 2 new pubs are created  
**And** 50 existing pubs are updated (changes detected)  
**And** 48 existing pubs are skipped (no changes)  
**And** 4 unmatched pubs are marked as closed  
**And** logs indicate:
- "📍 Loaded 102 existing pubs from Firestore"
- "📋 Processing 100 of 100 pubs"
- "✅ Full sync complete: 100 processed, 2 new, 50 updated, 4 closed, 48 skipped, 0 errors"

_(Scenario "Limiting to First 5 Pubs" is removed as this constraint no longer applies)_

---

## REMOVED Requirements

_None. All original requirements remain relevant; they have been modified or extended but not removed._

---

## Summary of Changes

**Added:**
- REQ-SDS-009: Pub Matching Logic
- REQ-SDS-010: Change Detection
- REQ-SDS-011: Closure Management
- REQ-SDS-012: Database Batch Operations
- REQ-SDS-013: Full Sync Data Loading
- REQ-SDS-014: Update Sync Execution (formalized)

**Modified:**
- REQ-SDS-003: Expanded to full sync with closure detection
- REQ-SDS-005: Added change detection and batch writing

**Unchanged:**
- REQ-SDS-001: Scheduled Function Execution
- REQ-SDS-002: Sitemap Fetching
- REQ-SDS-004: Pub Data Extraction
- REQ-SDS-006: Function Logging (enhanced but not structurally changed)
- REQ-SDS-007: Unit Test Coverage (expanded to cover new logic)
- REQ-SDS-008: Firebase Functions Setup
