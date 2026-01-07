# Design: Firestore Caching Architecture

## Overview

This document outlines the technical architecture for implementing client-side caching of Firestore data to reduce read operations by >90% while maintaining data freshness and preparing for future cloud function integration.

## Architecture Principles

1. **Single Responsibility:** Caching logic isolated in dedicated service layer
2. **Transparency:** Existing callers should not require significant changes
3. **TTL-based invalidation:** Time-based expiry for shared data (pubs)
4. **Event-based invalidation:** Mutation-triggered invalidation for user data (visits)
5. **Future-proof:** Design supports future cloud function data sources

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Vue Components                         │
│  (PubLocationsMap, PubDetailSheet, useVisits composable)   │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  │ getAllPubs() / getUserVisits()
                  │
┌─────────────────▼───────────────────────────────────────────┐
│              firebaseDataService.ts                         │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Uses cachingService internally                     │   │
│  │  - Checks cache before Firestore read               │   │
│  │  - Returns cached data if valid                     │   │
│  │  - Fetches from Firestore on cache miss/expiry      │   │
│  │  - Updates cache with fresh data                    │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  │ get() / set() / invalidate()
                  │
┌─────────────────▼───────────────────────────────────────────┐
│                 cachingService.ts                           │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Generic in-memory cache with TTL                   │   │
│  │  - Key-value store (Map)                            │   │
│  │  - Per-entry TTL tracking                           │   │
│  │  - Automatic expiry checking                        │   │
│  │  - Manual invalidation support                      │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Component Design

### 1. cachingService.ts (New)

**Purpose:** Generic caching utility with TTL support

**Interface:**
```typescript
interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number // milliseconds
}

interface CachingService {
  get<T>(key: string): T | null
  set<T>(key: string, data: T, ttl: number): void
  invalidate(key: string): void
  invalidateAll(): void
  isValid(key: string): boolean
}
```

**Implementation Details:**
- In-memory Map-based storage
- TTL stored per entry (milliseconds since epoch)
- `get()` auto-expires stale entries
- No localStorage persistence (not needed for session-scoped data)
- Type-safe generic interface

**Cache Keys:**
- `pubs:all` - All pub data
- `visits:${userId}` - Per-user visit data

**Configuration:**
```typescript
const CACHE_CONFIG = {
  PUBS_TTL: 24 * 60 * 60 * 1000,     // 24 hours
  VISITS_TTL: Infinity,               // Never expire (manual invalidation only)
}
```

### 2. firebaseDataService.ts (Modified)

**Changes to `getAllPubs()`:**
```typescript
export async function getAllPubs(): Promise<Pub[]> {
  const cacheKey = 'pubs:all'
  
  // Check cache first
  const cached = cachingService.get<Pub[]>(cacheKey)
  if (cached !== null) {
    console.log('Returning cached pub data')
    return cached
  }
  
  // Cache miss - fetch from Firestore
  try {
    const pubs = await fetchPubsFromFirestore() // existing logic
    cachingService.set(cacheKey, pubs, CACHE_CONFIG.PUBS_TTL)
    return pubs
  } catch (error) {
    // On error, don't cache - throw as before
    throw error
  }
}
```

**Changes to `getUserVisits()`:**
```typescript
export async function getUserVisits(userId: string): Promise<Visit[]> {
  const cacheKey = `visits:${userId}`
  
  // Check cache first
  const cached = cachingService.get<Visit[]>(cacheKey)
  if (cached !== null) {
    console.log(`Returning cached visit data for user ${userId}`)
    return cached
  }
  
  // Cache miss - fetch from Firestore
  try {
    const visits = await fetchVisitsFromFirestore(userId) // existing logic
    cachingService.set(cacheKey, visits, CACHE_CONFIG.VISITS_TTL)
    return visits
  } catch (error) {
    // On error, don't cache - return empty array as before
    return []
  }
}
```

