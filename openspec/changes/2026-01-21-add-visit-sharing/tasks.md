# Tasks: Add Visit Sharing

**Change ID:** 2026-01-21-add-visit-sharing

## Implementation Order

Tasks are ordered to deliver user-visible progress incrementally while managing dependencies.

### Phase 1: Foundation (No User-Facing Changes)

- [x] **Create Firestore users collection structure**
  - Define UserProfile TypeScript interface in firebaseDataService.ts
  - Add validation function for user profile documents
  - Add indexes for username field (ascending, unique)
  - Test: Verify interface compiles, validation logic works

- [x] **Update Firestore security rules for users collection**
  - Add rules for `/users/{userId}` path
  - Allow public read (anyone can query username)
  - Allow create/update only by owner (auth.uid matches document ID)
  - Prevent UID field modification after creation
  - Test: Run security rules unit tests in emulator

- [x] **Update Firestore security rules for public visit access**
  - Extend `/visits/{visitId}` rules to allow public read when visitsPublic=true
  - Keep existing owner read/write rules
  - Add helper function to check public flag from users collection
  - Test: Verify private visits blocked, public visits allowed in emulator

### Phase 2: User Profile Management

- [x] **Add username field to User interface**
  - Update User interface in useAuth.ts to make username required (not optional)
  - Update authState initialization to include username
  - Update Firebase Auth state change handler to load username from users collection
  - Test: Verify type checking passes, auth state includes username

- [x] **Add username validation logic**
  - Create validateUsername function (3-20 chars, alphanumeric + underscore/hyphen)
  - Create checkUsernameAvailable function (query users collection)
  - Add reserved username list (admin, api, visits, settings)
  - Test: Unit tests for validation rules and availability check

- [x] **Update signup flow to capture username**
  - Add username input field to signup dialog (between email and password)
  - Add real-time validation (check availability on blur)
  - Update createUserWithEmailAndPassword flow to create user profile
  - Use Firestore transaction to create auth + profile atomically
  - Test: E2E test signup with username, verify profile created

- [x] **Create user profile service functions**
  - Add createUserProfile(uid, username, email) to firebaseDataService
  - Add getUserProfile(uid) function
  - Add getUserProfileByUsername(username) function
  - Add updateUserPrivacy(uid, visitsPublic) function
  - Test: Unit tests for each service function

- [x] **Load user profile on authentication**
  - Update onAuthStateChanged handler in useAuth to load user profile
  - Populate username from Firestore users collection
  - Handle missing profile (legacy users) gracefully
  - Test: Login triggers profile load, username appears in UI

### Phase 3: Privacy Settings UI

- [x] **Add privacy toggle to Account Settings dialog**
  - Import shadcn/vue Switch component
  - Add toggle UI below email, above Delete Account button
  - Add helper text explaining public sharing
  - Bind toggle to visitsPublic state from user profile
  - Test: Toggle renders, state binding works

- [x] **Implement privacy toggle state management**
  - Create reactive state for visitsPublic in useAuth or new composable
  - Add updatePrivacy function that calls firebaseDataService
  - Handle loading state during save
  - Handle errors and revert on failure
  - Test: Toggle saves to Firestore, persists across refresh

- [x] **Add shareable URL display**
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

- [x] **Add shared visit route to Vue Router**
  - Define route `/visits/@:username` in router/index.ts
  - Route points to SharedVisitsView component
  - Test: Navigation to route works

- [x] **Create SharedVisitsView component**
  - Create new view component in views/SharedVisitsView.vue
  - Extract username from route params (remove @ prefix)
  - Load user profile by username using getUserProfileByUsername
  - Display loading, error, and success states
  - Test: Component loads and handles route params

- [x] **Implement shared visit data loading**
  - Create getPublicVisits(userId) in firebaseDataService
  - Query visits collection filtered by userId
  - Verify user has visitsPublic=true before loading
  - Filter out notes field from returned visits (privacy requirement)
  - Test: Loads correct user's visits, notes excluded

- [x] **Add view mode banner UI**
  - Create banner in SharedVisitsView showing "Viewing @{username}'s visits"
  - Add "View my visits" button for authenticated users
  - Add "Start tracking" button for unauthenticated users
  - Style with Alert component and shadow
  - Position at top with absolute positioning and z-index
  - Test: Banner displays, buttons navigate correctly

- [x] **Integrate shared visits with map**
  - Add sharedVisitsMode prop to PubLocationsMap component
  - Create helper functions isMarkerVisited and getMarkerVisit for mode-agnostic logic
  - Pass shared visits data from SharedVisitsView to PubLocationsMap
  - Apply visited markers for shared user's visits (green markers with checkmarks)
  - Update overlay to use mode-agnostic visit functions
  - Disable geolocation/proximity check in shared mode
  - Test: Map shows correct markers for shared visits

- [x] **Update pub detail sheet for shared view**
  - Add isReadonly prop to PubDetailSheet component
  - Hide edit/delete buttons when isReadonly=true
  - Display visit date and rating in readonly mode
  - Never show notes field in shared view (privacy requirement)
  - Show "This pub has not been visited yet" when no visit exists in shared mode
  - Test: Detail sheet shows correct readonly view

- [ ] **Add visit statistics for shared view**
  - Calculate total visit count from shared visits
  - Calculate closed pubs count
  - Calculate remaining visits count
  - Display in SharedVisitsView below banner
  - Match existing stats pattern (total/closed/remaining)
  - Test: Statistics calculate correctly

- [ ] **Implement shared view responsive layout**
  - Apply mobile-first design to shared view banner
  - Ensure banner responsive across screen sizes
  - Test on mobile and desktop viewports
  - Verify banner doesn't overlap search/controls
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
