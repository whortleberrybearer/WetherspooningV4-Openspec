# Design: Migrate Visits to Firebase

## Architectural Overview

This change transitions visit data from a static JSON file to a Firestore-backed solution, establishing the foundation for persistent, user-specific visit tracking.

## Key Decisions

### 1. Firestore Collection Structure

**Decision:** Use a flat `visits` collection with `userId` field rather than nested subcollections.

**Structure:**
```
visits/{visitId}
  - id: number (legacy compatibility)
  - userId: string (Firebase UID)
  - pubId: number
  - visitedAt: string (ISO 8601 timestamp, optional)
  - rating: number (1-5, optional)
  - notes: string (optional)
  - createdAt: timestamp (Firestore server timestamp)
```

**Rationale:**
- **Querying flexibility:** Can query across all users for future analytics features
- **Simpler indexing:** Single composite index `(userId, pubId)` supports all current queries
- **Migration friendly:** Easier to migrate data from other sources
- **Security rules:** Simple to write and maintain (filter by `userId`)

**Trade-offs:**
- ✅ Easier cross-user queries (future analytics, leaderboards)
- ✅ Simpler backup/restore operations
- ❌ Slightly more complex security rules than subcollections
- ❌ No automatic cleanup when user deleted (requires Cloud Function)

### 2. User ID Migration Strategy

**Decision:** Transition from numeric user IDs (1, 2, 3) to Firebase UID strings immediately.

**Mapping:**
```
OLD: userId: 1 (hardcoded in static JSON)
NEW: userId: auth.currentUser.uid (Firebase Authentication UID)
```

**Rationale:**
- **Immediate alignment:** No temporary dual-ID system needed
- **Auth integration:** UIDs are the natural identifier from Firebase Auth
- **Security:** UIDs are unique, non-guessable, and managed by Firebase
- **Simplicity:** One user identification system across all Firebase services

**Trade-offs:**
- ✅ Single source of truth for user identity
- ✅ Natural integration with Firebase Auth
- ✅ No migration needed later
- ❌ Requires updating seed data to use Firebase UIDs (acceptable - emulator only)

### 3. Backward Compatibility Strategy

**Decision:** Maintain the same `useVisits` composable API, changing only the internal implementation.

**Unchanged API:**
```typescript
interface VisitComposable {
  isVisited(pubId: number): boolean
  getGroupCounts(pubs: Pub[]): { visited: number; total: number; totalClosed: number; visitedClosed: number }
  loadVisits(userId: string): Promise<void>  // userId type changed from number to string
  // ... other methods
}
```

**Rationale:**
- **Zero breaking changes:** Map, sidebar, and all UI components continue working
- **Encapsulation:** Firestore details hidden behind composable
- **Testability:** Can mock the composable for UI tests
- **Gradual enhancement:** Can add new methods (markAsVisited) without disrupting existing code

**Trade-offs:**
- ✅ No changes needed to UI components
- ✅ Easy to test in isolation
- ✅ Clear separation of concerns
- ❌ Slightly less flexibility if we need reactive Firestore queries (acceptable for now)

### 4. Data Seeding Approach

**Decision:** Create comprehensive seed script that generates 100 pubs and realistic visit patterns programmatically.

**Seed Data Composition:**
- **Pubs (100 total):**
  - England: 70 pubs (diverse regions: London, Manchester, Birmingham, Liverpool, etc.)
  - Scotland: 15 pubs (Edinburgh, Glasgow, Aberdeen, etc.)
  - Wales: 10 pubs (Cardiff, Swansea, Newport, etc.)
  - Northern Ireland: 5 pubs (Belfast, Derry, etc.)
  - Mix of open (85%) and closed (15%) states
  
- **Users (3 total):**
  - test@example.com: Frequent visitor, 45 visits, covers many regions
  - alice@example.com: Moderate visitor, 20 visits, focused on England
  - bob@example.com: Light visitor, 8 visits, Scotland focus

- **Visits (70+ total):**
  - Distributed across last 18 months
  - More recent activity weighted higher
  - Some pubs visited by multiple users (overlap)
  - Realistic rating distribution (mostly 4-5 stars)
  - ~30% have notes, ~90% have ratings

**Rationale:**
- **Realistic testing:** 100 pubs allows testing performance, pagination, filtering at scale
- **Pattern variety:** Different user behaviors enable testing edge cases
- **Regional diversity:** UK-wide coverage tests map bounds, clustering, regional filters
- **Reproducible:** Seed script generates same data every time (deterministic)
- **Self-contained:** No external data dependencies

