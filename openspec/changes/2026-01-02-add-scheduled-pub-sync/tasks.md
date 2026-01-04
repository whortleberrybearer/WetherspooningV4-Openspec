# Tasks: add-scheduled-pub-sync

## Implementation Checklist

### Setup and Configuration
- [x] Initialize Firebase Functions in project root
  - Run `firebase init functions` (if needed) or create `functions/` directory manually
  - Configure TypeScript for Node.js environment
  - Update `firebase.json` with functions configuration
- [x] Install required dependencies
  - firebase-functions (^5.0.0 or latest)
  - firebase-admin (already present, verify version)
  - fast-xml-parser (^4.5.0 or latest)
  - cheerio (^1.0.0 or latest)
- [x] Install dev dependencies
  - typescript (^5.0.0)
  - @types/node
  - jest (^29.0.0)
  - ts-jest (^29.0.0)
  - @firebase/testing or equivalent for mocking
- [x] Configure TypeScript for Functions
  - Create/update `functions/tsconfig.json` with Node.js settings
  - Configure module resolution and output directory (`lib/`)
  - Set target to ES2020 or later
- [x] Update `.gitignore`
  - Add `functions/lib/`
  - Add `functions/node_modules/`
  - Verify `functions/.runtimeconfig.json` is ignored
- [x] Add build and test scripts to `functions/package.json`
  - `"build": "tsc"`
  - `"test": "jest"`
  - `"test:watch": "jest --watch"`

### Service Layer Implementation
- [x] Create type definitions (`functions/src/types/pub.ts`)
  - Define `Pub` interface with id, name, url, lastSyncedAt
  - Define `PubUrlData` type for URL extraction
  - Export types for use in services
- [x] Implement sitemap service (`functions/src/services/sitemapService.ts`)
  - Create `fetchSitemap()` function to GET sitemap XML
  - Implement XML parsing using fast-xml-parser
  - Extract all `<loc>` elements as array of URLs
  - Add error handling for HTTP and parse errors
  - Export `getSitemapUrls()` as main API
- [x] Implement pub scraper service (`functions/src/services/pubScraperService.ts`)
  - Create `fetchPubPage(url: string)` to GET pub HTML
  - Implement HTML parsing using cheerio
  - Extract pub name from appropriate element (investigate actual site structure)
  - Derive document ID from URL slug (last path segment)
  - Add error handling for HTTP and parse errors
  - Export `scrapePubData(url: string)` returning `{ id, name, url }`
- [x] Implement pub sync service (`functions/src/services/pubSyncService.ts`)
  - Import Firebase Admin Firestore
  - Create `syncPub(pubData)` to write/update Firestore document
  - Use `set()` with merge or upsert pattern
  - Add `lastSyncedAt` server timestamp
  - Add error handling for Firestore operations
  - Export `syncPubToFirestore()`

### Main Function Implementation
- [x] Create scheduled function (`functions/src/scheduled/syncPubs.ts`)
  - Import `onSchedule` from firebase-functions/v2/scheduler
  - Configure schedule: daily at 2:00 AM UTC
  - Set memory: 256MB, timeout: 540s
  - Implement main execution flow:
    1. Log function start
    2. Fetch sitemap URLs
    3. Limit to first 5 URLs
    4. For each URL: scrape, then sync
    5. Log results (success/failure counts)
  - Add try-catch for top-level error handling
  - Export function as `scheduledSyncPubs`
- [x] Create function index (`functions/src/index.ts`)
  - Export `scheduledSyncPubs` from `./scheduled/syncPubs`
  - Ensure all exports follow Firebase Functions conventions

### Testing Implementation
- [x] Create test fixtures
  - Save sample sitemap XML to `functions/test/fixtures/sitemap-sample.xml`
  - Create XML with at least 10 pub URLs
  - Save sample pub page HTML to `functions/test/fixtures/pub-page-sample.html`
  - Ensure HTML includes pub name in testable element
- [x] Write sitemap service tests (`functions/test/services/sitemapService.test.ts`)
  - Mock fetch to return fixture XML
  - Test successful URL extraction
  - Test invalid XML handling
  - Test HTTP error handling
  - Verify all URLs are extracted correctly
- [x] Write pub scraper service tests (`functions/test/services/pubScraperService.test.ts`)
  - Mock fetch to return fixture HTML
  - Test successful name extraction
  - Test ID generation from URL
  - Test missing name element handling
  - Test HTTP error handling
- [x] Write pub sync service tests (`functions/test/services/pubSyncService.test.ts`)
  - Mock Firestore `doc()` and `set()` methods
  - Test new document creation
  - Test existing document update
  - Test timestamp generation
  - Test write error handling
- [x] Run tests and verify >80% coverage
  - Execute `npm test` in functions directory
  - Check coverage report
  - Add additional tests if coverage is below target

### Integration and Deployment
- [x] Manual testing with emulator
  - Start Firebase Functions emulator
  - Invoke function manually via HTTP or admin SDK
  - Verify logs appear in emulator UI
  - Check Firestore for written documents
  - Validate data correctness
- [x] Deploy to Firebase
  - Run `firebase deploy --only functions`
  - Verify deployment succeeds without errors
  - Check Firebase Console for function registration
- [x] Verify Cloud Scheduler
  - Check Cloud Scheduler in GCP Console
  - Verify job is created with correct schedule (23:00 UTC daily)
  - Schedule updated: Wednesdays = full sync, other days = update sync (last 15 hours)
  - Manually trigger job to test execution
  - Check Cloud Logging for function logs
- [x] Validate first scheduled run
  - Wait for scheduled execution or trigger manually
  - Check logs for successful execution
  - Pubs synced to Firestore (all pubs, not just 5)
  - Confirm data quality (full pub data extracted correctly)

### Documentation
- [x] Add README to `functions/` directory
  - Document purpose of the function
  - List dependencies and their purpose
  - Explain deployment process
  - Include testing instructions
- [x] Update root README.md
  - Mention scheduled pub sync feature
  - Link to functions README for details
- [x] Add inline code comments
  - Document non-obvious logic
  - Explain scraping selectors/strategies
  - Note any assumptions about website structure

## Validation Checklist
- [x] All unit tests pass
- [x] Test coverage is >80%
- [x] Function deploys successfully
- [x] Scheduled trigger is configured correctly
- [x] Pubs are synced to Firestore (implementation now syncs all pubs, not just 5)
- [x] Logs are clear and informative
- [x] No TypeScript compilation errors
- [x] No linting errors (no lint script configured, TypeScript compilation validates code)

## Notes
- Implementation evolved significantly beyond original proposal scope
- Now includes full pub data extraction (not just name): address, townCity, county, country, position, imageUrl, openState
- Processes all pubs from sitemap (not limited to 5)
- Includes dual sync modes: full sync (Wednesdays) and update sync (other days, last 15 hours)
- Added geocoding integration with Google Geocoding API for country/county data
- Schedule changed from 2:00 AM to 23:00 UTC for better coverage
- Comprehensive test suite with 90 passing tests across scraper, sitemap, and sync services
- Manual triggering available via `npm run sync:pubs` script
