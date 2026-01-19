# Tasks: Refine InfoWindow Layout

**Change ID:** 2026-01-19-refine-infowindow-layout  
**Status:** Draft  
**Created:** 2026-01-19

## Implementation Tasks

### Phase 1: Create Custom Overlay Component

- [x] **Task 1.1**: Create CustomPubOverlay class file
  - Create `Wetherspooning/src/components/CustomPubOverlay.ts`
  - Define class extending `google.maps.OverlayView`
  - Add constructor with callback parameters (onClose, onTrackVisit, onSignIn)
  - Define private properties (position, container, pub, isDark)
  - Add TypeScript interfaces for options and callbacks

- [x] **Task 1.2**: Implement OverlayView lifecycle methods
  - Implement `onAdd()` method to create and append container div
  - Implement `draw()` method to position overlay and render content
  - Implement `onRemove()` method to clean up DOM and event listeners
  - Add z-index and base positioning styles to container

- [x] **Task 1.3**: Implement positioning logic
  - Add position calculation from LatLng to pixel coordinates in `draw()`
  - Add viewport boundary detection logic (left, right, top edges)
  - Add 10px margin enforcement from viewport edges
  - Add 20px vertical offset from marker position
  - Handle cases where overlay extends beyond map boundaries

### Phase 2: Build Overlay Content Generation

- [x] **Task 2.1**: Create content generation method
  - Add `generateContent(pub: Pub, isDark: boolean): string` method
  - Move existing HTML generation from `showPubInfo()` to this method
  - Maintain all existing content: image, name, badges, address, link, button
  - Update container class names for new styling system

- [x] **Task 2.2**: Add close button to content
  - Add close button HTML at top of card with absolute positioning
  - Use X icon SVG or Unicode character
  - Add ARIA label "Close" for accessibility
  - Style button as circular (24px) with semi-transparent background
  - Add hover state styling
  - Position at top: 8px, right: 8px

- [x] **Task 2.3**: Update styling for fixed widths
  - Add responsive width CSS: 400px desktop, 320px mobile, 280px tiny
  - Add `max-width: calc(100vw - 20px)` to all breakpoints
  - Add media queries for breakpoints (450px, 350px)
  - Ensure padding, shadows, and border-radius match existing Card style
  - Update close button styles for light and dark themes

### Phase 3: Add Event Handling

- [x] **Task 3.1**: Implement event listener attachment
  - Add `attachEventListeners()` private method
  - Query close button and attach click handler calling `onClose` callback
  - Query track/sign-in button and attach click handler
  - Determine authenticated state and call appropriate callback

- [x] **Task 3.2**: Implement event listener cleanup
  - Add `cleanupEventListeners()` private method
  - Remove event listeners before hiding or updating overlay
  - Ensure no duplicate listeners accumulate
  - Call cleanup in `hide()` and before content re-render

- [x] **Task 3.3**: Add keyboard event handling
  - Add document-level ESC key listener when overlay is visible
  - Remove ESC listener when overlay is hidden
  - Ensure ESC key calls `onClose` callback
  - Prevent ESC key conflicts with other components

### Phase 4: Implement Public API Methods

- [x] **Task 4.1**: Implement show() method
  - Add `show(pub: Pub, position: google.maps.LatLng, isDark: boolean): void`
  - Store pub, position, and isDark in instance properties
  - Trigger `draw()` to position and render overlay
  - Set container visibility to visible
  - Move focus to close button after rendering

