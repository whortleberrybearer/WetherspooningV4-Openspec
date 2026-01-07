# scheduled-data-sync Specification

## Purpose
TBD - created by archiving change 2026-01-02-add-scheduled-pub-sync. Update Purpose after archive.
## Requirements
### Requirement: Scheduled Function Execution (REQ-SDS-001)
**Priority:** MUST  
**Category:** Functional

The system MUST execute a Firebase Cloud Function on a daily schedule to sync pub data.

**Acceptance Criteria:**
- Cloud Function is configured with `onSchedule` trigger
- Schedule is set to run daily at 2:00 AM UTC
- Function is allocated 256MB of memory
- Function timeout is set to 540 seconds (9 minutes)
- Function deploys successfully to Firebase
- Cloud Scheduler triggers function at scheduled time
- Function execution is logged to Cloud Logging

#### Scenario: Daily Scheduled Execution
**Given** the Cloud Function is deployed  
**And** Cloud Scheduler is configured  
**When** the scheduled time (2:00 AM UTC) is reached  
**Then** the Cloud Scheduler triggers the function  
**And** the function begins execution  
**And** execution is logged with timestamp and trigger source

#### Scenario: Function Deployment
**Given** the Firebase Functions code is committed  
**When** `firebase deploy --only functions` is executed  
**Then** the function deploys successfully  
**And** the schedule is registered with Cloud Scheduler  
**And** deployment succeeds without errors  
**And** the function appears in the Firebase Console

---

### Requirement: Sitemap Fetching (REQ-SDS-002)
**Priority:** MUST  
**Category:** Functional

The system MUST fetch and parse the Wetherspoon's sitemap XML to extract pub URLs and image URLs.

**Acceptance Criteria:**
- Sitemap is fetched from https://www.jdwetherspoon.com/pubs-sitemap.xml
- HTTP GET request is made using node-fetch or equivalent
- Response status is checked (200 OK expected)
- XML content is parsed using fast-xml-parser
- `<loc>` elements containing pub URLs are extracted
- `<image:loc>` elements containing image URLs are extracted
- Extracted data is returned as an array of objects with `url` and `imageUrl` properties
- HTTP errors are caught and logged
- Parse errors are caught and logged

#### Scenario: Successful Sitemap Fetch
**Given** the Wetherspoon's sitemap is accessible  
**When** the function fetches the sitemap  
**Then** an HTTP GET request is made to the sitemap URL  
**And** the response status is 200  
**And** the response body contains valid XML  
**And** the XML is parsed successfully  
**And** all `<loc>` elements are extracted as pub URLs  
**And** all `<image:loc>` elements are extracted as image URLs  
**And** data is returned as an array of objects with `url` and `imageUrl` properties

#### Scenario: Sitemap Fetch Failure
**Given** the Wetherspoon's sitemap is not accessible  
**When** the function attempts to fetch the sitemap  
**Then** an HTTP error occurs  
**And** the error is caught and logged  
**And** the function execution fails with a descriptive error message  
**And** no further processing occurs

#### Scenario: Sitemap Parse Failure
**Given** the sitemap URL returns invalid XML  
**When** the function attempts to parse the response  
**Then** a parse error occurs  
**And** the error is caught and logged  
**And** the function execution fails with a descriptive error message  
**And** no pub URLs are extracted

---

### Requirement: Pub Data Extraction (REQ-SDS-004)
**Priority:** MUST  
**Category:** Functional

The system MUST scrape each pub's webpage to extract the pub name, address, town/city, position, open state, and facilities (hotel, airport, train station).

