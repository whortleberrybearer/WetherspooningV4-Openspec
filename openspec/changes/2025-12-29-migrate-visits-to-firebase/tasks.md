# Tasks: Migrate Visits to Firebase

## Phase 1: Data Preparation
### Task 1.1: Expand pub dataset to 100 pubs
- Generate or create 100 realistic Wetherspoon pub entries
- Include diverse UK locations (England, Scotland, Wales, Northern Ireland)
- Add regional variety (cities: London, Manchester, Edinburgh, Cardiff, Belfast; towns)
- Set realistic open/closed states (85% open, 15% closed)
- Update `pubs-sample.json` with expanded dataset
- **Validation:** `pubs-sample.json` contains exactly 100 pub objects with required fields

### Task 1.2: Create visit seed data generator function
- Create helper function to generate realistic visit patterns
- Distribute visits across last 18 months with recent bias
- Vary visit counts per user (light: 5-15, moderate: 15-35, heavy: 35-55)
- Add realistic ratings (weighted toward 4-5 stars)
- Include notes for ~30% of visits
- Ensure some pub overlap between users
- **Validation:** Function generates deterministic, valid visit data matching Visit interface

## Phase 2: Firebase Service Layer
### Task 2.1: Add Visit interface to firebaseDataService
- Import Visit interface from useVisits or create shared type
- Add TypeScript interface definition at top of file
- Document all Visit fields with comments
- **Validation:** TypeScript compiles without errors

### Task 2.2: Implement visit validation function
- Create `validateVisit(docId: string, data: any): boolean` function
- Check required fields: id, userId, pubId
- Validate userId is non-empty string
- Validate pubId and id are positive numbers
- Validate rating is 1-5 if present
- Log warnings for invalid documents with specific field errors
- **Validation:** Unit tests pass for valid and invalid visit documents

### Task 2.3: Implement getUserVisits method
- Create `getUserVisits(userId: string): Promise<Visit[]>` method
- Query Firestore: `collection(db, 'visits').where('userId', '==', userId)`
- Add 10-second timeout wrapper
- Transform Firestore documents to Visit objects
- Filter out invalid documents using validateVisit
- Return empty array for no results (not error)
- Export function from firebaseDataService
- **Validation:** Method retrieves visits from emulator, handles empty results, times out after 10s

### Task 2.4: Add error handling and logging
- Wrap Firestore calls in try/catch
- Log errors with context (userId, operation name)
- Handle network errors gracefully (return empty array)
- Add console warnings for invalid data
- **Validation:** Service handles emulator offline, network errors, invalid data without crashing

## Phase 3: Update Visit Composable
### Task 3.1: Update loadVisits to use Firestore
- Import `getUserVisits` from firebaseDataService
- Change `loadVisits` parameter from `userId: number` to `userId: string`
- Replace `fetch('/data/visits-sample.json')` with `getUserVisits(userId)`
- Remove JSON parsing logic
- Keep existing visit state updates (visitedPubIds Set, visits array)
- **Validation:** Composable loads visits from Firestore, updates reactive state correctly

### Task 3.2: Update error handling in composable
- Handle Firestore errors (network, timeout)
- Set `visitState.error` with user-friendly message
- Ensure `isLoading` is set to false on error
- Log errors to console for debugging
- **Validation:** Error state is set correctly, app doesn't crash on Firestore failure

### Task 3.3: Update TypeScript types for Firebase UIDs
- Change userId references from `number` to `string` in Visit interface (if needed)
- Update function signatures in composable
- Ensure compatibility with auth.currentUser.uid
- **Validation:** TypeScript compiles without type errors

## Phase 4: Authentication Integration
### Task 4.1: Update App.vue to use Firebase UID
- Import `auth` from '@/lib/firebase'
- Change `loadVisits(1)` to `loadVisits(auth.currentUser.uid!)`
- Add null check for currentUser before loading
- **Validation:** Visits load after authentication using Firebase UID

### Task 4.2: Clear visits on logout
- Add logout handler in authentication logic
- Call method to clear visitState on sign out
- Ensure map and sidebar reset to unvisited state
- **Validation:** Visits clear when user logs out, map shows all pubs as unvisited

