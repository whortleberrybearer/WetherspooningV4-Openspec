# Design: Visit Sharing Architecture

**Change ID:** 2026-01-21-add-visit-sharing

## Overview

This document outlines the architectural decisions for implementing visit sharing functionality in Wetherspooning, allowing users to share their pub visit history via unique URLs while maintaining privacy controls.

## Architecture Decisions

### 1. URL Structure

**Decision:** Use path-based routing with username: `/visits/@username`

**Rationale:**
- Clean, user-friendly URLs that are easy to share
- Twitter/Instagram-style pattern familiar to users
- Self-documenting (username clearly visible in URL)
- No query parameters needed (cleaner than `/visits?user=username`)

**Alternatives Considered:**
- Query-based: `/visits?user=username` - Less clean, harder to remember
- UID-based: `/visits/abc123uid` - Not user-friendly, exposes Firebase internals
- Numeric ID: `/visits/12345` - Requires additional ID management

**Implementation:**
- Vue Router: Add new route `/visits/:username` with `@` prefix in param
- Route guard: Load user profile and visits based on username
- Fallback: 404 page if username not found

### 2. Data Model - Users Collection

**Decision:** Create new `users` Firestore collection with user profile data

**Structure:**
```typescript
interface UserProfile {
  uid: string           // Firebase UID (document ID)
  username: string      // Unique username (indexed)
  email: string         // User email
  visitsPublic: boolean // Privacy toggle (default: false)
  createdAt: string     // ISO 8601 timestamp
}
```

**Rationale:**
- Firebase Auth doesn't support custom fields like username
- Firestore allows flexible querying and indexing
- Separates auth concerns from profile data
- Enables future profile extensions (avatar, bio, etc.)

**Alternatives Considered:**
- Firebase Auth custom claims - Limited to 1KB, not queryable
- Realtime Database - Less familiar to team, different security model
- Store in existing collections - Violates separation of concerns

**Indexes Required:**
- `username` (ascending) - For username -> UID lookup
- Composite not needed initially (single-field queries only)

### 3. Privacy Model

**Decision:** All-or-nothing privacy toggle at user level

**States:**
- `visitsPublic: false` (default) - No visits visible to others
- `visitsPublic: true` - All visits visible (except notes)

**Rationale:**
- Simple mental model for users
- Matches common social media privacy patterns
- Reduces UI complexity (single toggle vs per-visit controls)
- Adequate for initial feature (can extend later)

**Privacy Rules:**
- Visits default to private (privacy-by-default principle)
- Notes field ALWAYS private (never exposed in shared views)
- Date and rating fields visible when public
- Owner always sees own data regardless of privacy setting

**Future Extensions (Out of Scope):**
- Per-visit privacy controls
- Granular field-level visibility
- Friend groups with different access levels

### 4. Firestore Security Rules

**Decision:** Extend existing visit security rules with public read access

**New Rules:**
```javascript
match /visits/{visitId} {
  // Existing: owner can always read their visits
  allow read: if request.auth != null 
              && resource.data.userId == request.auth.uid;
  
  // New: anyone can read if user has public visits enabled
  allow read: if exists(/databases/$(database)/documents/users/$(resource.data.userId))
              && get(/databases/$(database)/documents/users/$(resource.data.userId)).data.visitsPublic == true;
  
  // Existing: create/update/delete rules unchanged
}

// New: users collection rules
match /users/{userId} {
  // Anyone can read public profile data (needed for username lookup)
  allow read: if true;
  
  // Only the user can create/update their own profile
  allow create: if request.auth != null 
                && request.auth.uid == userId
                && request.resource.data.uid == userId;
  
  allow update: if request.auth != null 
                && request.auth.uid == userId
                && request.resource.data.uid == resource.data.uid; // Prevent UID change
  
  // Users cannot delete their profile (delete account flow handles this)
  allow delete: if false;
}
```

**Rationale:**
- Firestore rules enforce privacy at database level (defense in depth)
- Public read on users collection enables username lookups without auth
- UID immutability prevents profile hijacking
- Existing auth rules remain unchanged (backward compatible)

**Security Considerations:**
- No PII exposed in public user profiles (only username)
- Notes field filtered client-side as additional safety layer
- Rate limiting handled by Firestore (default quotas)

### 5. Client-Side Data Filtering

**Decision:** Filter notes field on client even though rules prevent it

**Implementation:**
```typescript
// In shared visit view
const filteredVisits = visits.map(visit => ({
  ...visit,
  notes: undefined  // Explicitly remove notes
}))
```

