# Design Document: Visit Tracking Mutations

## Architecture Overview
The visit tracking mutations extend the existing read-only visit system with write operations. The architecture follows the established pattern:

```
UI Components (PubSidebar, Map Markers)
    ↓ (user actions)
useVisits Composable (mutations)
    ↓ (data operations)
firebaseDataService (Firestore SDK)
    ↓ (network)
Firestore /visits collection
```

## Data Flow

### Creating a Visit
1. User clicks "Mark as Visited" in PubSidebar or on a map marker
2. UI component calls `useVisits.addVisit(pubId, { visitedAt?: string, notes?: string })`
3. `addVisit()` checks for existing visit for this pub:
   - If exists: Updates existing visit
   - If not: Creates new visit document
4. Calls `firebaseDataService.createVisit()` or `updateVisit()`
5. On success, updates local reactive state
6. Map markers and sidebar automatically reflect the change

### Updating a Visit
1. User edits visit date or notes in PubSidebar
2. Component calls `useVisits.updateVisit(pubId, { visitedAt?, notes? })`
3. `updateVisit()` finds visit by pubId
4. Calls `firebaseDataService.updateVisit(visitId, updates)`
5. Updates local state on success

### Deleting a Visit
1. User clicks "Remove Visit" button (with confirmation dialog)
2. Component calls `useVisits.removeVisit(pubId)`
3. `removeVisit()` finds visit by pubId
4. Calls `firebaseDataService.deleteVisit(visitId)`
5. Removes from local state on success

## Data Model

### Visit Document Structure
```typescript
{
  id: number,           // Unique numeric ID (auto-increment)
  userId: string,       // Firebase UID
  pubId: number,        // Reference to pub
  visitedAt?: string,   // ISO 8601 date (optional, can be undefined)
  notes?: string,       // User notes (optional, for future)
  rating?: number       // 1-5 stars (optional, for future)
}
```

### Document ID Strategy
- Use numeric `id` field as the Firestore document ID
- Generate next ID by querying max existing ID + 1
- Fallback to timestamp-based ID if concurrent creation occurs

## State Management

### Local State Updates
After each mutation:
1. Update `visitState.visits` array (add/update/remove)
2. Update `visitState.visitedPubIds` Set for O(1) lookups
3. Reactive UI components automatically re-render

### Optimistic Updates vs. Await
- **Approach:** Wait for Firestore confirmation before updating local state
- **Rationale:** Ensures data consistency; failures don't require rollback
- **Trade-off:** Slightly slower UX, but more reliable

## Error Handling

### Network Failures
- Catch Firestore errors and display user-friendly messages
- Log full errors to console for debugging
- Do not update local state on failure

### Validation Errors
- Validate inputs before calling Firestore:
  - `visitedAt` must be valid ISO 8601 string if provided
  - `rating` must be 1-5 if provided
  - `notes` must be string if provided

### Concurrent Modifications
- Last-write-wins for updates (Firestore default behavior)
- Document ID prevents duplicate creation for same pub

## UI Considerations

### Visit Tracking UI Location
**Primary:** PubSidebar
- "Mark as Visited" button (when not visited)
- Visit details section (when visited):
  - Visit date (editable)
  - Notes field (optional)
  - "Remove Visit" button

**Secondary:** Map Markers (optional enhancement)
- Right-click or long-press context menu
- Quick "Mark Visited" action

### Date Input
- Use native date picker for `visitedAt`
- Default to today's date
- Allow clearing date to set as undefined
- Display "Date unknown" when visitedAt is undefined

### Confirmation Dialogs
- Show confirmation before deleting a visit
- Message: "Remove this visit? This action cannot be undone."

## Security

### Firestore Rules (Already Implemented)
```
allow create: if request.auth != null 
              && request.resource.data.userId == request.auth.uid;

allow update, delete: if request.auth != null 
                      && resource.data.userId == request.auth.uid;
```

These rules ensure:
- Only authenticated users can create visits
- Users can only create visits with their own userId
- Users can only update/delete their own visits

## Performance Considerations

### ID Generation
- Simple approach: Query for max ID, increment by 1
- Acceptable for low-frequency writes (user visit tracking)
- If conflicts occur, retry with new ID

### Batch Operations
- Not needed initially (single visit operations)
- Future optimization: Batch multiple visit updates

### Indexing
- Existing index on `userId` field sufficient for queries
- No additional indexes needed for mutations

## Future Expansion

### Rating System
- `rating` field already exists in schema
- Add UI for star rating input
- No backend changes needed

### Review System
- `notes` field serves as initial review text
- Future: Expand to structured review with title, body, photos
- May require migration to separate `reviews` collection

### Offline Support
- Future enhancement: Use Firestore offline persistence
- Queue mutations when offline, sync when online

## Open Questions
None. The design is straightforward given existing infrastructure.