**Trade-offs:**
- ✅ Comprehensive test coverage
- ✅ No external data dependencies
- ✅ Fast to generate and seed
- ❌ Not real Wetherspoon data (acceptable - this is a demo/learning project)

### 5. Error Handling Strategy

**Decision:** Degrade gracefully when Firebase is unavailable, showing empty state rather than error.

**Behavior:**
- **Emulator not running:** Log warning, show zero visits (all pubs unvisited)
- **Network timeout:** Log error, return empty visit set after timeout
- **Invalid data:** Skip invalid documents, log warnings, continue with valid data
- **Auth not ready:** Wait for auth state, then load visits

**Rationale:**
- **Development friendly:** App still loads even if emulator isn't running
- **User experience:** Better to show incomplete data than crash
- **Debugging:** Clear console messages help developers identify issues
- **Progressive enhancement:** Core features (viewing pubs on map) work without visits

**Trade-offs:**
- ✅ Robust development experience
- ✅ Fails gracefully in production
- ❌ Silent failures might hide issues (mitigated by console logging)

## Data Flow

### Visit Loading Flow
```
1. User authenticates → auth.currentUser.uid available
2. Component calls loadVisits(uid) from useVisits composable
3. Composable calls firebaseDataService.getUserVisits(uid)
4. Service queries Firestore: visits.where('userId', '==', uid).get()
5. Service validates and transforms documents to Visit objects
6. Composable updates reactive state (visitedPubIds Set, visits array)
7. UI components reactively update (markers change color, progress updates)
```

### Future: Marking Pub as Visited
```
1. User clicks "Mark as Visited" button → markAsVisited(pubId) called
2. Composable calls firebaseDataService.createVisit(userId, pubId, visitData)
3. Service creates new document in visits collection
4. Service returns the new visit object
5. Composable adds to local state (optimistic update)
6. UI immediately reflects change (marker color, progress count)
```

## Security Considerations

### Firestore Security Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Pubs are readable by anyone (public data)
    match /pubs/{pubId} {
      allow read: if true;
      allow write: if false; // No client writes (admin only)
    }
    
    // Visits are readable/writable only by the owning user
    match /visits/{visitId} {
      allow read: if request.auth != null 
                  && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null 
                    && request.resource.data.userId == request.auth.uid;
      allow update, delete: if request.auth != null 
                            && resource.data.userId == request.auth.uid;
    }
  }
}
```

**Rationale:**
- **Least privilege:** Users can only access their own visit data
- **Authentication required:** All visit operations require logged-in user
- **Pub data protection:** Prevent client-side tampering with pub data
- **Simple to understand:** Clear mapping of ownership to Firebase UID

## Performance Considerations

### Query Optimization
- **Composite index:** `(userId, pubId)` for efficient user visit lookups
- **Document size:** Keep visit documents small (<1KB each)
- **Batch reads:** Fetch all user visits in single query (not per-pub lookups)
- **Local caching:** Leverage Firebase SDK automatic caching

### Scaling Strategy (Future)
- **Pagination:** If users have >1000 visits, implement cursor-based pagination
- **Aggregations:** If needed, maintain visit counts in user profile document
- **Offline support:** Firebase SDK handles offline caching automatically

## Testing Strategy

### Unit Tests
- `firebaseDataService.getUserVisits()` with mocked Firestore
- `useVisits` composable with mocked service
- Visit validation logic with various invalid inputs

### Integration Tests
- Load visits from emulator with seeded data
- Verify correct filtering by userId
- Test error handling (timeout, invalid data)

### E2E Tests
- Login → load visits → verify map markers show correct states
- Login as different users → verify each sees only their visits
- Test with user having zero visits

## Open Implementation Details

### Firestore Document IDs
**Option A:** Auto-generate document IDs (recommended)
```typescript
const docRef = collection(db, 'visits').doc() // Auto-ID
await setDoc(docRef, visitData)
```

**Option B:** Use composite key `{userId}_{pubId}`
```typescript
const docId = `${userId}_${pubId}`
const docRef = doc(db, 'visits', docId)
await setDoc(docRef, visitData)
```

**Recommendation:** Option A (auto-generate) for simplicity and future multi-visit support.

### Visit Timestamps
- **createdAt:** Firestore server timestamp (when visit record created)
- **visitedAt:** User-provided ISO string (when they actually visited the pub, optional)
- Both fields serve different purposes and should coexist
