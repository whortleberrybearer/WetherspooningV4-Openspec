# Change Proposal: add-scheduled-pub-sync

## Metadata
- **Change ID:** 2026-01-02-add-scheduled-pub-sync
- **Status:** Proposed
- **Created:** 2026-01-02
- **Author:** AI Assistant

## Overview
Implement a scheduled Firebase Function that runs daily to sync pub data from the Wetherspoon's website. This ensures the database stays up-to-date with the latest pub information automatically.

## Motivation
Currently, pub data is manually managed and may become outdated. An automated sync process will:
- Keep pub information current without manual intervention
- Provide a foundation for detecting new pubs, closures, and updates
- Ensure users have access to accurate, fresh data

## Objectives
1. Create a Firebase Cloud Function that runs on a daily schedule
2. Fetch and parse the Wetherspoon's sitemap (https://www.jdwetherspoon.com/pubs-sitemap.xml)
3. Extract pub URLs from the sitemap
4. Initially process the first 5 pubs to validate the approach
5. Extract pub name from each pub's page
6. Write extracted data to Firestore
7. Ensure the function is unit testable
8. Deploy the function to Firebase

## Non-Goals
- Full-featured scraping of all pub details (name only for initial implementation)
- Processing all pubs in the sitemap (limited to 5 initially)
- Error recovery and retry logic (will be added in future iterations)
- Incremental updates (initial version will be a simple sync)
- Historical change tracking

## Scope
### In Scope
- Firebase Functions setup and configuration
- Scheduled trigger (daily execution)
- Sitemap fetching and XML parsing
- URL extraction from sitemap
- Basic pub page scraping (name extraction)
- Firestore write operations for pub data
- Unit tests for scraping and parsing logic
- Deployment configuration

### Out of Scope
- Complete pub data extraction (address, opening hours, etc.)
- Processing more than 5 pubs
- Sophisticated error handling and retries
- Rate limiting and throttling
- Duplicate detection beyond basic ID matching
- Data validation and schema enforcement
- Monitoring and alerting

## Affected Capabilities
- **NEW:** `scheduled-data-sync` - Automated daily synchronization of pub data from external source

## Dependencies
- Firebase Functions SDK
- XML parser library (e.g., fast-xml-parser or xml2js)
- HTTP client library (node-fetch or axios)
- HTML parser library (e.g., cheerio or jsdom)
- Firebase Admin SDK (already present)

## Open Questions
1. Should we use the pub URL from the sitemap as a stable identifier, or generate our own IDs?
2. What should happen if a pub already exists in the database - update, skip, or merge?
3. Should the function log progress and errors to Cloud Logging, or use a separate logging mechanism?
4. What timezone should be used for the daily schedule?
5. Should we add a manual trigger endpoint for testing/debugging?

## Success Criteria
- Firebase Function deploys successfully
- Function executes on daily schedule
- Sitemap is fetched and parsed correctly
- First 5 pub URLs are extracted
- Pub names are scraped from the website
- Data is written to Firestore
- Unit tests achieve >80% code coverage
- Function execution completes within Cloud Functions timeout limits