## Phase 5: Seed Data Implementation
### Task 5.1: Update seedEmulator.js to seed visits
- Import visit data generator function
- Get Firebase Auth UIDs for test users after seeding
- Generate visit data for each user with their Firebase UID
- Batch write visits to Firestore `visits` collection
- Log seed summary (count per user, total visits)
- **Validation:** Script seeds visits successfully, Firestore emulator contains visits collection

### Task 5.2: Add Firestore composite index
- Create or update `firestore.indexes.json`
- Add composite index: `visits` collection, fields `userId` (ASC), `pubId` (ASC)
- Document index purpose in comments
- **Validation:** Firebase emulator uses index, no index warnings in console

### Task 5.3: Verify seed data in emulator
- Run `npm run emulator` and seed script
- Query visits collection in Firestore emulator UI
- Verify each user has expected number of visits
- Check visit documents have required fields
- Confirm UIDs match Firebase Auth users
- **Validation:** Emulator UI shows correct visits data structure

## Phase 6: Testing
### Task 6.1: Manual integration testing
- Start emulator with seeded data
- Login as test@example.com
- Verify visited pubs show correct visual state on map
- Check sidebar shows accurate visit counts
- Switch to alice@example.com, verify different visits
- **Validation:** Each user sees only their own visits, counts are accurate

### Task 6.2: Test error scenarios
- Stop Firestore emulator while app is running
- Verify graceful degradation (empty visits, console warning)
- Restart emulator, verify recovery
- Test with user who has zero visits
- **Validation:** App handles all error cases without crashing

### Task 6.3: Performance verification
- Login with user having 40+ visits
- Measure time from authentication to visits loaded
- Verify load completes within 2 seconds
- Check console for no duplicate queries
- **Validation:** Visit loading is performant, no N+1 query issues

## Phase 7: Documentation and Cleanup
### Task 7.1: Update README with seed instructions
- Add section on running Firebase emulator
- Document seed script usage
- List environment variable requirements
- Add troubleshooting tips for emulator connection
- **Validation:** README has complete setup instructions

### Task 7.2: Remove static visits JSON file
- Delete `Wetherspooning/public/data/visits-sample.json`
- Remove any references to static file in code comments
- Update any documentation mentioning the file
- **Validation:** No references to visits-sample.json remain

### Task 7.3: Add code comments
- Document Visit interface fields in firebaseDataService
- Add JSDoc comments to getUserVisits method
- Comment visit validation logic
- Explain Firestore collection structure
- **Validation:** Code is well-documented, easy to understand

## Phase 8: Verification
### Task 8.1: End-to-end verification
- Fresh clone of repository (or reset emulator)
- Run emulator and seed script
- Start development server
- Test full user flow: signup → login → view visits → logout
- Verify all features work with Firebase data
- **Validation:** Complete user journey works without errors

### Task 8.2: Cross-browser testing
- Test in Chrome, Firefox, Edge
- Verify Firestore connection works in all browsers
- Check console for errors or warnings
- **Validation:** Works consistently across browsers

---

## Task Dependencies
```
1.1 → 1.2
1.2 → 5.1

2.1 → 2.2 → 2.3 → 2.4
2.4 → 3.1

3.1 → 3.2 → 3.3
3.3 → 4.1 → 4.2

5.1 → 5.2 → 5.3

All Phase 1-5 → 6.1 → 6.2 → 6.3
6.3 → 7.1 → 7.2 → 7.3
7.3 → 8.1 → 8.2
```

## Parallelizable Work
- Phase 1 (data prep) can run parallel to Phase 2 (service layer)
- Tasks within Phase 2 are sequential
- Phase 4 can start once Phase 3 is complete
- Phase 5 can be worked on while Phase 3-4 are in progress
- Phase 6 requires all prior phases complete

## Rollback Plan
If issues arise during implementation:
1. Revert composable changes to load from static JSON
2. Keep Firestore service methods (future ready)
3. Restore `visits-sample.json` file
4. Update auth integration to use numeric userId
5. Test with original static data flow