**Rationale:**
- Defense in depth (multiple layers of privacy protection)
- Clear code intent (explicit about hiding notes)
- Protects against potential future rule bugs
- Makes privacy visible in code reviews

### 6. Username Management

**Decision:** Capture username during signup, enforce uniqueness

**Requirements:**
- Usernames must be unique (Firestore unique index)
- Validation: 3-20 characters, alphanumeric + underscore/hyphen
- Case-insensitive uniqueness (store lowercase, display as-entered)
- No reserved words (admin, api, visits, etc.)

**Collision Handling:**
- Signup validation checks username availability before creating account
- Firestore transaction ensures atomicity
- Error message: "Username already taken, please choose another"

**Migration Strategy (for existing users without usernames):**
- Prompt on next login: "Choose a username to enable visit sharing"
- Temporary restriction: Cannot toggle visits public without username
- Auto-generate option: email prefix + random suffix (user can change)

### 7. UI State Management

**Decision:** Use route params to determine view mode (own vs shared)

**View Modes:**
```typescript
type ViewMode = 'own' | 'shared'

// Determined by:
const viewMode = route.params.username 
  ? 'shared' 
  : 'own'
```

**UI Indicators:**
- Shared view: Banner at top "Viewing @username's visits"
- Shared view: "View my visits" button (if authenticated) or "Start tracking" (if not)
- Own view: No banner, normal UI

**State Isolation:**
- Own visit data: Loaded into `useVisits()` composable
- Shared visit data: Separate reactive state (doesn't pollute own data)
- Clear on navigation: Shared data cleared when returning to own view

### 8. Performance Optimization

**Caching Strategy:**
- User profile: Cache username -> UID mapping in sessionStorage
- Visit data: No caching (always fresh for shared views)
- Pub data: Use existing pub data cache (already loaded)

**Query Optimization:**
- Index username field for O(1) lookups
- Composite query: `visits where userId == uid order by visitedAt desc`
- Pagination: Not implemented initially (reasonable for <1000 visits)

**Future Optimizations (Out of Scope):**
- Client-side caching of shared visit data
- Pagination for users with 1000+ visits
- CDN caching of public user profiles

## Data Flow

### Sharing Flow (Owner Perspective)
1. User opens Account Settings
2. Clicks "Make visits public" toggle
3. System updates `users/{uid}/visitsPublic = true`
4. System displays shareable URL: `/visits/@username`
5. User copies and shares URL

### Viewing Flow (Visitor Perspective)
1. User navigates to `/visits/@username`
2. Vue Router matches route, extracts username
3. System queries `users` collection for username
4. If found: Load user profile (check `visitsPublic`)
5. If public: Query visits where `userId == uid`
6. Filter out notes field client-side
7. Render visit data with "Viewing @username" banner
8. Provide "View my visits" / "Start tracking" navigation

### Return Flow
1. User clicks "View my visits" or "Start tracking"
2. Navigate to `/` (home route)
3. Clear shared visit state
4. Load own visit data (if authenticated)

## Error Handling

| Scenario | Behavior |
|----------|----------|
| Username not found | 404 page "User not found" |
| User exists but visits private | "This user's visits are private" message |
| User has no visits | "No visits yet" empty state |
| Network error loading visits | Error message, retry button |
| Firestore permission denied | Fallback to "Cannot load visits" |

## Testing Strategy

### Unit Tests
- Username validation logic
- Note filtering on shared visits
- Privacy toggle state management

### Integration Tests
- Firestore security rules (emulator)
- User profile creation/update
- Visit querying with public flag

### E2E Tests
- Complete sharing flow (toggle public, copy URL)
- Shared visit viewing flow (navigate, view data)
- Privacy enforcement (private visits not visible)
- Navigation (shared -> own -> shared)

## Migration Plan

### Phase 1: Foundation (No User Impact)
1. Create users collection in Firestore
2. Update security rules (visits remain private by default)
3. Add username field to signup flow (optional initially)

### Phase 2: User Onboarding
1. Prompt existing users for username on next login
2. Make username required for new signups
3. Enable privacy toggle (default: private)

### Phase 3: Sharing Launch
1. Add shareable URL display in Account Settings
2. Enable `/visits/@username` route
3. Launch feature with in-app announcement

## Open Questions

1. **Username validation**: Should we allow Unicode characters (international usernames)?
2. **Reserved usernames**: What list of reserved words should we block?
3. **Username changes**: Should users be able to change their username? (Breaking existing shared links)
4. **Migration UX**: Modal prompt vs inline banner vs email notification for existing users?
