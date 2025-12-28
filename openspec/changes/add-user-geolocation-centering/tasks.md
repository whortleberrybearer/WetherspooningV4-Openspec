# Tasks: Add User Geolocation Centering

## Phase 1: Implementation

### 1.1 Add Geolocation Helper Function
- [ ] Create `centerOnUserLocation()` function in PubLocationsMap.vue
- [ ] Check for geolocation support using `'geolocation' in navigator`
- [ ] Call `navigator.geolocation.getCurrentPosition()` with success/error callbacks
- [ ] Set geolocation options:
  - `enableHighAccuracy: false` (faster response, sufficient accuracy)
  - `timeout: 5000` (5 second timeout)
  - `maximumAge: 300000` (accept cached position up to 5 minutes old)
- [ ] On success: call `map.setCenter()` with user coordinates
- [ ] On success: call `map.setZoom(12)` for neighborhood-level view
- [ ] On success: log to console for debugging
- [ ] On error: log warning to console
- [ ] On error: do nothing (map stays at default center)
- [ ] On no support: log warning to console

### 1.2 Integrate with Map Initialization
- [ ] Call `centerOnUserLocation()` after map creation in `initMap()`
- [ ] Ensure function is called after `map.value` is set
- [ ] Verify no await/blocking behavior (keep async)

### 1.3 Code Quality
- [ ] Add JSDoc comment explaining function behavior
- [ ] Add inline comment about fallback behavior
- [ ] Ensure TypeScript types are correct
- [ ] No console.error() - use console.warn() for permission denials

## Phase 2: Testing

### 2.1 Manual Testing - Permission Scenarios
- [ ] Test: Grant geolocation permission → map centers on user location
- [ ] Test: Deny geolocation permission → map stays at default center
- [ ] Test: Dismiss permission prompt → map stays at default center
- [ ] Test: Block geolocation in browser settings → map stays at default center
- [ ] Verify: No error messages shown to user in any scenario
- [ ] Verify: Console logs appear for debugging

### 2.2 Manual Testing - Functional Behavior
- [ ] Test: Map centers smoothly (animated pan) when location acquired
- [ ] Test: Zoom level is 12 when centered on user location
- [ ] Test: Default zoom (6) when staying at default center
- [ ] Test: Pub markers load correctly after geolocation completes
- [ ] Test: Sidebar remains functional during/after geolocation
- [ ] Test: Info windows work after map recenters

### 2.3 Manual Testing - Edge Cases
- [ ] Test: User location outside UK → map centers on user's location
- [ ] Test: User location near edge of pub coverage → pubs still visible
- [ ] Test: Slow geolocation (simulated) → timeout after 5 seconds
- [ ] Test: Refresh page after granting permission → map centers immediately
- [ ] Test: Refresh page after denying permission → no second prompt

### 2.4 Browser Compatibility
- [ ] Test: Chrome desktop (geolocation supported)
- [ ] Test: Firefox desktop (geolocation supported)
- [ ] Test: Safari desktop (geolocation supported)
- [ ] Test: Chrome mobile (geolocation supported, more accurate)
- [ ] Test: Safari mobile (geolocation supported)
- [ ] Verify: HTTPS required for geolocation (development uses localhost exception)

### 2.5 Performance Testing
- [ ] Verify: Map renders immediately (no waiting for geolocation)
- [ ] Verify: Page load time unaffected
- [ ] Verify: Geolocation request completes in < 2 seconds (typical)
- [ ] Verify: Timeout prevents hanging after 5 seconds

## Phase 3: Documentation & Validation

### 3.1 Code Documentation
- [ ] Add JSDoc comment to `centerOnUserLocation()` function
- [ ] Document geolocation options in inline comments
- [ ] Add comment explaining fallback behavior

### 3.2 OpenSpec Validation
- [ ] Run `npx openspec validate add-user-geolocation-centering --strict`
- [ ] Fix any validation errors
- [ ] Verify spec delta is correct

### 3.3 TypeScript & Build
- [ ] Run `npm run type-check` and fix any errors
- [ ] Build completes successfully
- [ ] No console errors in development mode

## Phase 4: Archive & PR

### 4.1 Commit & Archive
- [ ] Commit implementation changes
- [ ] Run `npx openspec archive add-user-geolocation-centering --yes`
- [ ] Verify specs updated correctly

### 4.2 Pull Request
- [ ] Create PR with conventional commit title
- [ ] Fill out PR template
- [ ] Include testing details in PR description
- [ ] Note browser compatibility in PR

## Notes
- This is a progressive enhancement - existing default center remains as reliable fallback
- No breaking changes to existing functionality
- No UI changes except map centering behavior
- No external dependencies required
