# Implementation Tasks

This checklist breaks down the implementation into small, verifiable work items that deliver incremental progress.

## Phase 1: Backend - Firestore Service Layer

### Task 1.1: Add Visit ID Generation
- [x] Implement `generateNextVisitId()` helper function in `firebaseDataService.ts`
  - Query visits collection for maximum id
  - Return maxId + 1, or 1 if collection is empty
  - Handle timeout (10 seconds)
- [x] Add retry logic for ID collisions (max 3 attempts)
- [x] Test with empty collection
- [x] Test with existing visits

### Task 1.2: Add Visit Validation
- [x] Implement `validateVisitData()` helper function in `firebaseDataService.ts`
  - Validate required fields: userId (non-empty string), pubId (positive number)
  - Validate optional rating (1-5 if present)
  - Validate optional visitedAt (valid ISO string if present, can be undefined)
  - Throw descriptive errors for invalid data
- [x] Test validation with valid data
- [x] Test validation with invalid data

### Task 1.3: Implement createVisit Method
- [x] Add `createVisit(visit: Omit<Visit, 'id'>): Promise<Visit>` to `firebaseDataService.ts`
  - Generate unique ID using `generateNextVisitId()`
  - Validate input data
  - Create document in `visits` collection with ID as document ID (string)
  - Return complete Visit object including generated ID
  - Handle timeout (10 seconds)
  - Log errors and throw on failure
- [x] Test successful creation
- [x] Test with network error
- [x] Test with validation error

### Task 1.4: Implement updateVisit Method
- [x] Add `updateVisit(visitId: number, updates: Partial<Visit>): Promise<void>` to `firebaseDataService.ts`
  - Validate update data (skip id and userId updates)
  - Use Firestore `updateDoc()` to merge changes
  - Handle field deletion for undefined values
  - Handle timeout (10 seconds)
  - Log errors and throw on failure
- [x] Test successful update
- [x] Test updating visitedAt
- [x] Test clearing visitedAt (undefined)
- [x] Test updating notes

### Task 1.5: Implement deleteVisit Method
- [x] Add `deleteVisit(visitId: number): Promise<void>` to `firebaseDataService.ts`
  - Use Firestore `deleteDoc()` with document reference
  - Handle timeout (10 seconds)
  - Log errors (ignore "not found" errors)
  - Throw on network errors
- [x] Test successful deletion
- [x] Test deleting nonexistent visit (should not error)
- [x] Test with network error

## Phase 2: Frontend - Composable Layer

### Task 2.1: Extend useVisits with addVisit Method
- [x] Add `addVisit(pubId: number, options?: { visitedAt?: string, notes?: string }): Promise<void>` to `useVisits.ts`
  - Check if user is authenticated (throw error if not)
  - Check if visit already exists for pubId
    - If exists: call updateVisit instead
    - If not: create new visit
  - Default visitedAt to current ISO timestamp if not provided
  - Call `firebaseDataService.createVisit()` with userId from auth
  - On success, update local state:
    - Add to `visitState.visits` array
    - Add pubId to `visitState.visitedPubIds` Set
  - On error, catch and re-throw with user-friendly message
- [x] Test adding visit with default date
- [x] Test adding visit with specific date
- [x] Test adding visit with undefined date
- [x] Test updating existing visit when re-adding
- [x] Test error when unauthenticated

### Task 2.2: Add updateVisit Method to useVisits
- [x] Add `updateVisit(pubId: number, updates: { visitedAt?: string | null, notes?: string }): Promise<void>` to `useVisits.ts`
  - Check if user is authenticated
  - Find visit by pubId in `visitState.visits`
  - Throw error if visit not found
  - Call `firebaseDataService.updateVisit(visit.id, updates)`
  - On success, update local state:
    - Update visit in `visitState.visits` array
  - On error, catch and re-throw with user-friendly message
- [x] Test updating visit date
- [x] Test clearing visit date
- [x] Test updating notes
- [x] Test error when visit not found

### Task 2.3: Add removeVisit Method to useVisits
- [x] Add `removeVisit(pubId: number): Promise<void>` to `useVisits.ts`
  - Check if user is authenticated
  - Find visit by pubId (if not found, return early - idempotent)
  - Call `firebaseDataService.deleteVisit(visit.id)`
  - On success, update local state:
    - Remove from `visitState.visits` array
    - Remove pubId from `visitState.visitedPubIds` Set
  - On error, catch and re-throw with user-friendly message
- [x] Test removing existing visit
- [x] Test removing nonexistent visit (should succeed silently)
- [x] Test error when unauthenticated

