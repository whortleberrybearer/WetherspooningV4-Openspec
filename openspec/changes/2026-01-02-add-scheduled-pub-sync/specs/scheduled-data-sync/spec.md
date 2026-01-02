# scheduled-data-sync Specification

## Purpose
Automatically synchronize pub data from the Wetherspoon's website to keep the database current without manual intervention.

## ADDED Requirements

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

### Requirement: Limited Pub Processing (REQ-SDS-003)
**Priority:** MUST  
**Category:** Functional

The system MUST initially process only the first 5 pub URLs from the sitemap.

**Acceptance Criteria:**
- After extracting all URLs from sitemap, only first 5 are selected
- Selection is deterministic (always the same 5 for same sitemap)
- Array slicing or equivalent is used: `urls.slice(0, 5)`
- Remaining URLs are ignored in this iteration
- Function logs how many URLs were extracted and how many are being processed

#### Scenario: Limiting to First 5 Pubs
**Given** the sitemap contains 100 pub URLs  
**When** URLs are extracted from the sitemap  
**Then** all 100 URLs are initially extracted  
**And** only the first 5 URLs are selected for processing  
**And** a log message indicates "Processing 5 of 100 pubs"  
**And** the remaining 95 URLs are discarded

---

### Requirement: Pub Name Extraction (REQ-SDS-004)
**Priority:** MUST  
**Category:** Functional

The system MUST scrape each pub's webpage to extract the pub name.

**Acceptance Criteria:**
- For each pub URL, an HTTP GET request is made
- HTML response is parsed using cheerio
- Pub name is extracted from `<h1 class="wp-block-heading">` element
- HTML entities (&#038; and &amp;) are decoded to & character
- Extracted name is trimmed of leading/trailing whitespace
- Empty or missing names are handled (logged and skipped)
- HTTP errors for individual pubs are logged but don't stop processing of other pubs
- Parse errors are logged but don't stop processing

#### Scenario: Successful Name Extraction
**Given** a pub URL "https://www.jdwetherspoon.com/pubs/star-light-hounslow/"  
**When** the function fetches and parses the page  
**Then** an HTTP GET request is made to the URL  
**And** the HTML response is parsed  
**And** the pub name is extracted from `<h1 class="wp-block-heading">` element  
**And** the name is "Star Light"  
**And** the name is trimmed and returned  
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

The system MUST write extracted pub data to the Firestore `pubs` collection.

**Acceptance Criteria:**
- Document ID is derived from pub URL slug (last segment of path)
- Document contains fields: `id`, `name`, `url`, `imageUrl`, `lastSyncedAt`
- `imageUrl` field contains the image URL extracted from sitemap
- `lastSyncedAt` is set to current server timestamp
- Data is written using `set()` with merge option or upsert equivalent
- Existing documents are updated (not creating duplicates)
- Firestore write errors are caught and logged
- Write errors cause function to fail (critical operation)

#### Scenario: Write New Pub to Firestore
**Given** a pub named "Star Light" with URL "https://www.jdwetherspoon.com/pubs/star-light-hounslow/"  
**And** imageUrl is "https://www.jdwetherspoon.com/wp-content/uploads/2024/06/7649-feature.png"  
**And** the pub does not exist in Firestore  
**When** the function writes the pub data  
**Then** a new document is created in the `pubs` collection  
**And** the document ID is "star-light-hounslow"  
**And** the document contains `id`, `name`, `url`, `imageUrl`, and `lastSyncedAt` fields  
**And** `name` is "Star Light"  
**And** `url` is the full source URL  
**And** `imageUrl` is the image URL from sitemap  
**And** `lastSyncedAt` is the current timestamp

#### Scenario: Update Existing Pub in Firestore
**Given** a pub that already exists in Firestore  
**And** the scraped name is "Star Light"  
**And** the imageUrl is "https://www.jdwetherspoon.com/wp-content/uploads/2024/06/7649-feature.png"  
**When** the function writes the pub data  
**Then** the existing document is updated  
**And** the `name` field is set to "Star Light"  
**And** the `imageUrl` field is set to the image URL  
**And** the `lastSyncedAt` field is updated to current timestamp  
**And** the document ID remains unchanged  
**And** no duplicate documents are created

#### Scenario: Firestore Write Failure
**Given** a network error occurs during Firestore write  
**When** the function attempts to write pub data  
**Then** a Firestore error is caught  
**And** the error is logged with context (pub name, URL)  
**And** the function execution fails  
**And** remaining pubs are not processed

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
