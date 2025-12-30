# Tasks: Add Proximity Visit Prompt

## Phase 1: Core Implementation

### 1.1 Add Distance Calculation Utility
- [ ] Create `calculateDistance()` helper function in PubLocationsMap.vue
- [ ] Implement Haversine formula for lat/lng to metres conversion
- [ ] Add JSDoc comments explaining the formula
- [ ] Test with known coordinates to verify accuracy

### 1.2 Add Proximity Detection Logic
- [ ] Add reactive state for nearest pub: `nearbyPub` (ref)
- [ ] Add reactive state for dismissed prompts: `dismissedPrompts` (ref<Set<number>>)
- [ ] Create `checkProximity()` function to find nearest open pub
- [ ] Filter out closed pubs before distance calculation
- [ ] Filter out already-visited pubs (check `isVisited()`)
- [ ] Filter out dismissed pubs (check dismissedPrompts Set)
- [ ] Find pub with minimum distance
- [ ] Set `nearbyPub` if distance < 100m, otherwise set to null
- [ ] Add console logging for debugging proximity detection

### 1.3 Integrate Geolocation Watch
- [ ] Add `watchPosition()` call in `centerOnUserLocation()` or separate function
- [ ] Configure watch options: `enableHighAccuracy: true`, `maximumAge: 10000`, `timeout: 5000`
- [ ] Store watch ID for cleanup: `geolocationWatchId` (ref)
- [ ] Call `checkProximity()` on position update callback
- [ ] Clear watch on component unmount (onBeforeUnmount)
- [ ] Handle geolocation errors gracefully (no feature crash)

### 1.4 Session Storage for Dismissed Prompts
- [ ] Create `loadDismissedPrompts()` function to read from sessionStorage
- [ ] Call `loadDismissedPrompts()` on component mount
- [ ] Create `saveDismissedPrompts()` function to write to sessionStorage
- [ ] Call `saveDismissedPrompts()` whenever dismissedPrompts Set changes

### 1.5 Create ProximityVisitPrompt Component
- [ ] Create new file: `src/components/ProximityVisitPrompt.vue`
- [ ] Add props: `pub` (Pub | null), `isOpen` (boolean), `isAuthenticated` (boolean)
- [ ] Add emits: `confirm`, `dismiss`, `signIn`
- [ ] Add template structure: Dialog/Card with pub details
- [ ] Display pub image if `imageUrl` is present
- [ ] Display "Image: JD Wetherspoon" attribution if image present
- [ ] Display pub name and address
- [ ] Add "Yes, I'm here" button (visible if authenticated)
- [ ] Add "Sign in to track visits" button (visible if NOT authenticated)
- [ ] Add dismiss/close button (always visible)
- [ ] Add mobile-first styling (bottom sheet or card)
- [ ] Use shadcn/vue components (Dialog, Card, Button)

### 1.6 Integrate Prompt Component in Map View
- [ ] Import ProximityVisitPrompt component in PubLocationsMap.vue
- [ ] Add component to template
- [ ] Bind `:pub="nearbyPub"` prop
- [ ] Bind `:is-open="nearbyPub !== null"` prop
- [ ] Bind `:is-authenticated="isAuthenticated"` prop
- [ ] Handle `@confirm` event: call visit creation logic
- [ ] Handle `@dismiss` event: add pub ID to dismissedPrompts Set
- [ ] Handle `@signIn` event: open login dialog

### 1.7 Visit Creation Handler
- [ ] Create `handleProximityVisitConfirm()` function
- [ ] Get current user UID from `useAuth`
- [ ] Call `addVisit(nearbyPub.id, { visitedAt: new Date().toISOString() }, user.uid)`
- [ ] Handle success: close prompt (set nearbyPub to null)
- [ ] Handle success: call `showPubInfo()` for the visited pub
- [ ] Handle error: display error message in or near prompt
- [ ] Keep prompt open on error for retry

## Phase 2: Testing & Refinement

### 2.1 Unit Testing
- [ ] Test `calculateDistance()` with known coordinates
- [ ] Verify distance calculation accuracy (±1%)
- [ ] Test proximity detection filtering logic
- [ ] Test session storage persistence
- [ ] Test dismissed prompts lookup (Set operations)

