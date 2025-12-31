# Tasks: Update Proximity Visit Prompt

## Phase 1: Simplify Implementation

### 1.1 Remove ProximityVisitPrompt Component
- [x] Delete `src/components/ProximityVisitPrompt.vue` file
- [x] Remove import of ProximityVisitPrompt from PubLocationsMap.vue
- [x] Remove ProximityVisitPrompt component from template
- [x] Remove prompt-related event handlers (@confirm, @dismiss, @signIn)

### 1.2 Remove Session Storage Logic
- [x] Remove `dismissedPrompts` ref and Set
- [x] Remove `loadDismissedPrompts()` function
- [x] Remove `saveDismissedPrompts()` function
- [x] Remove sessionStorage calls
- [x] Remove `onMounted` call to loadDismissedPrompts

### 1.3 Update Proximity Detection Logic
- [x] Keep `calculateDistance()` helper function (Haversine formula)
- [x] Update `checkProximity()` to remove visited and dismissed filtering
- [x] Simplify to only filter closed pubs
- [x] Remove `nearbyPub` ref (no longer needed)
- [x] Add flag to track if proximity check has run: `hasCheckedProximity` (ref)

### 1.4 Remove Continuous Location Tracking
- [x] Remove `geolocationWatchId` ref
- [x] Remove `watchPosition()` call
- [x] Remove `onBeforeUnmount` cleanup for watch
- [x] Keep single `getCurrentPosition()` call in `centerOnUserLocation()`

### 1.5 Implement Auto-Center and Info Window Display
- [x] Update `checkProximity()` to return nearby pub (or null)
- [x] In `centerOnUserLocation()` after getting position:
  - [x] Call `checkProximity()` once if `hasCheckedProximity` is false
  - [x] If nearby pub found within 100m:
    - [x] Call `map.value.panTo()` with pub coordinates
    - [x] Call `map.value.setZoom(15)` for detail view
    - [x] Find marker for the nearby pub
    - [x] Call `showPubInfo(pub, marker)` to open info window
  - [x] Set `hasCheckedProximity = true` after check

### 1.6 Update `checkProximity()` Function
- [x] Change function to accept user coordinates as parameters
- [x] Return the nearby pub object (or null) instead of setting state
- [x] Filter pubs to only open pubs (exclude closed)
- [x] Remove filtering for visited pubs
- [x] Remove filtering for dismissed pubs
- [x] Calculate distance for each open pub
- [x] Find minimum distance
- [x] Return pub if distance <= 100m, otherwise return null

## Phase 2: Testing & Validation

### 2.1 Manual Testing - Core Functionality
- [x] Test: Map centers on nearby pub when within 100m on page load
- [x] Test: Info window opens automatically for nearby pub
- [x] Test: Proximity check only happens once (not on subsequent location changes)
- [x] Test: No auto-center when >100m from nearest pub
- [x] Test: No auto-center for closed pubs
- [x] Test: User can close auto-opened info window
- [x] Test: Info window shows correct pub details
- [x] Test: User can interact with other markers after auto-center
- [x] Test: Visit can be created via info window button

### 2.2 Manual Testing - Edge Cases
- [x] Test: Multiple pubs nearby → centers on closest only
- [x] Test: Geolocation permission denied → no errors, map centers on default location
- [x] Test: Geolocation timeout → no errors, map centers on default location
- [x] Test: User location exactly 100m from pub → info window opens
- [x] Test: User location exactly 101m from pub → no auto-center

### 2.3 Performance Testing
- [x] Measure distance calculation time with 100 pubs
- [x] Verify calculation completes in <50ms (single check, not critical)
- [x] Verify no lag during initial page load
- [x] Verify map remains responsive

### 2.4 TypeScript & Build
- [x] Run `npm run type-check` and fix errors
- [x] Ensure build completes successfully
- [x] No console warnings or errors in dev mode
- [x] Remove debug console.logs

### 2.5 OpenSpec Validation
- [x] Run `npx openspec validate 2025-12-30-add-proximity-visit-prompt --strict`
- [x] Fix any validation errors
- [x] Verify all requirements have scenarios
- [x] Verify MODIFIED and REMOVED sections are correct

## Phase 3: Cleanup & Documentation

### 3.1 Code Cleanup
- [x] Remove all proximity prompt-related code
- [x] Remove unused imports
- [x] Remove unused reactive refs
- [x] Update comments to reflect new behavior
- [x] Ensure consistent code style

### 3.2 Documentation
- [x] Update JSDoc comments for modified functions
- [x] Document that proximity check happens only once
- [x] Add inline comments for auto-center logic
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
