# Design: Firestore Caching Architecture

## Overview

This document outlines the technical architecture for implementing caching of Firestore data using Firebase's built-in capabilities: Cloud Functions with CDN caching for pub data, and Firestore SDK persistence for visit data. This approach reduces Firestore reads by >90% while maintaining simplicity and leveraging battle-tested Firebase features.

## Architecture Principles

1. **Leverage Built-In Features:** Use Firebase's native caching instead of custom implementations
2. **Global CDN:** Pub data cached on Firebase Hosting CDN edge nodes worldwide
3. **Session-Scoped:** All caches tied to session lifetime (cleared on logout)
4. **Graceful Degradation:** Cache failures fall back to direct Firestore reads
5. **Future-Proof:** Cloud Function provides server-side processing integration point

## System Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                         Vue Components                           │
│   (PubLocationsMap, PubDetailSheet, useVisits composable)       │
└────────────────┬────────────────────────────┬────────────────────┘
                 │                            │
                 │ Pub Data                   │ Visit Data
                 │                            │
┌────────────────▼──────────────┐  ┌──────────▼─────────────────────┐
│     pubDataService.ts         │  │   firebaseDataService.ts       │
│  ┌────────────────────────┐   │  │  (getUserVisits, etc.)         │
│  │ 1. Check sessionStorage│   │  │                                │
│  │ 2. Call Cloud Function │   │  └────────────┬───────────────────┘
│  │ 3. Cache in session    │   │               │
│  └────────────────────────┘   │               │ getDocs()
└────────────────┬───────────────┘               │
                 │                               │
                 │ HTTPS Call                    │
                 │                               │
┌────────────────▼───────────────────────────────▼───────────────────┐
│                    Firebase Hosting CDN                            │
│  ┌──────────────────────────────────────────────────────────┐     │
│  │  Cache-Control: public, max-age=86400                    │     │
│  │  Serves cached response if <24h old                      │     │
│  │  Routes /api/pubs to Cloud Function on cache miss        │     │
│  └──────────────────────────────────────────────────────────┘     │
└────────────────┬───────────────────────────────┬───────────────────┘
                 │                               │
                 │ On CDN miss                   │
                 │                               │
┌────────────────▼───────────────┐  ┌────────────▼───────────────────┐
│  Cloud Function: getPubs       │  │  Firestore SDK Persistence     │
│  ┌──────────────────────────┐  │  │  ┌──────────────────────────┐ │
│  │ 1. Query Firestore pubs  │  │  │  │ enableIndexedDbPersistence│ │
│  │ 2. Return JSON + headers │  │  │  │ - Auto caches all reads  │ │
│  │ 3. CDN caches response   │  │  │  │ - Serves from IndexedDB  │ │
│  └──────────────────────────┘  │  │  │ - Offline support        │ │
└────────────────┬───────────────┘  │  └──────────────────────────┘ │
                 │                  └────────────────┬───────────────┘
                 │                                   │
                 │ getDocs()                         │ getDocs()
                 │                                   │
┌────────────────▼───────────────────────────────────▼───────────────┐
│                         Firestore Database                         │
│                    (pubs collection, visits collection)            │
└────────────────────────────────────────────────────────────────────┘
```

## Component Design

### 1. Cloud Function: getPubs (New)

**Location:** `functions/src/callable/getPubs.ts`

**Purpose:** Serve pub data with HTTP cache headers for CDN caching

**Implementation:**
```typescript
import { onRequest } from 'firebase-functions/v2/https'
import { getDocs, collection } from 'firebase/firestore'
import { db } from '../lib/firebase'

export const getPubs = onRequest(
  { cors: true },
  async (req, res) => {
    try {
      // Check for cache bypass parameter
      const nocache = req.query.nocache === '1'
      
      // Set cache headers (24 hours)
      if (!nocache) {
        res.set('Cache-Control', 'public, max-age=86400')
      } else {
        res.set('Cache-Control', 'no-cache, no-store, must-revalidate')
      }
      
      // Query Firestore
      const snapshot = await getDocs(collection(db, 'pubs'))
      const pubs = snapshot.docs.map(doc => doc.data())
      
      res.status(200).json({ pubs })
    } catch (error) {
      console.error('Error fetching pubs:', error)
      res.status(500).json({ error: 'Failed to fetch pubs' })
    }
  }
)
```

**Cache Behavior:**
- Normal requests: `Cache-Control: public, max-age=86400` (24 hours)
- `?nocache=1`: `Cache-Control: no-cache, no-store, must-revalidate`
- Firebase Hosting CDN respects cache headers automatically

### 2. pubDataService.ts (New)

**Location:** `Wetherspooning/src/services/pubDataService.ts`

**Purpose:** Fetch pub data from Cloud Function with sessionStorage caching

**Implementation:**
```typescript
import type { Pub } from './firebaseDataService'