### 2.2 Manual Testing - Core Functionality
- [ ] Test: Prompt appears when within 100m of open pub
- [ ] Test: Prompt does NOT appear when >100m from nearest pub
- [ ] Test: Prompt does NOT appear for closed pubs
- [ ] Test: Prompt does NOT appear for already-visited pubs
- [ ] Test: Prompt shows correct pub name and address
- [ ] Test: Prompt shows pub image and attribution (if available)
- [ ] Test: Prompt shows "Yes, I'm here" for authenticated users
- [ ] Test: Prompt shows "Sign in to track visits" for unauthenticated users
- [ ] Test: Clicking "Yes, I'm here" creates visit with current date
- [ ] Test: Info window opens after visit creation
- [ ] Test: Dismissing prompt prevents re-display in same session
- [ ] Test: Dismissal persists across page refresh
- [ ] Test: Dismissal clears after closing and reopening browser

### 2.3 Manual Testing - Edge Cases
- [ ] Test: Multiple pubs nearby → prompt shows closest only
- [ ] Test: User moves from far to near → prompt appears
- [ ] Test: User moves from near to far → prompt disappears
- [ ] Test: Geolocation permission denied → no errors, feature disabled
- [ ] Test: Geolocation timeout → no errors, feature disabled
- [ ] Test: Visit creation fails → error message shown, prompt remains open
- [ ] Test: User logs in while prompt showing → prompt updates to show "Yes" button
- [ ] Test: User logs out while prompt showing → prompt updates to show sign-in link

### 2.4 Performance Testing
- [ ] Measure distance calculation time with 100 pubs
- [ ] Verify calculation completes in <20ms
- [ ] Verify no lag on geolocation position updates
- [ ] Verify map remains responsive during proximity checks
- [ ] Check memory usage (no leaks from geolocation watch)

### 2.5 Accessibility Testing
- [ ] Test keyboard navigation (Tab through buttons)
- [ ] Test Escape key dismisses prompt
- [ ] Test focus management (focus moves to prompt on open)
- [ ] Test screen reader announcements (NVDA/JAWS)
- [ ] Verify ARIA attributes are present and correct
- [ ] Check color contrast ratio (4.5:1 minimum)
- [ ] Test at 200% zoom (text remains readable)

### 2.6 Mobile Testing
- [ ] Test on Chrome mobile (Android)
- [ ] Test on Safari mobile (iOS)
- [ ] Verify prompt is positioned correctly (bottom of screen)
- [ ] Verify prompt is readable on small screens
- [ ] Verify buttons are tappable (minimum 44px touch target)
- [ ] Test geolocation accuracy on mobile devices

## Phase 3: Documentation & Polish

### 3.1 Code Documentation
- [ ] Add JSDoc comments to all new functions
- [ ] Document component props and emits
- [ ] Add inline comments for complex logic (Haversine, filtering)
- [ ] Document session storage keys and structure

### 3.2 OpenSpec Validation
- [ ] Run `npx openspec validate 2025-12-30-add-proximity-visit-prompt --strict`
- [ ] Fix any validation errors
- [ ] Verify all requirements have scenarios
- [ ] Verify all scenarios are testable

### 3.3 TypeScript & Build
- [ ] Run `npm run type-check` and fix errors
- [ ] Ensure build completes successfully
- [ ] No console warnings or errors in dev mode
- [ ] Verify production build works

### 3.4 Code Review Preparation
- [ ] Review code for adherence to project conventions
- [ ] Remove debug console.logs (keep intentional logging only)
- [ ] Ensure consistent code style
- [ ] Check for unused imports and variables
- [ ] Verify all temporary/commented code is removed

## Phase 4: Deployment Preparation

### 4.1 Feature Toggle (Optional)
- [ ] Consider adding feature flag if incremental rollout desired
- [ ] Add environment variable for enabling/disabling feature
- [ ] Test with feature enabled and disabled

### 4.2 Commit Strategy
- [ ] Commit after each task or logical group of tasks
- [ ] Use descriptive commit messages
- [ ] Follow Conventional Commits format
- [ ] Reference issue/PR number in commits

### 4.3 Pull Request
- [ ] Create feature branch from main
- [ ] Push all commits to feature branch
- [ ] Create pull request using template
- [ ] Fill in PR description with summary and testing notes
- [ ] Link to this proposal and spec documents
- [ ] Request code review

## Dependencies
- Phase 1 tasks are sequential within subsections
- Phase 2 depends on Phase 1 completion
- Phase 3 can run in parallel with Phase 2.4-2.6
- Phase 4 depends on all previous phases

## Estimated Timeline
- Phase 1: 4-6 hours
- Phase 2: 2-3 hours
- Phase 3: 1 hour
- Phase 4: 30 minutes
- **Total: 8-11 hours**
