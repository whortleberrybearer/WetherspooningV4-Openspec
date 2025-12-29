# Implementation Tasks

This checklist breaks down the implementation into small, verifiable work items that deliver incremental progress.

## Phase 1: Backend - Firestore Service Layer

### Task 1.1: Add Visit ID Generation
- [ ] Implement `generateNextVisitId()` helper function in `firebaseDataService.ts`
  - Query visits collection for maximum id
  - Return maxId + 1, or 1 if collection is empty
  - Handle timeout (10 seconds)
- [ ] Add retry logic for ID collisions (max 3 attempts)
- [ ] Test with empty collection
- [ ] Test with existing visits

### Task 1.2: Add Visit Validation
- [ ] Implement `validateVisitData()` helper function in `firebaseDataService.ts`
  - Validate required fields: userId (non-empty string), pubId (positive number)
  - Validate optional rating (1-5 if present)
  - Validate optional visitedAt (valid ISO string if present, can be undefined)
  - Throw descriptive errors for invalid data
- [ ] Test validation with valid data
- [ ] Test validation with invalid data

### Task 1.3: Implement createVisit Method
- [ ] Add `createVisit(visit: Omit<Visit, 'id'>): Promise<Visit>` to `firebaseDataService.ts`
  - Generate unique ID using `generateNextVisitId()`
  - Validate input data
  - Create document in `visits` collection with ID as document ID (string)
  - Return complete Visit object including generated ID
  - Handle timeout (10 seconds)
  - Log errors and throw on failure
- [ ] Test successful creation
- [ ] Test with network error
- [ ] Test with validation error

### Task 1.4: Implement updateVisit Method
- [ ] Add `updateVisit(visitId: number, updates: Partial<Visit>): Promise<void>` to `firebaseDataService.ts`
  - Validate update data (skip id and userId updates)
  - Use Firestore `updateDoc()` to merge changes
  - Handle field deletion for undefined values
  - Handle timeout (10 seconds)
  - Log errors and throw on failure
- [ ] Test successful update
- [ ] Test updating visitedAt
- [ ] Test clearing visitedAt (undefined)
- [ ] Test updating notes

### Task 1.5: Implement deleteVisit Method
- [ ] Add `deleteVisit(visitId: number): Promise<void>` to `firebaseDataService.ts`
  - Use Firestore `deleteDoc()` with document reference
  - Handle timeout (10 seconds)
  - Log errors (ignore "not found" errors)
  - Throw on network errors
- [ ] Test successful deletion
- [ ] Test deleting nonexistent visit (should not error)
- [ ] Test with network error

## Phase 2: Frontend - Composable Layer

### Task 2.1: Extend useVisits with addVisit Method
- [ ] Add `addVisit(pubId: number, options?: { visitedAt?: string, notes?: string }): Promise<void>` to `useVisits.ts`
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
- [ ] Test adding visit with default date
- [ ] Test adding visit with specific date
- [ ] Test adding visit with undefined date
- [ ] Test updating existing visit when re-adding
- [ ] Test error when unauthenticated

### Task 2.2: Add updateVisit Method to useVisits
- [ ] Add `updateVisit(pubId: number, updates: { visitedAt?: string | null, notes?: string }): Promise<void>` to `useVisits.ts`
  - Check if user is authenticated
  - Find visit by pubId in `visitState.visits`
  - Throw error if visit not found
  - Call `firebaseDataService.updateVisit(visit.id, updates)`
  - On success, update local state:
    - Update visit in `visitState.visits` array
  - On error, catch and re-throw with user-friendly message
- [ ] Test updating visit date
- [ ] Test clearing visit date
- [ ] Test updating notes
- [ ] Test error when visit not found

### Task 2.3: Add removeVisit Method to useVisits
- [ ] Add `removeVisit(pubId: number): Promise<void>` to `useVisits.ts`
  - Check if user is authenticated
  - Find visit by pubId (if not found, return early - idempotent)
  - Call `firebaseDataService.deleteVisit(visit.id)`
  - On success, update local state:
    - Remove from `visitState.visits` array
    - Remove pubId from `visitState.visitedPubIds` Set
  - On error, catch and re-throw with user-friendly message