const SESSION_CACHE_KEY = 'pubs_cache'

interface CachedPubData {
  pubs: Pub[]
  timestamp: number
}

export async function getAllPubs(nocache = false): Promise<Pub[]> {
  // Check sessionStorage first (instant load within session)
  if (!nocache) {
    const cached = sessionStorage.getItem(SESSION_CACHE_KEY)
    if (cached) {
      try {
        const { pubs } = JSON.parse(cached) as CachedPubData
        console.log('Returning sessionStorage cached pub data')
        return pubs
      } catch (error) {
        console.warn('Invalid cached pub data, refetching')
        sessionStorage.removeItem(SESSION_CACHE_KEY)
      }
    }
  }
  
  // Fetch from Cloud Function (will hit CDN cache if available)
  const url = `${import.meta.env.VITE_FIREBASE_FUNCTIONS_URL}/getPubs${nocache ? '?nocache=1' : ''}`
  
  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    const { pubs } = await response.json()
    
    // Cache in sessionStorage for instant loads within this session
    if (!nocache) {
      sessionStorage.setItem(SESSION_CACHE_KEY, JSON.stringify({
        pubs,
        timestamp: Date.now()
      }))
    }
    
    console.log(`Fetched ${pubs.length} pubs from Cloud Function`)
    return pubs
  } catch (error) {
    console.error('Failed to fetch pubs from Cloud Function:', error)
    throw error
  }
}
```

**Cache Layers:**
1. **sessionStorage** (10ms) - Instant loads within same browser session
2. **CDN cache** (50ms) - Global cache shared across all users
3. **Cloud Function** (300-500ms) - On CDN cache miss, queries Firestore

### 3. Firestore SDK Persistence (Modified)

**Location:** `Wetherspooning/src/lib/firebase.ts`

**Changes:**
```typescript
import { getFirestore, connectFirestoreEmulator, enableIndexedDbPersistence } from 'firebase/firestore'

export const db = getFirestore(app)

if (import.meta.env.DEV) {
  connectFirestoreEmulator(db, 'localhost', 8080)
  console.log('🔥 Connected to Firestore Emulator')
}

// Enable Firestore persistence for automatic caching
enableIndexedDbPersistence(db)
  .then(() => {
    console.log('✅ Firestore persistence enabled')
  })
  .catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('⚠️ Firestore persistence failed: Multiple tabs open')
    } else if (err.code === 'unimplemented') {
      console.warn('⚠️ Firestore persistence not supported in this browser')
    } else {
      console.error('❌ Firestore persistence error:', err)
    }
  })
```

**Behavior:**
- All `getDocs()`, `getDoc()` calls automatically check IndexedDB cache first
- Cache persists across page refreshes until explicitly cleared
- Works offline automatically
- Gracefully falls back to network-only if persistence unavailable

### 4. useAuth.ts - Clear Cache on Logout (Modified)

**Location:** `Wetherspooning/src/composables/useAuth.ts`

**Changes:**
```typescript
const logout = async (): Promise<void> => {
  try {
    await signOut(auth)
    clearVisits() // Clear user-specific visit state
    // Note: Pub cache in sessionStorage persists (same for all users)
    // Note: Firestore persistence cache remains intact (allows offline access)
    console.log('User logged out successfully')
  } catch (error) {
    console.error('Logout error:', error)
    throw error
  }
}
```

**Cache Lifecycle:**
- **Pub sessionStorage cache:** Persists across logout (user-agnostic data)
- **Firestore persistence:** Remains intact (allows offline access, naturally refreshes on next session)
- **Visit state:** Cleared on logout via existing `clearVisits()`

## Data Flow Diagrams

### Pub Data Flow (First Global Request)
```
User 1 loads map → sessionStorage miss → Fetch Cloud Function →
CDN miss → Function queries Firestore → Function returns JSON + cache headers →
CDN caches for 24h → sessionStorage caches → User sees map (300-500ms)
```

### Pub Data Flow (Subsequent Users - CDN Hit)
```
User 2 loads map → sessionStorage miss → Fetch Cloud Function →
CDN HIT (serves cached response) → sessionStorage caches → User sees map (50ms)
```

### Pub Data Flow (Same User - sessionStorage Hit)
```
User 1 navigates back → sessionStorage HIT → User sees map (10ms)
```

### Visit Data Flow (Firestore Persistence)
```
User loads visits → getUserVisits() → Firestore SDK checks IndexedDB →
Cache miss → Query Firestore → Cache in IndexedDB → Return data (300ms)