**Acceptance Criteria:**
- For each pub URL, an HTTP GET request is made
- HTML response is parsed using cheerio
- Pub name is extracted from `<h1 class="wp-block-heading">` element
- HTML entities (&#038; and &amp;) are decoded to & character
- Extracted name is trimmed of leading/trailing whitespace
- Address is extracted from `<div class="pub-address-inner"><span>` element
- Address is trimmed of leading/trailing whitespace
- Town/city is derived from URL slug by removing the pub name slug and converting to title case
- Position (lat/lng) is extracted from `<img class="pub-map">` src attribute center parameter
- Open state is extracted from `<p class="open-status">` element with logic for "Opening soon", "Closed temporarily", or "Open"
- isHotel is extracted by checking if facilities list contains "Accommodation"
- inAirport is extracted by checking if address contains "Airport" OR facilities list contains "Airport Pub" OR "Airport after security"
- inTrainStation is extracted by checking if facilities list contains "Train Station"
- Facilities are extracted from `<div class="pub-facilities-list">` span elements
- Empty or missing names are handled (logged and skipped)
- HTTP errors for individual pubs are logged but don't stop processing of other pubs
- Parse errors are logged but don't stop processing

#### Scenario: Successful Data Extraction
**Given** a pub URL "https://www.jdwetherspoon.com/pubs/star-light-hounslow/"  
**When** the function fetches and parses the page  
**Then** an HTTP GET request is made to the URL  
**And** the HTML response is parsed  
**And** the pub name is extracted from `<h1 class="wp-block-heading">` element  
**And** the name is "Star Light"  
**And** the address is extracted from `<div class="pub-address-inner"><span>` element  
**And** the address is "Heathrow Airport, Terminal 4 (after security) , Hounslow, Middlesex, TW6 3XA"  
**And** the town/city is derived from URL as "Hounslow"  
**And** the position is extracted from map image as lat: 51.46148, lng: -0.44538  
**And** the open state is extracted as "Open"  
**And** facilities are extracted from pub-facilities-list  
**And** isHotel is checked for "Accommodation" facility  
**And** inAirport is checked for "Airport Pub" facility  
**And** inTrainStation is checked for "Train Station" facility  
**And** all values are trimmed and returned  
**And** the name is non-empty

#### Scenario: Name with HTML Entities
**Given** a pub page with name containing "&#038;" or "&amp;"  
**When** the function extracts the name  
**Then** HTML entities are decoded to "&" character  
**And** the name contains proper ampersand character

#### Scenario: Pub Page Fetch Failure
**Given** a pub URL that returns a 404 error  
**When** the function attempts to fetch the page  
**Then** an HTTP error is caught  
**And** the error is logged with the pub URL  
**And** the pub is skipped  
**And** processing continues with the next pub

#### Scenario: Name Extraction Failure
**Given** a pub page with unexpected HTML structure  
**When** the function attempts to extract the name  
**Then** the extraction returns null or empty string  
**And** a warning is logged with the pub URL  
**And** the pub is skipped  
**And** processing continues with the next pub

---

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

### Requirement: Function Logging (REQ-SDS-006)
**Priority:** MUST  
**Category:** Functional

The system MUST log key events and errors during execution.

**Acceptance Criteria:**
- Function start is logged with timestamp
- Sitemap fetch is logged
- Number of URLs extracted is logged
- Each pub being processed is logged
- Successful writes to Firestore are logged
- Errors are logged with context (URL, operation, error message)
- Function completion is logged with summary (success count, failure count)
- Logs use console.log/error/warn (integrate with Cloud Logging)

#### Scenario: Complete Execution Logging
**Given** the function runs successfully  
**And** processes 5 pubs  
**And** 4 pubs are written successfully  
**And** 1 pub fails (page not found)  
**When** the function completes  
**Then** logs include:
- "Starting scheduled pub sync"
- "Fetched sitemap: 100 URLs found"
- "Processing 5 of 100 pubs"
- "Processing pub: The Moon Under Water (URL: ...)"
- "Written to Firestore: the-moon-under-water-leicester-square"
- "Error fetching pub: ... (404)"
- "Sync complete: 4 successful, 1 failed"

---

### Requirement: Unit Test Coverage (REQ-SDS-007)
**Priority:** MUST  
**Category:** Testing

The system MUST include comprehensive unit tests for all services.

**Acceptance Criteria:**
- Tests are written using Jest
- `sitemapService` tests use fixture XML data
- `pubScraperService` tests use fixture HTML data
- `pubSyncService` tests mock Firestore operations
- Test coverage is >80% line coverage
- All tests pass before deployment
- Tests can run in CI/CD pipeline
- Fixtures are stored in `functions/test/fixtures/`

#### Scenario: Sitemap Service Tests
**Given** a fixture file `sitemap-sample.xml` with 10 pub URLs  
**When** tests run for `sitemapService`  
**Then** tests verify XML parsing extracts all 10 URLs  
**And** tests verify error handling for invalid XML  
**And** tests verify error handling for network failures (using mocks)  
**And** all tests pass

#### Scenario: Pub Scraper Service Tests
**Given** a fixture file `pub-page-sample.html` with a pub name  
**When** tests run for `pubScraperService`  
**Then** tests verify name extraction from HTML  
**And** tests verify handling of missing name elements  
**And** tests verify handling of malformed HTML  
**And** all tests pass

#### Scenario: Pub Sync Service Tests
**Given** mocked Firestore operations  
**When** tests run for `pubSyncService`  
**Then** tests verify document ID generation from URL  
**And** tests verify upsert logic (create and update)  
**And** tests verify timestamp setting  
**And** tests verify error handling for write failures  
**And** all tests pass

---

### Requirement: Firebase Functions Setup (REQ-SDS-008)
**Priority:** MUST  
**Category:** Infrastructure

The system MUST set up Firebase Functions in the project.

**Acceptance Criteria:**
- `functions/` directory is created at project root
- `package.json` is created with required dependencies
- TypeScript is configured via `tsconfig.json`
- Dependencies include: firebase-functions, firebase-admin, fast-xml-parser, node-fetch, cheerio
- Dev dependencies include: @types/*, jest, ts-jest, typescript
- `firebase.json` is updated with functions configuration
- `.gitignore` excludes `functions/lib/` and `functions/node_modules/`

#### Scenario: Firebase Functions Initialization
**Given** the project does not have Firebase Functions configured  
**When** Firebase Functions is initialized  
**Then** `functions/` directory is created  
**And** `package.json` includes all required dependencies  
**And** TypeScript is configured for Node.js environment  
**And** `firebase.json` includes functions configuration  
**And** build script compiles TypeScript to JavaScript in `lib/` directory

### Requirement: Full Sync Execution (REQ-SDS-003)
**Priority:** MUST  
**Category:** Functional

The system MUST support full sync mode which processes all sitemap entries, updates existing pubs, and marks missing pubs as closed **only when processing the complete sitemap**.

**Acceptance Criteria:**
- Full sync loads all existing pubs from Firestore at initialization
- Full sync processes all sitemap entries (or a specified subset via count/start parameters)
- Matching logic is applied to find existing pubs for each sitemap entry
- Change detection determines which pubs need database writes
- Matched pub IDs are tracked in a set during processing
- Closure detection runs **only when processing the complete sitemap** (i.e., when `start === 0` AND `count === undefined`)
- When processing a partial subset (start > 0 OR count is specified), closure detection is skipped and logged
- When closure detection runs, unmatched open pubs are marked as closed
- All writes (updates, new pubs, closures) are batched and committed to Firestore
- Function logs summary: total processed, new, updated, closed, skipped, errors

**Changes from original:**
- Removed: Hardcoded limit to first 5 pubs
- Added: Full sync loads existing pubs
- Added: Closure detection after processing
- Added: Comprehensive logging
- **Added: Closure detection only runs for complete sitemap (start === 0 AND count === undefined)**
- **Added: Logging when closure detection is skipped**

#### Scenario: Full Sync with Complete Sitemap (Closure Detection Runs)
**Given** the sitemap contains 100 pub entries  
**And** Firestore has 102 existing pubs (98 in sitemap, 4 removed)  
**And** 50 pubs have data changes  
**And** no `start` or `count` parameters are provided  
**When** a full sync runs  
**Then** `start` defaults to 0 and `count` is undefined  
**And** all 102 existing pubs are loaded from Firestore  
**And** all 100 sitemap entries are processed  
**And** 98 pubs are matched to existing records  
**And** 2 new pubs are created  
**And** 50 existing pubs are updated (changes detected)  
**And** 48 existing pubs are skipped (no changes)  
**And** closure detection runs because it's a complete sync  
**And** 4 unmatched pubs are marked as closed  
**And** logs indicate:
- "📍 Loaded 102 existing pubs from Firestore"
- "📋 Processing 100 of 100 pubs"
- "✅ Full sync complete: 100 processed, 2 new, 50 updated, 4 closed, 48 skipped, 0 errors"

#### Scenario: Partial Sync with Start Position (No Closure Detection)
**Given** the sitemap contains 800 pub entries  
**And** Firestore has 795 existing pubs  
**And** a full sync is requested with `start: 50` and no `count`  
**When** the full sync runs  
**Then** all 795 existing pubs are loaded from Firestore  
**And** sitemap entries from index 50 to 799 are processed (750 pubs)  
**And** pubs are matched, created, or updated as needed  
**And** closure detection is skipped because start > 0  
**And** no pubs are marked as closed  
**And** logs indicate:
- "📍 Loaded 795 existing pubs from Firestore"
- "📋 Processing 750 of 800 pubs (start: 50, count: all)"
- "⚠️  Skipping closure detection (partial sync: start=50, count=all)"
- "✅ Full sync complete: 750 processed, X new, Y updated, 0 closed, Z skipped, E errors"

#### Scenario: Partial Sync with Count Limit (No Closure Detection)
**Given** the sitemap contains 800 pub entries  
**And** Firestore has 795 existing pubs  
**And** a full sync is requested with `count: 100` and `start: 0`  
**When** the full sync runs  
**Then** all 795 existing pubs are loaded from Firestore  
**And** the first 100 sitemap entries are processed  
**And** pubs are matched, created, or updated as needed  
**And** closure detection is skipped because count is limited  
**And** no pubs are marked as closed  
**And** logs indicate:
- "📍 Loaded 795 existing pubs from Firestore"
- "📋 Processing 100 of 800 pubs (start: 0, count: 100)"
- "⚠️  Skipping closure detection (partial sync: start=0, count=100)"
- "✅ Full sync complete: 100 processed, X new, Y updated, 0 closed, Z skipped, E errors"

#### Scenario: Partial Sync with Both Start and Count (No Closure Detection)
**Given** the sitemap contains 800 pub entries  
**And** a full sync is requested with `start: 200` and `count: 50`  
**When** the full sync runs  
**Then** sitemap entries from index 200 to 249 are processed (50 pubs)  
**And** closure detection is skipped because both start > 0 AND count is specified  
**And** no pubs are marked as closed  
**And** logs indicate:
- "⚠️  Skipping closure detection (partial sync: start=200, count=50)"
- "✅ Full sync complete: 50 processed, X new, Y updated, 0 closed, Z skipped, E errors"

_(Scenario "Limiting to First 5 Pubs" is removed as this constraint no longer applies)_

---

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

### Requirement: On-Demand Sync Invocation (REQ-SDS-015)
**Priority:** MUST  
**Category:** Functional

The system MUST provide a Firebase Callable Function that allows authorized administrators to trigger pub syncs on-demand with proper timeout configuration.

**Acceptance Criteria:**
- Function is exposed as `syncPubsOnDemand` using Firebase `onCall` trigger
- Function is deployed to the same region as scheduled sync (europe-west2)
- Function has the same memory allocation as scheduled sync (256MiB)
- Function has a timeout of 600 seconds (10 minutes) that is properly enforced
- Function configuration includes `maxInstances: 1` to prevent concurrent execution issues
- Function runtime options are correctly configured for Firebase Functions v2 API
- Function requires authentication (caller must be signed in with Firebase Auth)
- Function execution is logged with caller UID, parameters, and execution duration
- Function returns success/failure counts to caller
- Function completes long-running syncs (100+ pubs, 5-10 minutes) without timing out prematurely
- Function can be invoked via Firebase SDK, CLI, or other Firebase functions
- Deployment includes the function in Firebase Functions export

#### Scenario: Successful On-Demand Full Sync
**Given** an authenticated admin user with matching UID  
**And** a valid request with `{ mode: 'full', count: 10 }`  
**When** the callable function is invoked  
**Then** the function executes `runFullSync(10, 0)`  
**And** the function returns `{ mode: 'full', successCount: X, failureCount: Y, parameters: { count: 10, start: 0 } }`  
**And** the invocation is logged with caller UID and parameters  
**And** pub data is synced to Firestore

#### Scenario: Successful On-Demand Update Sync
**Given** an authenticated admin user with matching UID  
**And** a valid request with `{ mode: 'update', since: '2026-01-05T00:00:00Z' }`  
**When** the callable function is invoked  
**Then** the function parses the ISO 8601 date string to a Date object  
**And** the function executes `runUpdateSync(new Date('2026-01-05T00:00:00Z'))`  
**And** the function returns `{ mode: 'update', successCount: X, failureCount: Y, parameters: { since: '2026-01-05T00:00:00Z' } }`  
**And** the invocation is logged with caller UID and parameters  
**And** pub data is synced to Firestore

#### Scenario: Invocation from Firebase CLI
**Given** the function is deployed  
**And** the admin user is authenticated with Firebase CLI  
**When** `firebase functions:call syncPubsOnDemand --data '{"mode":"full","count":5}'` is executed  
**Then** the function executes successfully  
**And** the CLI displays the returned success/failure counts  
**And** 5 pubs are processed

#### Scenario: Long-Running Sync Completes Within Timeout
**Given** an authenticated admin user with matching UID  
**And** a valid request with `{ mode: 'full', count: 100 }`  
**And** the sync takes approximately 8 minutes to process 100 pubs  
**When** the callable function is invoked  
**Then** the function starts execution and logs start time  
**And** the function processes all 100 pubs  
**And** the function completes successfully after ~8 minutes  
**And** the function does NOT timeout before the 10-minute limit  
**And** execution duration is logged: "Sync completed in 8m 15s"  
**And** the function returns success/failure counts  
**And** pub data is synced to Firestore

---

### Requirement: Administrator Authorization (REQ-SDS-016)
**Priority:** MUST  
**Category:** Security

The on-demand sync function MUST restrict access to authorized administrator user IDs.

**Acceptance Criteria:**
- Function reads admin user ID from environment variable `ADMIN_USER_ID`
- Function verifies `context.auth.uid` matches the configured admin user ID
- Unauthenticated requests are rejected with `permission-denied` error
- Requests from non-admin authenticated users are rejected with `permission-denied` error
- Error message does not reveal admin user ID
- Authorization check occurs before any sync logic executes
- Authorization failure is logged with attempted caller UID
- Environment variable can be configured separately for dev/prod environments

#### Scenario: Unauthorized Access - Not Authenticated
**Given** a request is made without Firebase Auth credentials  
**When** the callable function is invoked  
**Then** the function throws a `permission-denied` error  
**And** the error message is "Unauthorized: Admin access required"  
**And** no sync operations are performed  
**And** the attempt is logged

#### Scenario: Unauthorized Access - Wrong User
**Given** an authenticated user with UID "user123"  
**And** the environment variable `ADMIN_USER_ID` is set to "admin456"  
**When** the callable function is invoked  
**Then** the function compares "user123" with "admin456"  
**And** the function throws a `permission-denied` error  
**And** the error message is "Unauthorized: Admin access required"  
**And** no sync operations are performed  
**And** the attempt is logged with UID "user123"

#### Scenario: Authorized Access
**Given** an authenticated user with UID "admin456"  
**And** the environment variable `ADMIN_USER_ID` is set to "admin456"  
**When** the callable function is invoked  
**Then** the function compares "admin456" with "admin456"  
**And** authorization succeeds  
**And** the function proceeds to parameter validation and sync execution  
**And** the authorized invocation is logged with UID "admin456"

---

### Requirement: Sync Mode Parameter Handling (REQ-SDS-017)
**Priority:** MUST  
**Category:** Functional

The on-demand sync function MUST accept and validate parameters for both full sync and update sync modes.

**Acceptance Criteria:**
- Function accepts a `mode` parameter with values `'full'` or `'update'`
- For `mode: 'full'`, function accepts optional `count` (number) and `start` (number) parameters
- For `mode: 'update'`, function accepts required `since` (ISO 8601 date string) parameter
- Missing `mode` parameter throws `invalid-argument` error
- Invalid `mode` value throws `invalid-argument` error
- Negative `count` value throws `invalid-argument` error
- Negative `start` value throws `invalid-argument` error
- Invalid `since` date string throws `invalid-argument` error
- Missing `since` parameter for update mode throws `invalid-argument` error
- Default `start` value is 0 when omitted in full sync mode
- Parameters are passed to corresponding sync functions (`runFullSync` or `runUpdateSync`)
- Returned response includes the mode and parameters used

#### Scenario: Full Sync with Count and Start
**Given** an authorized admin user  
**And** a request with `{ mode: 'full', count: 20, start: 10 }`  
**When** the function validates parameters  
**Then** validation succeeds  
**And** the function calls `runFullSync(20, 10)`  
**And** the response includes `{ mode: 'full', parameters: { count: 20, start: 10 }, ... }`

#### Scenario: Full Sync with Count Only (Default Start)
**Given** an authorized admin user  
**And** a request with `{ mode: 'full', count: 15 }`  
**When** the function validates parameters  
**Then** validation succeeds  
**And** `start` defaults to 0  
**And** the function calls `runFullSync(15, 0)`  
**And** the response includes `{ mode: 'full', parameters: { count: 15, start: 0 }, ... }`

#### Scenario: Full Sync with No Parameters (Complete Sync)
**Given** an authorized admin user  
**And** a request with `{ mode: 'full' }`  
**When** the function validates parameters  
**Then** validation succeeds  
**And** the function calls `runFullSync(undefined, 0)`  
**And** all pubs in the sitemap are processed  
**And** the response includes `{ mode: 'full', parameters: {}, ... }`

#### Scenario: Update Sync with Valid Date
**Given** an authorized admin user  
**And** a request with `{ mode: 'update', since: '2026-01-01T00:00:00Z' }`  
**When** the function validates parameters  
**Then** validation succeeds  
**And** the ISO string is parsed to a Date object  
**And** the function calls `runUpdateSync(new Date('2026-01-01T00:00:00Z'))`  
**And** the response includes `{ mode: 'update', parameters: { since: '2026-01-01T00:00:00Z' }, ... }`

#### Scenario: Invalid Mode Parameter
**Given** an authorized admin user  
**And** a request with `{ mode: 'partial' }`  
**When** the function validates parameters  
**Then** validation fails  
**And** the function throws an `invalid-argument` error  
**And** the error message is "Invalid mode. Must be 'full' or 'update'"

#### Scenario: Missing Mode Parameter
**Given** an authorized admin user  
**And** a request with `{ count: 10 }`  
**When** the function validates parameters  
**Then** validation fails  
**And** the function throws an `invalid-argument` error  
**And** the error message is "Missing required parameter: mode"

#### Scenario: Negative Count Parameter
**Given** an authorized admin user  
**And** a request with `{ mode: 'full', count: -5 }`  
**When** the function validates parameters  
**Then** validation fails  
**And** the function throws an `invalid-argument` error  
**And** the error message is "Invalid count. Must be a non-negative number"

#### Scenario: Invalid Date String
**Given** an authorized admin user  
**And** a request with `{ mode: 'update', since: 'not-a-date' }`  
**When** the function validates parameters  
**Then** validation fails  
**And** the function throws an `invalid-argument` error  
**And** the error message is "Invalid since date. Must be a valid ISO 8601 date string"

#### Scenario: Missing Since Parameter for Update Mode
**Given** an authorized admin user  
**And** a request with `{ mode: 'update' }`  
**When** the function validates parameters  
**Then** validation fails  
**And** the function throws an `invalid-argument` error  
**And** the error message is "Missing required parameter for update mode: since"

---

### Requirement: Error Handling and Response (REQ-SDS-018)
**Priority:** MUST  
**Category:** Functional

The on-demand sync function MUST handle errors gracefully and return structured responses.

**Acceptance Criteria:**
- Authorization errors throw `HttpsError` with code `permission-denied`
- Parameter validation errors throw `HttpsError` with code `invalid-argument`
- Sync execution errors are caught, logged, and thrown as `HttpsError` with code `internal`
- Success responses include `mode`, `successCount`, `failureCount`, and `parameters` fields
- All errors include descriptive messages
- Errors do not expose sensitive information (e.g., admin UIDs, internal file paths)
- Sync function errors from `runFullSync`/`runUpdateSync` are propagated to caller

#### Scenario: Sync Execution Error
**Given** an authorized admin user with valid parameters  
**And** the `runFullSync` function throws an error  
**When** the callable function catches the error  
**Then** the error is logged with full stack trace  
**And** an `internal` error is thrown to the caller  
**And** the error message is "Sync execution failed. Check logs for details"  
**And** no sensitive information is included in the error message

#### Scenario: Successful Response Format
**Given** an authorized admin user  
**And** a request with `{ mode: 'full', count: 5 }`  
**And** the sync completes with 5 successes and 0 failures  
**When** the function returns  
**Then** the response is `{ mode: 'full', successCount: 5, failureCount: 0, parameters: { count: 5, start: 0 } }`  
**And** the response is JSON-serializable  
**And** the caller receives the response via the callable SDK

---

### Requirement: Environment Configuration (REQ-SDS-019)
**Priority:** MUST  
**Category:** Configuration

The system MUST support configuring the admin user ID via environment variables for different environments.

**Acceptance Criteria:**
- Admin user ID is read from environment variable `ADMIN_USER_ID`
- Variable can be set in `.env` file for local development
- Variable can be set via `firebase functions:config:set` for production
- Missing environment variable is handled gracefully (function fails fast with clear error)
- Different values can be configured for development, staging, and production
- Environment variable is not committed to version control
- Documentation includes instructions for setting the variable

#### Scenario: Development Environment Configuration
**Given** a local development environment  
**And** a `.env` file with `ADMIN_USER_ID=dev-admin-uid`  
**When** the function runs locally or in emulator  
**Then** the function reads "dev-admin-uid" as the admin user ID  
**And** requests from users with UID "dev-admin-uid" are authorized

#### Scenario: Production Environment Configuration
**Given** a production Firebase environment  
**And** the config is set via `firebase functions:config:set admin.user_id=prod-admin-uid`  
**When** the function is deployed to production  
**Then** the function reads "prod-admin-uid" from `process.env.ADMIN_USER_ID`  
**And** requests from users with UID "prod-admin-uid" are authorized

#### Scenario: Missing Environment Variable
**Given** the environment variable `ADMIN_USER_ID` is not set  
**When** an authenticated user calls the function  
**Then** the function checks for the environment variable  
**And** the function throws an `internal` error  
**And** the error message is "Server configuration error: ADMIN_USER_ID not set"  
**And** the error is logged for administrators to fix

---

