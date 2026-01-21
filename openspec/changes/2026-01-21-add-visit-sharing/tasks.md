# Tasks: Add Visit Sharing

**Change ID:** 2026-01-21-add-visit-sharing

## Implementation Order

Tasks are ordered to deliver user-visible progress incrementally while managing dependencies.

### Phase 1: Foundation (No User-Facing Changes)

- [ ] **Create Firestore users collection structure**
  - Define UserProfile TypeScript interface in firebaseDataService.ts
  - Add validation function for user profile documents
  - Add indexes for username field (ascending, unique)
  - Test: Verify interface compiles, validation logic works

- [ ] **Update Firestore security rules for users collection**
  - Add rules for `/users/{userId}` path
  - Allow public read (anyone can query username)
  - Allow create/update only by owner (auth.uid matches document ID)
  - Prevent UID field modification after creation
  - Test: Run security rules unit tests in emulator

- [ ] **Update Firestore security rules for public visit access**
  - Extend `/visits/{visitId}` rules to allow public read when visitsPublic=true
  - Keep existing owner read/write rules
  - Add helper function to check public flag from users collection
  - Test: Verify private visits blocked, public visits allowed in emulator

### Phase 2: User Profile Management

- [ ] **Add username field to User interface**
  - Update User interface in useAuth.ts to make username required (not optional)
  - Update authState initialization to include username
  - Update Firebase Auth state change handler to load username from users collection
  - Test: Verify type checking passes, auth state includes username

- [ ] **Add username validation logic**
  - Create validateUsername function (3-20 chars, alphanumeric + underscore/hyphen)
  - Create checkUsernameAvailable function (query users collection)
  - Add reserved username list (admin, api, visits, settings)
  - Test: Unit tests for validation rules and availability check

- [ ] **Update signup flow to capture username**
  - Add username input field to signup dialog (between email and password)
  - Add real-time validation (check availability on blur)
  - Update createUserWithEmailAndPassword flow to create user profile
  - Use Firestore transaction to create auth + profile atomically
  - Test: E2E test signup with username, verify profile created

- [ ] **Create user profile service functions**
  - Add createUserProfile(uid, username, email) to firebaseDataService
  - Add getUserProfile(uid) function
  - Add getUserProfileByUsername(username) function
  - Add updateUserPrivacy(uid, visitsPublic) function
  - Test: Unit tests for each service function

- [ ] **Load user profile on authentication**
  - Update onAuthStateChanged handler in useAuth to load user profile
  - Populate username from Firestore users collection
  - Handle missing profile (legacy users) gracefully
  - Test: Login triggers profile load, username appears in UI

### Phase 3: Privacy Settings UI

- [ ] **Add privacy toggle to Account Settings dialog**
  - Import shadcn/vue Switch component
  - Add toggle UI below email, above Delete Account button
  - Add helper text explaining public sharing
  - Bind toggle to visitsPublic state from user profile
  - Test: Toggle renders, state binding works

- [ ] **Implement privacy toggle state management**
  - Create reactive state for visitsPublic in useAuth or new composable
  - Add updatePrivacy function that calls firebaseDataService
  - Handle loading state during save
  - Handle errors and revert on failure
  - Test: Toggle saves to Firestore, persists across refresh

- [ ] **Add shareable URL display**
  - Show URL input field when visitsPublic=true
  - Format URL: `${window.location.origin}/visits/@${username}`
  - Add copy button using Clipboard API
  - Show "Link copied!" feedback for 2 seconds
  - Hide URL when visitsPublic=false
  - Test: URL displays correctly, copy works, hides when toggled off

- [ ] **Add first-time confirmation dialog**
  - Create confirmation dialog component (shadcn/vue Dialog)
  - Trigger on first toggle to public (track via localStorage or user profile flag)
  - Show explanation of what becomes public
  - Handle confirm (save) and cancel (revert) actions
  - Test: Dialog appears on first toggle, doesn't appear on subsequent

### Phase 4: Shared Visit Viewing

- [ ] **Add shared visit route to Vue Router**
  - Define route `/visits/:username` in router/index.ts
  - Add route guard to load user profile by username
  - Handle username not found (404)
  - Handle user exists but visits private (custom message)
  - Test: Navigation to valid/invalid usernames works

- [ ] **Create SharedVisitView component**
  - Create new view component in views/SharedVisitView.vue
  - Extract username from route params
  - Load user profile by username
  - Display loading, error, and success states
  - Test: Component loads and handles route params