**Changes to Visit Mutations:**
```typescript
export async function createVisit(visit: Omit<Visit, 'id'>): Promise<Visit> {
  const result = await createVisitInFirestore(visit) // existing logic
  
  // Invalidate cache after successful mutation
  const cacheKey = `visits:${visit.userId}`
  cachingService.invalidate(cacheKey)
  
  return result
}

export async function updateVisit(visitId: string, updates: Partial<Visit>): Promise<void> {
  // Must fetch visit to get userId for cache invalidation
  const visit = await getVisitById(visitId)
  await updateVisitInFirestore(visitId, updates) // existing logic
  
  if (visit) {
    cachingService.invalidate(`visits:${visit.userId}`)
  }
}

export async function deleteVisit(visitId: string): Promise<void> {
  const visit = await getVisitById(visitId)
  await deleteVisitFromFirestore(visitId) // existing logic
  
  if (visit) {
    cachingService.invalidate(`visits:${visit.userId}`)
  }
}
```

### 3. Manual Cache Refresh (Future Enhancement)

Add refresh function for future UI integration:

```typescript
export async function refreshPubData(): Promise<Pub[]> {
  cachingService.invalidate('pubs:all')
  return await getAllPubs()
}
```

## Data Flow Diagrams

### Pub Data Flow (Cache Hit)
```
User loads map → getAllPubs() → Check cache → Return cached data (20ms)
```

### Pub Data Flow (Cache Miss)
```
User loads map → getAllPubs() → Check cache → Cache miss → 
Fetch Firestore (300ms) → Store in cache → Return fresh data
```

### Visit Data Flow (After Mutation)
```
User adds visit → createVisit() → Write to Firestore → 
Invalidate cache → Next getUserVisits() → Fetch fresh data
```

## Error Handling

1. **Firestore read failure:** Cache not populated; error thrown/logged as before
2. **Cache corruption:** Invalid data treated as cache miss; re-fetch
3. **TTL calculation errors:** Fail-safe to cache miss (fresh fetch)
4. **Memory exhaustion:** Unlikely (<1MB); if needed, implement LRU eviction

## Performance Targets

| Metric | Current | Target | Measurement |
|--------|---------|--------|-------------|
| Pub data read latency (cache hit) | 300ms | <50ms | Console timing |
| Firestore reads per user session | ~10-15 | 1-2 | Firebase console |
| Memory usage | 0 | <1MB | Chrome DevTools |
| Cache hit rate | 0% | >80% | Telemetry logs |

## Testing Strategy

1. **Unit tests for cachingService:**
   - TTL expiry behavior
   - Manual invalidation
   - Type safety

2. **Integration tests for firebaseDataService:**
   - Cache hit/miss paths
   - Invalidation on mutations
   - Firestore error handling with cache

3. **E2E scenarios:**
   - Full user session with cached data
   - Manual refresh flows
   - Multi-user isolation

## Migration Plan

1. **Phase 1:** Implement cachingService (no behavior change)
2. **Phase 2:** Integrate caching into getAllPubs() (pub caching enabled)
3. **Phase 3:** Integrate caching into getUserVisits() (visit caching enabled)
4. **Phase 4:** Add manual refresh UI (optional future work)

Each phase is independently testable and deployable.

## Future Enhancements

1. **Cloud Function Integration:** Replace Firestore direct reads with HTTPS callable function
   ```typescript
   const fetchPubsFromFirestore = async () => {
     // Currently: getDocs(collection(db, 'pubs'))
     // Future: httpsCallable(functions, 'getPubs')()
   }
   ```

2. **Cache warming:** Preload cache on app initialization
3. **Telemetry:** Log cache hit/miss rates to analytics
4. **Advanced invalidation:** Support tag-based invalidation for related data
5. **Offline support:** Persist cache to IndexedDB for offline access

## Security Considerations

- Cache is client-side; no security boundary changes
- User-specific data isolated by `visits:${userId}` keys
- No sensitive data in cache beyond what's already in Firestore
- Cache invalidation on logout handled by `clearVisits()`

## Rollback Plan

If caching causes issues:
1. Remove caching calls from firebaseDataService
2. Restore direct Firestore reads
3. No data migration needed (cache is ephemeral)
4. Feature flag to toggle caching in production
