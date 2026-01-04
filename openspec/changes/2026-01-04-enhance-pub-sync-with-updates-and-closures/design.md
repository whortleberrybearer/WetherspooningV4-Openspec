# Design Document: Pub Sync Updates and Closures

**Change ID:** `2026-01-04-enhance-pub-sync-with-updates-and-closures`  
**Status:** Draft  
**Created:** 2026-01-04

## Overview

This document outlines the technical design for enhancing the scheduled pub sync with intelligent matching, change detection, and closure management.

## Architecture

### High-Level Flow

```
┌─────────────────────────┐
│  Scheduled Trigger      │
│  (Full or Update Sync)  │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│  Load Existing Pubs     │◄─── Full Sync Only
│  from Firestore         │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│  Fetch Sitemap Entries  │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│  For Each Entry:        │
│  1. Scrape pub data     │
│  2. Find matching pub   │
│  3. Detect changes      │
│  4. Update if changed   │
│  5. Mark as processed   │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│  Mark Unprocessed Pubs  │◄─── Full Sync Only
│  as Closed              │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│  Batch Write to         │
│  Firestore              │
└─────────────────────────┘
```

## Component Design

### 1. Pub Matching Service

**Purpose:** Find existing pub records that match scraped data

**Matching Algorithm:**
```typescript
function findMatchingPub(
  scrapedPub: ScrapedPubData,
  existingPubs: Pub[]
): Pub | null {
  // Tier 1: URL match (most reliable)
  let match = existingPubs.find(p => p.url === scrapedPub.url);
  if (match) return match;
  
  // Tier 2: Name + TownCity match (handles URL changes)
  // Only match against open pubs to avoid resurrecting closed ones
  match = existingPubs.find(p => 
    p.openState === 'Open' &&
    p.name === scrapedPub.name &&
    p.townCity === scrapedPub.townCity
  );
  if (match) return match;
  
  // Tier 3: Address match (handles name and URL changes)
  // Only match against open pubs and if address is non-empty and meaningful
  if (scrapedPub.address && scrapedPub.address.length > 10) {
    match = existingPubs.find(p => 
      p.openState === 'Open' &&
      p.address === scrapedPub.address
    );
    if (match) return match;
  }
  
  return null; // No match found - new pub
}
```

**Trade-offs:**
- **Tier 1 (URL):** Very reliable but fails on URL changes
- **Tier 2 (Name+TownCity):** Handles URL changes, but requires openState check to avoid matching closed pubs
- **Tier 3 (Address):** Catches edge cases but slightly riskier (addresses can be formatted differently); also requires openState check to avoid resurrecting closed pubs

### 2. Change Detection

**Purpose:** Minimize database writes by only updating when data actually changes

**Comparison Strategy:**
```typescript
function hasDataChanged(
  existing: Pub,
  scraped: ScrapedPubData
): boolean {
  // Compare all mutable fields
  return (
    existing.name !== scraped.name ||
    existing.url !== scraped.url ||
    existing.imageUrl !== scraped.imageUrl ||
    existing.address !== scraped.address ||
    existing.townCity !== scraped.townCity ||
    existing.openState !== scraped.openState ||
    existing.isHotel !== scraped.isHotel ||
    existing.inAirport !== scraped.inAirport ||
    existing.inTrainStation !== scraped.inTrainStation ||
    !positionsEqual(existing.position, scraped.position) ||
    existing.country !== scraped.country ||
    existing.county !== scraped.county
  );
}

function positionsEqual(
  pos1: Position | null,
  pos2: Position | null
): boolean {
  if (pos1 === null && pos2 === null) return true;
  if (pos1 === null || pos2 === null) return false;
  return pos1.lat === pos2.lat && pos1.lng === pos2.lng;
}
```

**Edge Cases:**
- `null` vs `undefined` fields treated as equal
- Position comparison handles null cases
- Empty strings vs null treated as equal (normalized)

### 3. Closure Management

**Purpose:** Identify pubs removed from sitemap and mark them closed

**Algorithm (Full Sync Only):**
```typescript
async function markClosedPubs(
  processedPubIds: Set<string>,
  allExistingPubs: Pub[]
): Promise<void> {
  const pubsToClose = allExistingPubs.filter(pub => 
    pub.openState === 'Open' && 
    !processedPubIds.has(pub.id)
  );
  
  for (const pub of pubsToClose) {
    pub.openState = 'Closed';
    pub.url = ''; // Clear URL as it's no longer valid
    // lastSyncedAt updated to track when closure was detected
  }
  
  // Batch write closures
  await batchWritePubs(pubsToClose);
}
```

**Design Decisions:**
- Only run during full sync to avoid false closures
- Only mark `openState === 'Open'` pubs to avoid re-closing
- Clear URL to prevent confusion/broken links
- Update `lastSyncedAt` to timestamp the closure

### 4. Database Load Management

**Purpose:** Prevent Firestore quota exhaustion and timeout issues

**Batching Strategy:**
```typescript
async function batchWritePubs(
  pubs: Pub[],
  batchSize: number = 500
): Promise<void> {
  const db = getFirestore();
  
  for (let i = 0; i < pubs.length; i += batchSize) {
    const batch = db.batch();
    const chunk = pubs.slice(i, i + batchSize);
    
    for (const pub of chunk) {
      const docRef = db.collection('pubs').doc(pub.id);
      batch.set(docRef, pub, { merge: true });
    }
    
    await batch.commit();
    console.log(`✓ Committed batch ${i / batchSize + 1}: ${chunk.length} pubs`);
    
    // Rate limiting: small delay between batches
    if (i + batchSize < pubs.length) {
      await sleep(100); // 100ms delay
    }
  }
}
```