- [ ] Test removing existing visit
- [ ] Test removing nonexistent visit (should succeed silently)
- [ ] Test error when unauthenticated

### Task 2.4: Export New Methods
- [ ] Export `addVisit`, `updateVisit`, `removeVisit` from `useVisits()` return object
- [ ] Verify TypeScript types are correct
- [ ] Update JSDoc comments if needed

## Phase 3: UI - Pub Sidebar

### Task 3.1: Add Visit Tracking UI Structure
- [ ] In `PubSidebar.vue`, add conditional rendering:
  - If not authenticated: hide visit controls
  - If authenticated and not visited: show "Mark as Visited" button
  - If authenticated and visited: show visit details section
- [ ] Import `useAuth()` to get authenticated user
- [ ] Import `useVisits()` to get visit methods
- [ ] Test UI appears correctly based on auth state

### Task 3.2: Implement Mark as Visited Button
- [ ] Add "Mark as Visited" button component
  - Use shadcn Button component
  - Add loading state while mutation in progress
  - On click: call `addVisit(selectedPub.id)`
  - Handle errors with toast notification or inline error message
  - Disable button while loading
- [ ] Style button appropriately (primary action)
- [ ] Test button functionality
- [ ] Test loading state
- [ ] Test error display

### Task 3.3: Implement Visit Details Section
- [ ] Create visit details section showing:
  - Visit date display (formatted as locale date string)
  - Edit date icon/button
  - Notes field (textarea or input)
  - "Remove Visit" button
- [ ] Get visit data using `getVisitDate(pubId)` and find full visit in visits array
- [ ] Format date for display ("December 15, 2025" or "Date unknown")
- [ ] Test section appears when pub is visited

### Task 3.4: Implement Date Picker
- [ ] Add date picker component (use shadcn Calendar or Popover with date input)
  - Open on clicking edit date icon
  - Show current visit date selected
  - Allow selecting new date
  - Allow clearing date (set to undefined)
  - On change: call `updateVisit(pubId, { visitedAt: newDate })`
  - Show loading state during update
  - Handle errors with toast notification
- [ ] Test selecting new date
- [ ] Test clearing date
- [ ] Test error handling

### Task 3.5: Implement Notes Field
- [ ] Add notes textarea to visit details section
  - Show existing notes or placeholder "Add notes..."
  - Debounce input (500ms)
  - On blur or debounced change: call `updateVisit(pubId, { notes: newNotes })`
  - Show loading indicator while saving
  - Handle errors with toast notification
- [ ] Test adding notes
- [ ] Test updating notes
- [ ] Test error handling

### Task 3.6: Implement Remove Visit Button
- [ ] Add "Remove Visit" button
  - Use destructive styling (red/warning color)
  - On click: show confirmation dialog
- [ ] Create confirmation dialog component
  - Title: "Remove Visit?"
  - Message: "This action cannot be undone."
  - Cancel button
  - Remove button (destructive)
- [ ] On confirmation: call `removeVisit(pubId)`
  - Show loading state in dialog
  - Close dialog on success
  - Show error toast on failure
- [ ] Test confirmation flow
- [ ] Test cancellation
- [ ] Test successful removal
- [ ] Test error handling

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

## Dependencies & Parallelization

**Sequential Dependencies:**
- Phase 1 must complete before Phase 2
- Phase 2 must complete before Phase 3
- Phase 4 can only start after Phase 3

**Parallelizable Work:**
- Within Phase 1: Tasks 1.1 and 1.2 can be done in parallel
- Within Phase 1: Tasks 1.3, 1.4, 1.5 depend on 1.1 and 1.2, but can be done in parallel with each other
- Within Phase 2: Tasks 2.1, 2.2, 2.3 depend on Phase 1, but can be done in parallel with each other
- Within Phase 3: After 3.1, tasks 3.2-3.6 can be done in any order

## Validation Checklist

After implementation, verify:
- [ ] All requirements in spec deltas are implemented
- [ ] All scenarios in spec deltas pass
- [ ] No console errors in browser
- [ ] No TypeScript errors
- [ ] Firestore security rules allow operations (already implemented)
- [ ] UI is responsive and accessible
- [ ] Error messages are user-friendly
- [ ] Loading states provide feedback
