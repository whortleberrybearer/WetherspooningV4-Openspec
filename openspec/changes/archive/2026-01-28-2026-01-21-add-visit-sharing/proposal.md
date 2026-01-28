# Proposal: Add Visit Sharing

**Change ID:** 2026-01-21-add-visit-sharing  
**Status:** Draft  
**Created:** 2026-01-21  
**Author:** AI Assistant

## Problem Statement

Currently, visit data in Wetherspooning is private and only visible to the authenticated user who created it. Users have no way to share their pub visit history, ratings, or statistics with friends, family, or the wider community. This limits the social and discovery aspects of the application.

Users want to:
- Share their pub visit history with others via a simple URL
- Control who can see their visits (public vs private)
- View other users' visit data when shared with them
- Understand when viewing someone else's data vs their own
- Easily return to their own data after viewing shared visits

## Proposed Solution

Implement a visit sharing system that allows users to:

1. **Generate a shareable URL** - Each user gets a unique, permanent shareable link based on their username (e.g., `/visits/@username`)
2. **Control privacy** - Users can toggle their visits between public (shareable) and private modes via account settings
3. **View shared visits** - Anyone with the link can view public visit data (dates, ratings, statistics) but not private notes
4. **Clear context** - The UI clearly indicates when viewing someone else's data and provides navigation back to own visits

This solution requires two new capabilities:
- **shared-visit-viewing**: View another user's public visit data via shareable URL
- **visit-privacy-settings**: Control visibility of own visits (public/private toggle)

## Scope

### In Scope
- Public/private toggle for user's visit data in account settings
- Shareable URL pattern: `/visits/@username`
- View-only access to shared visit data (dates, ratings, stats)
- Privacy filter: hide notes from shared views
- UI indicators showing whose data is being viewed
- Navigation to return to own visits or start tracking
- Firestore security rules for public read access to public visits
- User document structure with username and privacy settings

### Out of Scope (Future Enhancements)
- Following other users for easy access to their data
- Comparing visit data between multiple users
- Notifications when followed users visit new pubs
- Social features (likes, comments on visits)
- Versionable sharing links for different user groups
- Granular privacy controls (per-visit visibility)

## Impact Analysis

### New Capabilities
- **shared-visit-viewing** (new spec)
- **visit-privacy-settings** (new spec)

### Modified Capabilities
- **user-authentication**: Add username field requirement and uniqueness validation
- **user-signup**: Capture and store username during registration
- **account-settings**: Add privacy toggle UI
- **firebase-data-integration**: Add users collection, update visits security rules
- **pub-visit-data**: Support loading visits for other users (public only)

### Dependencies
- Requires username field in user authentication (not currently stored)
- Requires new Firestore collection: `users` with privacy settings
- Requires routing changes to support `/visits/@username` pattern
- Requires Firestore security rules update for public visit access

## Technical Considerations

### Data Model Changes
```typescript
// New: Users collection in Firestore
interface UserProfile {
  uid: string           // Firebase UID
  username: string      // Unique username for shareable URLs
  email: string        // User's email
  visitsPublic: boolean // Privacy toggle (default: false)
  createdAt: string    // ISO timestamp
}

// Modified: User interface (in auth state)
interface User {
  username: string     // Now required (not just for display)
  email?: string
  uid?: string
}
```

### URL Structure
- Own visits: `/` (existing)
- Shared visits: `/visits/@username` (new)
- Query parameter alternative avoided (cleaner URLs)

### Privacy Implementation
- Default: visits are private (`visitsPublic: false`)
- Public visits: readable by anyone with the link
- Private visits: only readable by owner (existing behavior)
- Notes field: always private, never exposed in shared views

### Security Rules Update
```
match /visits/{visitId} {
  // Existing: owner can always read
  allow read: if request.auth != null 
              && resource.data.userId == request.auth.uid;
  
  // New: public visits readable by anyone if user has visitsPublic=true
  allow read: if exists(/databases/$(database)/documents/users/$(resource.data.userId))
              && get(/databases/$(database)/documents/users/$(resource.data.userId)).data.visitsPublic == true;
}
```

### Performance Considerations
- Username lookups: indexed in Firestore users collection
- Public visit queries: filtered by userId and public flag
- Caching: username -> uid mapping could be cached client-side
- No N+1 queries: single query for user profile, single query for visits

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Username conflicts during migration | High | Validate uniqueness during signup, handle migration with auto-generated usernames |
| Privacy confusion (users not understanding default private) | Medium | Clear UI labels, confirmation dialog when toggling to public |
| Firestore read costs increase with public visits | Low | Implement client-side caching, monitor usage |
| Users sharing then deleting visits causes broken links | Low | Document expected behavior, maintain URL even if visits become private |

## Success Metrics

- Users can successfully generate and share visit URLs
- Shared visit views correctly hide notes field
- Privacy toggle works correctly in both directions
- Clear visual distinction between own and shared visit views
- Zero privacy leaks (private data never exposed)

## Questions & Clarifications

1. **Username requirements**: Should we enforce any username format rules (alphanumeric, max length, reserved words)?
2. **Migration strategy**: How should existing users without usernames be handled? Auto-generate? Prompt on next login?
3. **Default privacy**: Confirm visits should default to private (opt-in sharing)?
4. **Notes visibility**: Confirm notes should NEVER be visible in shared views (even if user later changes to public)?

## Related Changes

This change may enable future enhancements:
- `follow-users`: Allow users to follow others for easy access to their visit data
- `compare-visits`: Side-by-side comparison of visit statistics between users
- `visit-notifications`: Alerts when followed users visit new pubs