### Task 2.4: Export New Methods
- [x] Export `addVisit`, `updateVisit`, `removeVisit` from `useVisits()` return object
- [x] Verify TypeScript types are correct
- [x] Update JSDoc comments if needed

## Phase 3: UI - Pub Detail View

### Task 3.1: Create PubDetailSheet Component
- [x] Create new component `PubDetailSheet.vue` using shadcn Sheet component
- [x] Add props for pub and isOpen state
- [x] Display pub details (name, address, status badge)
- [x] Conditionally show visit tracking UI based on authentication
- [x] Test component renders correctly

### Task 3.2: Implement Mark as Visited Button
- [x] Add "Mark as Visited" button component
  - Use shadcn Button component
  - Add loading state while mutation in progress
  - On click: call `addVisit(selectedPub.id)`
  - Handle errors with error message display
  - Disable button while loading
- [x] Style button appropriately (primary action)
- [x] Test button functionality
- [x] Test loading state
- [x] Test error display

### Task 3.3: Implement Visit Details Section
- [x] Create visit details section showing:
  - Visit date display (formatted or "Date unknown")
  - Edit date input (date picker)
  - Notes field (textarea)
  - "Remove Visit" button
- [x] Get visit data using `getVisit(pubId)`
- [x] Format date for display
- [x] Test section appears when pub is visited

### Task 3.4: Implement Date Input
- [x] Add date input using HTML5 date picker
  - Show current visit date selected
  - Allow selecting new date
  - Allow clearing date (set to undefined)
  - On change: call `updateVisit(pubId, { visitedAt: newDate })`
  - Show loading state during update
  - Handle errors with error message
- [x] Test selecting new date
- [x] Test clearing date
- [x] Test error handling

### Task 3.5: Implement Notes Field
- [x] Add notes textarea to visit details section
  - Show existing notes or placeholder
  - On blur: call `updateVisit(pubId, { notes: newNotes })`
  - Show error on failure
- [x] Test adding notes
- [x] Test updating notes
- [x] Test error handling

### Task 3.6: Implement Remove Visit Confirmation Dialog
- [x] Add "Remove Visit" button with destructive styling
  - On click: show confirmation dialog
- [x] Create confirmation dialog using shadcn Dialog
  - Title: "Remove Visit?"
  - Message: "This action cannot be undone..."
  - Cancel button
  - Remove button (destructive)
- [x] On confirmation: call `removeVisit(pubId)`
  - Show loading state in dialog
  - Close dialog on success
  - Show error on failure
- [x] Test confirmation flow
- [x] Test cancellation
- [x] Test successful removal
- [x] Test error handling

### Task 3.7: Integrate PubDetailSheet into Map View
- [x] Import PubDetailSheet in PubLocationsMap.vue
- [x] Add selectedPub and showPubDetail state
- [x] Update handlePubSelect to show detail sheet
- [x] Update marker click handler to show detail sheet
- [x] Test opening detail sheet from sidebar
- [x] Test opening detail sheet from map marker

## Phase 4: Testing & Validation

### Task 4.1: Manual Testing
- [ ] Test complete flow: mark visited → edit date → add notes → remove visit
- [ ] Test with Firebase emulator running
- [ ] Test network error handling (disconnect network)
- [ ] Test concurrent updates (two browser tabs)
- [ ] Test unauthenticated state (should hide controls)
- [ ] Verify map markers update after visit mutations

### Task 4.2: Verify Firestore Data
- [ ] Check Firestore emulator UI to verify documents created correctly
- [ ] Verify visit IDs are unique and sequential
- [ ] Verify userId matches authenticated user UID
- [ ] Verify optional fields are handled correctly (undefined vs present)

### Task 4.3: Edge Cases
- [ ] Test creating visit when already visited (should update, not duplicate)
- [ ] Test removing visit that doesn't exist (should succeed silently)
- [ ] Test updating nonexistent visit (should error)
- [ ] Test with pubs that have no id (should handle gracefully)

## Implementation Summary

### Completed
- ✅ All backend Firestore service methods (createVisit, updateVisit, deleteVisit)
- ✅ All frontend composable methods (addVisit, updateVisit, removeVisit)
- ✅ Complete UI implementation with PubDetailSheet component
- ✅ Integration with map view and sidebar
- ✅ Error handling and validation
- ✅ TypeScript type safety

### Remaining
- Manual testing with Firebase emulator
- Edge case testing

## Dependencies & Parallelization

**Sequential Dependencies:**
- Phase 1 must complete before Phase 2
- Phase 2 must complete before Phase 3
- Phase 4 can only start after Phase 3

**Completed in parallel:**
- Phase 1 tasks 1.3, 1.4, 1.5 (all mutation methods)
- Phase 2 tasks 2.1, 2.2, 2.3 (all composable methods)