- [ ] **Implement shared visit data loading**
  - Create loadPublicVisits(userId) in useVisits composable (separate from loadVisits)
  - Query visits collection filtered by userId
  - Filter out notes field client-side (defense in depth)
  - Store in separate reactive state (don't mix with own visits)
  - Test: Loads correct user's visits, notes excluded

- [ ] **Add view mode banner UI**
  - Create banner component showing "Viewing @{username}'s visits"
  - Add "View my visits" button for authenticated users
  - Add "Start tracking" button for unauthenticated users
  - Style with distinct background color
  - Position at top of main content area
  - Test: Banner displays, buttons navigate correctly

- [ ] **Integrate shared visits with map**
  - Reuse existing map component with shared visit data
  - Apply visited markers for shared user's visits
  - Update pub detail sheet to show shared visit info
  - Hide edit/delete buttons in shared view
  - Hide notes field in pub detail sheet
  - Test: Map shows correct markers, pub details load correctly

- [ ] **Add visit statistics for shared view**
  - Calculate total visit count
  - Calculate average rating (if ratings exist)
  - Display prominently in shared view
  - Handle edge cases (no visits, no ratings)
  - Test: Statistics calculate correctly

- [ ] **Implement shared view responsive layout**
  - Apply mobile-first design to shared view
  - Ensure banner responsive across screen sizes
  - Test visit list and map on mobile and desktop
  - Verify touch targets meet 44×44px minimum on mobile
  - Test: Renders correctly on mobile (320px) and desktop (1920px)

### Phase 5: Navigation & User Experience

- [ ] **Implement "View my visits" navigation**
  - Clicking button navigates to "/" route
  - Clear shared visit state
  - Load own visit data if authenticated
  - Test: Navigation works, data switches correctly

- [ ] **Implement "Start tracking" navigation**
  - Clicking button navigates to "/" route
  - Show signup/login dialog for unauthenticated users
  - Test: Navigation works, signup prompt appears

- [ ] **Add page titles for shared view**
  - Set document title to "{username}'s Visits - Wetherspooning"
  - Update title when switching between views
  - Test: Browser tab shows correct title

- [ ] **Ensure state isolation between own and shared views**
  - Verify own visit data not polluted by shared data
  - Clear shared data when navigating away
  - Test switching between own -> shared -> own views
  - Test: Data isolation maintained, no cross-contamination

### Phase 6: Accessibility & Polish

- [ ] **Add ARIA labels for shared view**
  - Add landmark role to banner
  - Add accessible labels to navigation buttons
  - Add screen reader announcements for view mode
  - Test: Screen reader announces view mode and navigation

- [ ] **Implement keyboard navigation for shared view**
  - Ensure all interactive elements focusable
  - Add visible focus indicators
  - Test Tab navigation through all elements
  - Test: Keyboard-only users can navigate fully

- [ ] **Add error handling for shared view**
  - User not found -> 404 page with helpful message
  - Visits private -> Custom message with explanation
  - Network errors -> Retry button and error message
  - Test: Error states display correctly

- [ ] **Test color contrast for banner and buttons**
  - Verify WCAG AA compliance (4.5:1 for text)
  - Use browser DevTools or axe to check contrast
  - Adjust colors if needed
  - Test: All text meets contrast requirements

### Phase 7: Migration & Rollout

- [ ] **Create migration script for existing users**
  - Script to create user profiles for existing Firebase Auth users
  - Auto-generate usernames (email prefix + random suffix if conflict)
  - Set visitsPublic=false for all existing users
  - Run script in staging environment
  - Test: All existing users get profiles, no conflicts

- [ ] **Add username prompt for legacy users**
  - Detect users without username in Firestore on login
  - Show dialog prompting for username selection
  - Validate and save username before allowing app access
  - Test: Legacy users prompted, username saved correctly

- [ ] **Update user documentation**
  - Add sharing feature to help/FAQ
  - Document privacy settings
  - Explain what data is shared (and what isn't)
  - Update screenshots if applicable

### Phase 8: Testing & Validation

- [ ] **Write unit tests for privacy logic**
  - Test validateUsername function
  - Test checkUsernameAvailable function
  - Test privacy toggle state management
  - Test notes filtering in shared view

- [ ] **Write integration tests for Firestore**
  - Test user profile creation
  - Test privacy setting updates
  - Test public visit queries
  - Test security rules enforcement (emulator)

- [ ] **Write E2E tests for sharing flow**
  - Test complete flow: signup -> toggle public -> copy URL
  - Test shared visit viewing (valid user, public visits)
  - Test privacy enforcement (private visits show message)
  - Test navigation between own and shared views

- [ ] **Perform accessibility audit**
  - Run axe DevTools on Account Settings and shared view
  - Test with screen reader (NVDA or JAWS)
  - Test keyboard-only navigation
  - Fix any issues found

- [ ] **Conduct user testing**
  - Test with 2-3 users unfamiliar with feature
  - Verify privacy toggle is understandable
  - Verify shared view is clear (not confused with own data)
  - Gather feedback and iterate

## Validation Criteria

Each task is complete when:
- Code implements the requirement fully
- Tests pass (unit, integration, or E2E as applicable)
- Code reviewed and approved (if team workflow requires)
- No regressions in existing functionality
- Accessibility requirements met

## Dependencies

- Phase 2 depends on Phase 1 (users collection must exist)
- Phase 3 depends on Phase 2 (username and profile management)
- Phase 4 depends on Phase 1, 2 (security rules and user profiles)
- Phase 5 depends on Phase 4 (shared view must exist)
- Phase 7 depends on all previous phases (rollout after feature complete)

## Parallel Work Opportunities

- Phase 1 tasks can be done in parallel (Firestore structure + security rules)
- Phase 3 UI tasks can start while Phase 2 service functions being built
- Phase 6 accessibility tasks can be done alongside Phase 4-5 implementation
- Documentation (Phase 7) can be written while testing (Phase 8)