- [x] **Task 4.2**: Implement hide() method
  - Add `hide(): void` method
  - Clean up event listeners
  - Set container visibility to hidden (don't remove from DOM)
  - Clear current pub reference

- [x] **Task 4.3**: Implement update() method
  - Add `update(pub: Pub, isDark: boolean): void` method
  - Update pub and isDark properties
  - Re-render content without changing position
  - Re-attach event listeners

### Phase 5: Integrate with PubLocationsMap

- [x] **Task 5.1**: Import and initialize CustomPubOverlay
  - Import `CustomPubOverlay` in `PubLocationsMap.vue`
  - Replace `infoWindow` ref with `pubOverlay` ref
  - Initialize overlay in `initMap()` with callbacks
  - Set overlay map: `pubOverlay.value.setMap(map.value)`

- [x] **Task 5.2**: Update showPubInfo() function
  - Replace InfoWindow logic with CustomPubOverlay
  - Get marker position and convert to LatLng if needed
  - Call `pubOverlay.value.show(pub, position, isDark.value)`
  - Remove old InfoWindow content generation and setTimeout logic

- [x] **Task 5.3**: Update overlay when theme changes
  - Add watcher for `isDark` value changes
  - When theme changes and overlay is visible, call `update()` with new theme
  - Ensure overlay re-renders with correct theme colors

- [x] **Task 5.4**: Update overlay when visit data changes
  - Update existing visit data watcher
  - When visit data changes and overlay is showing, call `update()` method
  - Ensure badges and rating update without closing overlay

- [x] **Task 5.5**: Update handlePubSelect() function
  - Update marker finding logic (if needed)
  - Update `showPubInfo()` call to use new overlay
  - Remove old InfoWindow references

### Phase 6: Accessibility Enhancements

- [x] **Task 6.1**: Add dialog ARIA attributes
  - Add `role="dialog"` to overlay container
  - Add dynamic `aria-label="Pub information for [pub name]"`
  - Ensure close button has `aria-label="Close"`

- [x] **Task 6.2**: Implement focus management
  - Move focus to close button when overlay opens
  - Store previous focus element before opening
  - Return focus to previous element (or map) when overlay closes
  - Ensure tab order is logical: close → link → button

- [x] **Task 6.3**: Test keyboard navigation
  - Verify Tab navigates through interactive elements
  - Verify Enter/Space activates buttons
  - Verify ESC closes overlay
  - Verify focus indicators are visible
  - Test with screen reader (NVDA or VoiceOver)

### Phase 7: Testing and Refinement

- [x] **Task 7.1**: Test responsive widths
  - Test on mobile viewport: 320px, 375px, 414px
  - Test on tablet viewport: 768px, 1024px
  - Test on desktop viewport: 1280px, 1920px
  - Verify fixed widths apply correctly at each breakpoint
  - Verify max-width prevents viewport overflow

- [x] **Task 7.2**: Test viewport boundary detection
  - Test markers at left edge of map
  - Test markers at right edge of map
  - Test markers at top edge of map
  - Test markers at bottom edge of map (less critical)
  - Verify overlay adjusts position to stay within viewport

- [x] **Task 7.3**: Test overlay positioning on map interactions
  - Test overlay repositions correctly when map pans
  - Test overlay repositions correctly when map zooms in/out
  - Test overlay remains anchored to marker during interactions
  - Test performance of `draw()` calls (should be smooth)

- [x] **Task 7.4**: Test overlay lifecycle
  - Test single overlay instance is reused across marker clicks
  - Test overlay hides/shows efficiently without DOM churn
  - Test event listeners are cleaned up properly
  - Test no memory leaks when opening/closing many times

- [x] **Task 7.5**: Test all content rendering
  - Test pub with all fields (image, badges, link, button)
  - Test pub with missing image
  - Test pub with missing URL
  - Test visited pub with rating and notes
  - Test visited pub with rating but no notes
  - Test unvisited pub
  - Test unauthenticated user view

- [x] **Task 7.6**: Test theme integration
  - Test overlay in light mode
  - Test overlay in dark mode
  - Test theme toggle while overlay is open
  - Verify colors update correctly
  - Verify close button visibility in both themes

- [x] **Task 7.7**: Cross-browser testing
  - Test in Chrome (primary)
  - Test in Firefox
  - Test in Safari (macOS/iOS)
  - Test in Edge
  - Verify no CSS or JavaScript compatibility issues

- [x] **Task 7.8**: Fix any visual or functional issues
  - Address any spacing/alignment issues found in testing
  - Fix any positioning edge cases
  - Adjust colors for better visibility if needed
  - Optimize performance if `draw()` calls cause lag

### Phase 8: Cleanup and Documentation

- [x] **Task 8.1**: Remove old InfoWindow code
  - Remove unused InfoWindow imports
  - Remove InfoWindow initialization code
  - Remove old content generation code (now in CustomPubOverlay)
  - Clean up any commented-out code

- [x] **Task 8.2**: Add code comments
  - Add JSDoc comments to CustomPubOverlay class and methods
  - Document positioning algorithm
  - Document lifecycle management approach
  - Add inline comments for complex logic

- [x] **Task 8.3**: Update any relevant documentation
  - Update README if it mentions InfoWindow implementation
  - Document new CustomPubOverlay component
  - Note any breaking changes (none expected, but document if any)

## Testing Checklist

- [x] Overlay displays at correct position above marker
- [x] Overlay has fixed width: 400px desktop, 320px mobile, 280px very small
- [x] Overlay never exceeds viewport width
- [x] Close button positioned in top-right without blank space
- [x] Close button closes overlay
- [x] ESC key closes overlay
- [x] Track visit button opens PubDetailSheet (authenticated)
- [x] Sign in button opens LoginDialog (unauthenticated)
- [x] All badges render correctly (status, visit, location, rating)
- [x] Notes preview displays when available
- [x] Website link opens in new tab
- [x] Overlay repositions on map pan
- [x] Overlay repositions on map zoom
- [x] Overlay adjusts position near viewport edges
- [x] Theme toggle updates overlay colors
- [x] Visit data updates refresh overlay
- [x] Keyboard navigation works (Tab, Enter, ESC)
- [x] Screen reader announces dialog and content
- [x] Focus management works correctly
- [x] No memory leaks after repeated open/close
- [x] Works on Chrome, Firefox, Safari, Edge
- [x] Works on mobile devices (iOS/Android)

## Validation

- [x] All tasks completed
- [x] All tests passing
- [x] No TypeScript errors
- [x] No console errors or warnings
- [x] Accessibility checklist passed
- [x] Visual review approved
- [x] Code review completed
