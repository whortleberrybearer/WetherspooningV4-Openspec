# Design Document: add-scheduled-pub-sync

## Architecture Overview
This change introduces a Firebase Cloud Function that runs on a daily schedule to scrape pub data from the Wetherspoon's website and sync it to Firestore.

## Technical Design

### Component Structure
```
functions/
├── src/
│   ├── scheduled/
│   │   └── syncPubs.ts              # Main scheduled function
│   ├── services/
│   │   ├── sitemapService.ts        # Sitemap fetching and parsing
│   │   ├── pubScraperService.ts     # Pub page scraping
│   │   └── pubSyncService.ts        # Firestore sync logic
│   └── types/
│       └── pub.ts                   # Type definitions
├── test/
│   ├── services/
│   │   ├── sitemapService.test.ts
│   │   ├── pubScraperService.test.ts
│   │   └── pubSyncService.test.ts
│   └── fixtures/
│       ├── sitemap-sample.xml
│       └── pub-page-sample.html
├── package.json
└── tsconfig.json
```

### Data Flow
1. **Trigger:** Cloud Scheduler triggers the `syncPubs` function daily at 2:00 AM UTC
2. **Fetch Sitemap:** Function fetches XML from https://www.jdwetherspoon.com/pubs-sitemap.xml
3. **Parse URLs:** Extract pub URLs from sitemap `<loc>` elements
4. **Limit Scope:** Take first 5 URLs for initial implementation
5. **Scrape Pages:** For each URL, fetch HTML and extract pub name
6. **Write to Firestore:** Upsert pub data to `pubs` collection
7. **Log Results:** Log success/failure counts

### Technology Choices

#### XML Parser: fast-xml-parser
**Rationale:**
- Lightweight and fast
- TypeScript support
- Well-maintained with 5M+ weekly downloads
- Simple API for extracting values from XML

**Alternatives Considered:**
- xml2js: More verbose API, callback-based
- node-xml-stream: Streaming parser, overkill for sitemap

#### HTTP Client: node-fetch
**Rationale:**
- Familiar fetch API (same as browser)
- Already commonly used in Node.js
- Promise-based, works well with async/await
- Minimal dependencies

**Alternatives Considered:**
- axios: More features but heavier
- native http module: Lower-level, more complex

#### HTML Parser: cheerio
**Rationale:**
- jQuery-like API, familiar to developers
- Fast and lightweight
- Excellent for server-side HTML parsing
- Works well with incomplete/malformed HTML

**Alternatives Considered:**
- jsdom: Full DOM implementation, heavier and slower
- node-html-parser: Lighter but less feature-rich

#### Testing Framework: Jest
**Rationale:**
- Standard in TypeScript/Node.js ecosystem
- Built-in mocking capabilities
- Good TypeScript support
- Firebase Functions documentation uses Jest

### Firestore Schema

#### Collection: `pubs`
Each document represents a pub location.

**Document ID:** Derived from the pub URL slug (e.g., `the-moon-under-water-leicester-square`)

**Fields:**
```typescript
{
  id: string;           // Document ID
  name: string;         // Extracted from webpage
  url: string;          // Source URL from sitemap
  lastSyncedAt: Timestamp;  // When this data was last updated
  // Future fields (not in initial implementation):
  // address, townCity, county, region, country, position, imageUrl, openState
}
```

**Rationale:**
- Using URL slug as ID provides stable identifier
- `lastSyncedAt` helps track freshness
- Minimal fields for initial implementation
- Structure allows extension in future iterations

### Scheduling Strategy

**Schedule:** Daily at 2:00 AM UTC

**Rationale:**
- Off-peak hours for both Wetherspoon's site and our users
- Allows data to be fresh for daytime usage
- UTC avoids daylight saving time complications

**Configuration:**
```typescript
export const scheduledSyncPubs = onSchedule(
  {
    schedule: 'every day 02:00',
    timeZone: 'UTC',
    memory: '256MB',
    timeoutSeconds: 540 // 9 minutes
  },
  async (event) => {
    // Implementation
  }
);
```

### Error Handling Strategy

