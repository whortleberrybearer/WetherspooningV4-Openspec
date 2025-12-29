# Change Proposal: Add Visit Tracking Mutations

## Metadata
- **Change ID:** 2025-12-29-add-visit-tracking-mutations
- **Author:** AI Assistant
- **Date:** 2025-12-29
- **Status:** Proposed

## Problem Statement
Users can currently view which pubs they have visited (loaded from Firestore), but they cannot create, update, or delete visit records through the application. The ability to track pub visits, set visit dates, and remove erroneous visits is essential for the core value proposition of the Wetherspooning application.

## Current Behavior
- Users can view visited pubs on the map (shown with different marker colors)
- Visit data is loaded from Firestore when users authenticate
- The `useVisits` composable provides read-only methods: `isVisited()`, `getVisitDate()`, `getGroupCounts()`
- The `firebaseDataService` only has `getUserVisits()` for reading visit data
- Firestore security rules already permit authenticated users to create/update/delete their own visits

## Proposed Changes
Add write capabilities to the visit tracking system:

1. **Create Visit:** Allow logged-in users to mark a pub as visited with an optional date (defaults to current date) and optional notes
2. **Update Visit:** Allow users to modify the visit date or add/edit notes for existing visits
3. **Delete Visit:** Allow users to remove visits that were created in error
4. **Expandability:** Ensure the data model supports future addition of ratings without requiring schema changes

## Benefits
- Users can actively track their pub visits within the application
- Visit dates can be recorded for historical tracking
- Users can correct mistakes by removing incorrect visits
- Foundation is laid for future rating and review features

## Scope
This change affects:
- **pub-visit-data** spec: Add write operations (create, update, delete)
- **firebase-data-integration** spec: Add mutation methods to `firebaseDataService`
- **pub-navigation-sidebar** spec: Add UI for visit tracking actions
- **pub-locations-map** spec: Optional inline visit tracking on map markers

## Dependencies
- Requires user authentication (already implemented via `user-authentication` spec)
- Firestore security rules already support visit mutations (no changes needed)
- Visit data structure already includes optional `rating` and `notes` fields for future expansion

## Risks & Mitigations
- **Risk:** Users might accidentally delete visits
  - **Mitigation:** Require confirmation dialog before deletion
- **Risk:** Concurrent updates from multiple devices
  - **Mitigation:** Use Firestore document IDs to prevent duplicates; last-write-wins for updates
- **Risk:** Users create duplicate visits for the same pub
  - **Mitigation:** Check for existing visit before creating new one; update if already exists

## Success Criteria
- Authenticated users can add a visit to a pub with an optional date
- Users can delete their own visits
- Users can update visit dates and notes
- Visit date defaults to current date but can be set to undefined
- All mutations immediately reflect in the UI (map markers, sidebar)
- Changes persist across sessions via Firestore