User reloads page → getUserVisits() → Firestore SDK checks IndexedDB →
Cache HIT → Return data (20ms)
```

## Cache Bypass Mechanism

**For Pub Data:**
```typescript
// Normal load (uses all caches)
await getAllPubs()

// Bypass all caches (for admin/testing)
await getAllPubs(true) // Adds ?nocache=1 to URL
```

**For Visit Data:**
- No bypass needed - session-scoped cache refreshes on new session

## Error Handling

1. **Cloud Function failure:** Throw error; UI shows error state (no fallback to Firestore - function is the source)
2. **CDN failure:** Automatically routes to function (Firebase Hosting handles this)
3. **sessionStorage failure:** Skip sessionStorage cache; fetch from function
4. **Firestore persistence failure:** SDK falls back to network-only mode automatically
5. **JSON parse errors:** Clear corrupted cache; refetch

## Performance Targets

| Scenario | Current | Target | Cache Layer |
|----------|---------|--------|-------------|
| First global pub load | 300ms | 300-500ms | None (cold function)|
| Subsequent user pub load (CDN) | 300ms | <50ms | CDN cache |
| Same user pub load (session) | 300ms | <10ms | sessionStorage |
| First visit load (session) | 300ms | 300ms | None |
| Subsequent visit load (session) | 300ms | <20ms | IndexedDB |
| Firestore pub reads per 24h | ~500 | 1 | CDN |
| Firestore visit reads per session | ~10 | 1 | Persistence |

## Testing Strategy

1. **Cloud Function tests:**
   - Returns valid pub data with cache headers
   - Respects `?nocache=1` parameter
   - Handles Firestore errors gracefully

2. **pubDataService tests:**
   - sessionStorage caching behavior
   - Fallback on cache corruption
   - nocache parameter passed correctly

3. **Firestore persistence tests:**
   - Verify `enableIndexedDbPersistence()` called
   - Test graceful degradation on failure
   - Multi-tab warning scenario

4. **Integration tests:**
   - End-to-end pub data flow (sessionStorage → CDN → function)
   - Visit data flow with persistence
   - Cache cleared on logout

5. **E2E tests:**
   - Load map, verify Network tab shows CDN cache hits
   - Logout and verify caches cleared
   - Test `?nocache=1` bypasses CDN

## Migration Plan

1. **Phase 1:** Enable Firestore persistence (visit data caching)
2. **Phase 2:** Create Cloud Function `getPubs` with cache headers
3. **Phase 3:** Create `pubDataService` with sessionStorage wrapper
4. **Phase 4:** Update components to use `pubDataService.getAllPubs()`
5. **Phase 5:** Configure Firebase Hosting rewrites for `/api/pubs`

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

## Security Considerations

- Cloud Function is public (pub data is public anyway)
- Visit data remains protected by Firestore security rules
- sessionStorage is client-side only (no security boundary)
- `?nocache=1` is not a security risk (just bypasses cache)
- Firestore persistence respects existing security rules

## Rollback Plan

If caching causes issues:
1. **Pub data:** Revert to direct Firestore `getAllPubs()` (remove `pubDataService` calls)
2. **Visit data:** Disable persistence by removing `enableIndexedDbPersistence()` call
3. No data migration needed (caches are ephemeral or auto-managed)
4. Cloud Function can remain deployed (used for future features)
