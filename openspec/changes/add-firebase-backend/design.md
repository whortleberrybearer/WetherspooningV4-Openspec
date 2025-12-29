# Design: Add Firebase Backend

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (Vue 3)                      │
│                                                               │
│  ┌─────────────────┐         ┌─────────────────┐            │
│  │ PubLocationsMap │         │   useVisits()   │            │
│  │     Component   │         │   Composable    │            │
│  └────────┬────────┘         └────────┬────────┘            │
│           │                           │                      │
│           │  loadPubs()              │  (unchanged)          │
│           │                           │  fetch JSON file     │
│           v                           v                      │
│  ┌────────────────────────┐  ┌──────────────────┐          │
│  │ Firebase Data Service  │  │ visits-sample    │          │
│  │  ┌────────────────┐    │  │     .json        │          │
│  │  │  getAllPubs()  │    │  └──────────────────┘          │
│  │  │  getPubById()  │    │                                 │
│  │  └────────────────┘    │                                 │
│  └─────────────┬──────────┘                                 │
│                │                                              │
│                │ Firebase SDK                                 │
└────────────────┼──────────────────────────────────────────────┘
                 │
                 v
┌─────────────────────────────────────────────────────────────┐
│                    Firebase Backend                          │
│                                                               │
│  ┌──────────────┐                                            │
│  │  Firestore   │                                            │
│  │              │                                            │
│  │ - pubs       │                                            │
│  └──────────────┘                                            │
└─────────────────────────────────────────────────────────────┘
```

## Firebase Configuration

### Project Setup
1. Create Firebase project in Firebase Console
2. Enable Firestore Database in production mode
3. Generate web app credentials
4. Configure environment variables in Vite app

### Environment Variables
```typescript
// .env.local
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

### Firebase Initialization
```typescript
// src/lib/firebase.ts
import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
}

export const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
```

## Firestore Data Model

### Collections Structure
```
firestore
└── pubs (collection)
    └── {pubId} (document)
        ├── id: number
        ├── name: string
        ├── townCity: string
        ├── address: string
        ├── county: string
        ├── region: string
        ├── country: string
        ├── lat: number
        ├── lng: number
        ├── url?: string
        ├── imageUrl?: string
        └── openState?: string
```

### Document ID Strategy
- **Pubs:** Use pub `id` field as document ID for easy lookups (string conversion of numeric ID)

### Indexes
- **Pubs:** No additional indexes needed (simple queries by document ID or full collection scan)

## Data Service Layer

### Interface Design
```typescript
// src/services/firebaseDataService.ts

export interface FirebaseDataService {
  // Pub operations
  getAllPubs(): Promise<Pub[]>
  getPubById(pubId: number): Promise<Pub | null>
}
```

### Error Handling
- Network errors: Retry with exponential backoff (max 3 attempts)
- Permission errors: Log and return empty results
- Invalid data: Log warning, skip invalid entries
- Timeout: 10 second timeout for all Firestore operations

### Caching Strategy (Phase 1)
- No client-side caching in initial implementation
- Rely on Firestore's built-in caching
- Future: Implement IndexedDB cache for offline support

## Migration Path

### Data Migration Steps
1. Export existing JSON data to Firestore-compatible format
2. Create Node.js migration script using Firebase Admin SDK
3. Batch upload pubs to `pubs` collection
4. Batch upload visits to `visits` collection
5. Verify data integrity with sample queries

### Migration Script Outline
```typescript
// scripts/migrateToFirestore.ts
import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import pubsData from '../Wetherspooning/public/data/pubs-sample.json'

// Initialize Admin SDK
// Batch write pubs
// Log results
```

## Security Rules

### Firestore Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Pubs: Read-only for all users (no auth required for MVP)
    match /pubs/{pubId} {
      allow read: if true;
      allow write: if false; // Admin-only via Admin SDK
    }
  }
}
```

**Note:** Authentication is not required for reading pub data in this simplified version. Future iterations can add auth requirements.

## Component Integration

### PubLocationsMap.vue Changes
```typescript
// Before
const response = await fetch('/data/pubs-sample.json')
const data = await response.json()
pubs.value = data

// After
import { getAllPubs } from '@/services/firebaseDataService'

const data = await getAllPubs()
pubs.value = data
```

### useVisits.ts - No Changes
Visit data loading remains unchanged, continuing to use `/data/visits-sample.json`.

## Testing Strategy

### Unit Tests
- Firebase service methods with mocked Firestore
- Data transformation and validation
- Error handling scenarios

### Integration Tests
- End-to-end data flow from Firestore to UI
- Authentication flow with visit data loading
- Error states and loading states

### Manual Testing Checklist
- [ ] Map loads with pubs from Firestore
- [ ] Markers display correctly for all pubs
- [ ] Sidebar displays pub list from Firestore
- [ ] Error handling works when Firestore unavailable
- [ ] Performance acceptable (<2s for initial load)
- [ ] Visit data still loads from JSON file correctly
- [ ] Authentication still works with static/file-based approach

## Performance Considerations

### Expected Load Times
- Initial pub data load: ~500ms (assuming 20-50 pubs)
- Visit data load: ~200ms (assuming 10-50 visits per user)
- Total initial load: <1 second

### Optimization Strategies
- Query only required fields (use Firestore field masks if needed)
- Implement pagination for large datasets (future: 50 pubs per page)
- Use Firestore query cursors for infinite scroll (future enhancement)
- Consider Firestore bundle preloading for critical data

## Rollback Plan

### Feature Flag
```typescript
// src/config/featureFlags.ts
export const USE_FIREBASE = import.meta.env.VITE_USE_FIREBASE === 'true'

// In components
if (USE_FIREBASE) {
  data = await getAllPubs()
} else {
  const response = await fetch('/data/pubs-sample.json')
  data = await response.json()
}
```

### Rollback Steps
1. Set `VITE_USE_FIREBASE=false` in environment
2. Verify JSON files still present
3. Rebuild and deploy
4. Monitor for errors

## Future Enhancements
- Visit data migration to Firestore (separate proposal)
- Firebase Authentication integration (separate proposal)
- Real-time listeners for live pub data updates
- Offline support with IndexedDB cache
- Cloud Functions for data validation
- Analytics and monitoring
- Admin interface for pub data management