For this initial implementation:
- **Fetch errors:** Log and fail the entire function (no retry)
- **Parse errors:** Log and skip individual pub (continue processing)
- **Write errors:** Log and fail the function (Firestore errors are critical)

**Rationale:** Keep initial implementation simple and observable. Advanced retry logic and partial failure handling will be added in future iterations.

### Testing Strategy

**Unit Tests:**
- `sitemapService.test.ts`: Test XML parsing with fixture data
- `pubScraperService.test.ts`: Test HTML parsing with fixture data
- `pubSyncService.test.ts`: Test Firestore interactions with mocks

**Test Data:**
- Save sample sitemap XML to `fixtures/sitemap-sample.xml`
- Save sample pub page HTML to `fixtures/pub-page-sample.html`
- Mock Firestore using `@firebase/testing` or manual mocks

**Coverage Target:** >80% line coverage

### Deployment Process

1. **Setup Functions:** Initialize Firebase Functions in the project
2. **Install Dependencies:** Add required npm packages
3. **Build:** Compile TypeScript to JavaScript
4. **Deploy:** Use `firebase deploy --only functions`
5. **Verify:** Check Cloud Scheduler for scheduled execution

### Security Considerations

- **No Authentication Required:** Wetherspoon's sitemap and pub pages are public
- **Rate Limiting:** Initially processing only 5 pubs, no rate limit needed
- **Data Privacy:** No user data involved, only public business information
- **Firestore Rules:** Function uses Admin SDK, bypasses security rules (acceptable for server-side sync)

### Performance Considerations

**Expected Performance:**
- Sitemap fetch: ~500ms
- 5 pub page fetches: ~2-3 seconds (parallel)
- Parsing and writes: ~500ms
- **Total:** ~3-4 seconds well within timeout

**Memory Usage:**
- Small XML (sitemap): <100KB
- 5 HTML pages: ~500KB total
- **Memory Allocation:** 256MB sufficient

### Future Extensibility

This design allows for future enhancements:
1. **Incremental Processing:** Track last processed URL, resume from there
2. **Full Data Extraction:** Add address, coordinates, opening hours
3. **Change Detection:** Compare with existing data, only update changed fields
4. **Batch Processing:** Process in chunks with delays to avoid rate limits
5. **Monitoring:** Add custom metrics for success rate, processing time
6. **Manual Trigger:** Add HTTP function for manual sync
7. **Webhook Updates:** Replace polling with push notifications if Wetherspoon's provides webhooks

## Open Design Decisions

### 1. Document ID Strategy
**Options:**
- **A) URL slug:** `the-moon-under-water-leicester-square`
- **B) Generated UUID:** `a1b2c3d4-e5f6-...`
- **C) Numeric ID from source:** Extract from URL if available

**Recommendation:** Option A (URL slug)
- Human-readable and debuggable
- Stable across runs (idempotent)
- Matches Wetherspoon's identifier scheme

### 2. Upsert vs Skip Logic
**Options:**
- **A) Always upsert:** Overwrite existing documents
- **B) Skip existing:** Only write if document doesn't exist
- **C) Merge:** Only update if data has changed

**Recommendation:** Option A (Always upsert) for initial implementation
- Simple and predictable
- Ensures data is always current
- Can optimize to Option C later

### 3. Logging Approach
**Options:**
- **A) Console logs only:** Uses Cloud Logging automatically
- **B) Structured logging:** Custom logger with levels
- **C) External service:** Send to third-party (e.g., Sentry)

**Recommendation:** Option A (Console logs) for initial implementation
- Zero setup cost
- Integrates with GCP naturally
- Sufficient for debugging and monitoring

## Risks and Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Wetherspoon's website structure changes | High | Medium | Manual fix required; add monitoring to detect |
| Function timeout with scale | Medium | Low | Currently only 5 pubs; add pagination later |
| Sitemap URL changes or becomes unavailable | High | Low | Add error alerts; document manual override |
| Firestore write limits exceeded | Low | Very Low | 5 writes/day well below limits |

## Dependencies on Other Changes

- None. This is a standalone capability.

## Migration Path

No migration needed for initial implementation. Future iterations may require:
- Schema updates (add new fields)
- Data backfill (populate historical data)