**Firestore Limits:**
- Max 500 operations per batch
- Max 10 MB per batch
- Rate limits: ~10,000 writes/second (unlikely to hit)

**Trade-offs:**
- Larger batches = fewer network round-trips but higher memory usage
- Smaller batches = more round-trips but safer for large datasets
- 500 chosen as Firestore's hard limit

### 5. Full Sync vs Update Sync

**Full Sync:**
1. Load ALL existing pubs from Firestore (required for closure detection)
2. Process all sitemap entries
3. Track processed pub IDs
4. Mark unprocessed open pubs as closed
5. Batch write all changes

**Update Sync:**
1. Do NOT load existing pubs (performance optimization)
2. Process only recently updated sitemap entries
3. Skip closure detection (can't know what's missing)
4. Write only changed pubs

**Rationale:**
- Full sync: Comprehensive but slower, required for closures
- Update sync: Fast, daily maintenance, no closure tracking

## Data Flow

### Existing Pub Lookup

During **Full Sync**:
```typescript
// Load once at start, cache in memory
const existingPubs = await getAllPubs();
const existingPubsMap = new Map(existingPubs.map(p => [p.id, p]));
```

During **Update Sync**:
```typescript
// Query per-pub as needed (no mass load)
const existingPub = await getExistingPubByUrl(url);
```

### Write Pattern

```typescript
const pubsToWrite: Pub[] = [];

for (const entry of sitemapEntries) {
  const scraped = await scrapePubData(entry);
  const existing = findMatchingPub(scraped, existingPubs);
  
  if (existing) {
    scraped.id = existing.id; // Reuse ID
    if (hasDataChanged(existing, scraped)) {
      pubsToWrite.push(createPubDocument(scraped));
    }
    processedIds.add(existing.id);
  } else {
    // New pub
    pubsToWrite.push(createPubDocument(scraped));
    processedIds.add(scraped.id);
  }
}

// Mark closures (full sync only)
if (isFullSync) {
  const closed = markClosedPubs(processedIds, existingPubs);
  pubsToWrite.push(...closed);
}

// Batch write
await batchWritePubs(pubsToWrite);
```

## Testing Strategy

### Unit Tests

**Matching Logic:**
- URL match (tier 1)
- Name+TownCity match (tier 2)
- Address match (tier 3)
- No match (new pub)
- Priority ordering (URL > Name+TownCity > Address)
- Edge cases: empty addresses, null values

**Change Detection:**
- No changes detected
- Single field change (name, url, address, etc.)
- Position change (null → value, value → null, value → different value)
- Multiple field changes
- Edge cases: null vs undefined, empty strings

**Closure Logic:**
- Mark unprocessed open pubs as closed
- Skip already closed pubs
- Clear URL on closure
- Update lastSyncedAt

**Batch Writing:**
- Batch size limits (500)
- Multiple batches
- Partial batch (< 500)
- Error handling

### Integration Tests

**Full Sync:**
- Load existing pubs
- Process sitemap
- Detect closures
- Batch write

**Update Sync:**
- Skip closure detection
- Only write changed pubs

## Performance Considerations

### Memory Usage

**Full Sync:** Loads all pubs into memory
- ~1000 pubs × ~1KB each = ~1MB
- Acceptable for current scale
- May need pagination for 10,000+ pubs

**Update Sync:** Individual queries
- No mass memory usage
- Slower per-pub but fewer pubs processed

### Database Operations

**Full Sync (worst case, all ~1000 pubs):**
- 1 query to load all existing pubs (~1 read operation with query)
- ~1000 reads (sitemap pubs) × scraping
- ~1000 writes (if all changed) ÷ 500 per batch = 2 batch commits
- Total: ~1001 reads, ~1000 writes

**Update Sync (typical, ~50 updated pubs):**
- ~50 individual queries (1 read each)
- ~50 writes ÷ 500 per batch = 1 batch commit
- Total: ~50 reads, ~50 writes

## Error Handling

### Firestore Errors
- Catch and log batch commit failures
- Continue with next batch (don't fail entire sync)
- Log failed pub IDs for manual review

### Scraping Errors
- Continue processing remaining pubs
- Log failed URLs
- Don't count as "processed" for closure detection

### Matching Errors
- If ambiguous match detected (shouldn't happen), log warning
- Default to creating new pub (safer than wrong match)

## Monitoring & Observability

**Metrics to Log:**
- Total pubs processed
- New pubs created
- Existing pubs updated
- Pubs marked closed
- Database writes skipped (no changes)
- Processing duration
- Errors encountered

**Example Log Output:**
```
✅ Full sync complete:
   - Processed: 987 pubs
   - New: 12
   - Updated: 234
   - Closed: 3
   - Skipped (no changes): 738
   - Errors: 0
   - Duration: 147s
   - Batches written: 2
```

## Future Enhancements (Out of Scope)

- Incremental sync state persistence (resume from failure)
- Pub history tracking (audit log of changes)
- Webhook notifications on closures
- Manual closure override via admin UI
- Fuzzy address matching (Levenshtein distance)
