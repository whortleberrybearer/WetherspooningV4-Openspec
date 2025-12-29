# Proposal: Migrate Visits to Firebase

## Summary
Migrate user visit data from static JSON files to Firebase Firestore, enabling real-time synchronization, persistent storage, and scalability for the pub visit tracking feature. Include comprehensive seed data with an expanded pub dataset (100 pubs) and realistic visit distributions across multiple users.

## Why
Users cannot save or modify their pub visits with the current static JSON approach. Every user sees the same hardcoded visit data, making the feature non-functional for real usage. Firebase Firestore provides cloud-based storage where each authenticated user can have their own persistent visit records. Additionally, expanding from 15 to 100 pubs enables realistic testing of map clustering, regional filtering, and progress tracking at scale.

## Motivation
The current implementation uses a static JSON file (`/data/visits-sample.json`) to store visit data, which has several limitations:
- **No persistence:** User visits cannot be saved or modified
- **No scalability:** All users share the same static visit data
- **No real-time sync:** Changes don't propagate across devices or sessions
- **Limited testing:** Only 15 pubs makes it difficult to test progress tracking and filtering
- **Unrealistic data:** Current sample doesn't represent actual usage patterns

Moving to Firebase Firestore provides:
- **Cloud storage:** User visits persisted across sessions and devices
- **Per-user data:** Each authenticated user has their own visit records
- **Real-time updates:** Future features like social sharing or group challenges
- **Scalability:** Can handle thousands of pubs and millions of visits
- **Better testing:** 100 pubs with diverse visit patterns enables thorough testing

## Scope

### In Scope
- Create `visits` Firestore collection with user-specific documents
- Implement Firebase service methods for visit CRUD operations:
  - `getUserVisits(userId: string)` - Retrieve all visits for a user
  - Future extensibility for create/update/delete operations
- Update `useVisits` composable to load from Firestore instead of static JSON
- Expand pub dataset from 15 to 100 pubs with realistic UK distribution
- Create seed script to populate emulator with:
  - 100 pubs across diverse UK locations (cities, towns, regions)
  - 3 sample users (matching existing auth seed data)
  - Realistic visit data: 30-50 visits per user with varied patterns
- Update existing `seedEmulator.js` to seed pubs, users, and visits together
- Update documentation and environment setup instructions

### Out of Scope
- Writing visits to Firestore (marking pubs as visited) - future enhancement
- Visit editing or deletion UI - future enhancement
- Real-time visit synchronization listeners - future enhancement
- Visit analytics or statistics backend - future enhancement
- Visit data migration from any production system (none exists)
- Social features or visit sharing

## Proposed Changes

### Modified Capability: firebase-data-integration
**Type:** modify  
**Spec:** `openspec/specs/firebase-data-integration/spec.md`

Extend Firebase data service to support visit operations.

**Added Requirements:**
- REQ-FDI-004: Firestore Visit Data Operations - Methods to retrieve user visits from Firestore
- REQ-FDI-005: Visit Data Validation - Validate visit document structure and required fields
- REQ-FDI-006: Visit Collection Structure - Define Firestore schema for visits collection

### Modified Capability: pub-visit-data
**Type:** modify  
**Spec:** `openspec/specs/pub-visit-data/spec.md`

Update visit data loading to use Firebase instead of static JSON.

**Modified Requirements:**
- REQ-PVD-001: Visit Data Source - Load from Firestore instead of static JSON
- REQ-PVD-005: Authentication Integration - Use Firebase user UID instead of numeric userId

**Removed Requirements:**
- (none - all requirements still apply, just with different implementation)

## Dependencies
- Requires existing firebase-data-integration capability
- Requires existing user-authentication capability
- No breaking changes to pub-locations-map or pub-navigation-sidebar (they consume the same visit composable API)

## Testing Strategy
- **Unit tests:** Visit service methods with mocked Firestore
- **Integration tests:** `useVisits` composable with emulator
- **E2E tests:** Complete visit loading flow with authenticated user
- **Data validation tests:** Invalid visit documents are rejected gracefully
- **Performance tests:** Loading 100+ visits completes within acceptable time
- **Emulator seed verification:** Seed script creates expected data structure

## Migration Notes
### Breaking Changes
- **Environment:** Developers must run Firebase emulator with seeded data (no static JSON fallback)
- **User IDs:** Transition from numeric IDs (1, 2, 3) to Firebase UIDs (strings)

### Migration Steps for Development
1. Ensure Firebase emulators are installed and configured
2. Run `npm run emulator` to start Firestore and Auth emulators
3. Run seed script to populate emulator with pubs, users, and visits
4. Existing code continues to work through `useVisits` composable (same API)

### Data Mapping
```
OLD: userId: 1 (number)
NEW: userId: "firebase-uid-string" (string from auth.currentUser.uid)

OLD: /data/visits-sample.json (static file)
NEW: Firestore collection "visits" with documents per visit
```

## Alternatives Considered

### Alternative 1: Keep Static JSON + Add Firebase Write
Maintain static JSON for reads, only use Firebase for writes.
**Rejected:** Creates dual data sources, confusing ownership, and doesn't solve scalability. Adds complexity without long-term benefit.

### Alternative 2: LocalStorage + Firebase Sync
Store visits in localStorage and sync to Firebase in background.
**Rejected:** Adds offline complexity that's not currently needed. Firebase SDK handles caching. Over-engineered for current requirements.

### Alternative 3: Expand to 50 Pubs Instead of 100
More modest increase in pub count.
**Rejected:** 100 pubs provides better testing coverage for:
- Pagination and performance
- Regional diversity (Scotland, Wales, Northern Ireland, England regions)
- Visit distribution patterns (heavy users, light users, regional focuses)
- Filtering and search at scale

### Alternative 4: Nested Visit Subcollection Under Users
Structure as `users/{uid}/visits/{visitId}` instead of flat collection.
**Rejected:** 
- Harder to query across users (future analytics)
- More complex security rules
- Flat collection with `userId` field is simpler and more flexible
- Firestore composite indexes support efficient per-user queries

## Open Questions
1. **Pub data source:** Should we find/generate real Wetherspoon pub data for 100 pubs, or create realistic synthetic data?
   - **Recommendation:** Create realistic synthetic data with authentic UK geography (easier, no copyright concerns, controllable distribution)

2. **Visit date distribution:** Should visits span a specific time range (e.g., last 2 years)?
   - **Recommendation:** Yes, distribute visits across last 18 months with more recent activity weighted higher (mimics real usage)

3. **Firestore security rules:** Should we add basic security rules now or defer?
   - **Recommendation:** Add basic rules now (users can only read/write their own visits) to establish good patterns early

## Implementation Notes
- Maintain backward compatibility with `useVisits` composable interface
- Keep existing visual states and progress tracking working without changes
- Ensure error handling degrades gracefully (empty state if Firebase unavailable)
- Log clear messages for debugging during development
