# Tasks: Update Proximity Visit Prompt

## Phase 1: Simplify Implementation

### 1.1 Remove ProximityVisitPrompt Component
- [ ] Delete `src/components/ProximityVisitPrompt.vue` file
- [ ] Remove import of ProximityVisitPrompt from PubLocationsMap.vue
- [ ] Remove ProximityVisitPrompt component from template
- [ ] Remove prompt-related event handlers (@confirm, @dismiss, @signIn)

### 1.2 Remove Session Storage Logic
- [ ] Remove `dismissedPrompts` ref and Set
- [ ] Remove `loadDismissedPrompts()` function
- [ ] Remove `saveDismissedPrompts()` function
- [ ] Remove sessionStorage calls
- [ ] Remove `onMounted` call to loadDismissedPrompts

### 1.3 Update Proximity Detection Logic
- [ ] Keep `calculateDistance()` helper function (Haversine formula)
- [ ] Update `checkProximity()` to remove visited and dismissed filtering
- [ ] Simplify to only filter closed pubs
- [ ] Remove `nearbyPub` ref (no longer needed)
- [ ] Add flag to track if proximity check has run: `hasCheckedProximity` (ref)

### 1.4 Remove Continuous Location Tracking
- [ ] Remove `geolocationWatchId` ref
- [ ] Remove `watchPosition()` call
- [ ] Remove `onBeforeUnmount` cleanup for watch
- [ ] Keep single `getCurrentPosition()` call in `centerOnUserLocation()`

### 1.5 Implement Auto-Center and Info Window Display
- [ ] Update `checkProximity()` to return nearby pub (or null)
- [ ] In `centerOnUserLocation()` after getting position:
  - [ ] Call `checkProximity()` once if `hasCheckedProximity` is false
  - [ ] If nearby pub found within 100m:
    - [ ] Call `map.value.panTo()` with pub coordinates
    - [ ] Call `map.value.setZoom(15)` for detail view
    - [ ] Find marker for the nearby pub
    - [ ] Call `showPubInfo(pub, marker)` to open info window
  - [ ] Set `hasCheckedProximity = true` after check

### 1.6 Update `checkProximity()` Function
- [ ] Change function to accept user coordinates as parameters
- [ ] Return the nearby pub object (or null) instead of setting state
- [ ] Filter pubs to only open pubs (exclude closed)
- [ ] Remove filtering for visited pubs
- [ ] Remove filtering for dismissed pubs
- [ ] Calculate distance for each open pub
- [ ] Find minimum distance
- [ ] Return pub if distance <= 100m, otherwise return null

## Phase 2: Testing & Validation

### 2.1 Manual Testing - Core Functionality
- [ ] Test: Map centers on nearby pub when within 100m on page load
- [ ] Test: Info window opens automatically for nearby pub
- [ ] Test: Proximity check only happens once (not on subsequent location changes)
- [ ] Test: No auto-center when >100m from nearest pub
- [ ] Test: No auto-center for closed pubs
- [ ] Test: User can close auto-opened info window
- [ ] Test: Info window shows correct pub details
- [ ] Test: User can interact with other markers after auto-center
- [ ] Test: Visit can be created via info window button

### 2.2 Manual Testing - Edge Cases
- [ ] Test: Multiple pubs nearby → centers on closest only
- [ ] Test: Geolocation permission denied → no errors, map centers on default location
- [ ] Test: Geolocation timeout → no errors, map centers on default location
- [ ] Test: User location exactly 100m from pub → info window opens
- [ ] Test: User location exactly 101m from pub → no auto-center

### 2.3 Performance Testing
- [ ] Measure distance calculation time with 100 pubs
- [ ] Verify calculation completes in <50ms (single check, not critical)
- [ ] Verify no lag during initial page load
- [ ] Verify map remains responsive

### 2.4 TypeScript & Build
- [ ] Run `npm run type-check` and fix errors
- [ ] Ensure build completes successfully
- [ ] No console warnings or errors in dev mode
- [ ] Remove debug console.logs

### 2.5 OpenSpec Validation
- [ ] Run `npx openspec validate 2025-12-30-add-proximity-visit-prompt --strict`
- [ ] Fix any validation errors
- [ ] Verify all requirements have scenarios
- [ ] Verify MODIFIED and REMOVED sections are correct

## Phase 3: Cleanup & Documentation

### 3.1 Code Cleanup
- [ ] Remove all proximity prompt-related code
- [ ] Remove unused imports
- [ ] Remove unused reactive refs
- [ ] Update comments to reflect new behavior
- [ ] Ensure consistent code style

### 3.2 Documentation
- [ ] Update JSDoc comments for modified functions
- [ ] Document that proximity check happens only once
- [ ] Add inline comments for auto-center logic
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
