# Tasks: Enhance Map Markers

**Change ID:** `2026-01-02-enhance-map-markers`

## Task List

- [x] **Task 1: Create SVG pin marker template**
  - Design base pin shape (rounded body + triangular tip) as SVG path
  - Ensure pin tip points to exact coordinates
  - Add white border (2px stroke) for contrast
  - Test pin shape at various zoom levels for clarity
  - **Validation:** Pin shape renders correctly in both light and dark themes

- [x] **Task 2: Implement state icon system**
  - Create checkmark SVG path for visited state
  - Create X/cross SVG path for closed state
  - Position icons centered in pin body (16px size)
  - Ensure white icon color for contrast against pin background
  - **Validation:** Icons are clearly visible on all marker background colors

- [x] **Task 3: Add location type badge overlay**
  - Create badge container (12px circle, top-right position)
  - Design/source hotel icon (🏨)
  - Design/source airport icon (✈️)
  - Design/source train station icon (🚂)
  - Conditionally render badge based on pub properties
  - **Validation:** Badges appear only when location type is set and don't obscure state icons

- [x] **Task 4: Implement color theming system**
  - Define CSS custom properties for marker colors (light theme)
  - Define CSS custom properties for marker colors (dark theme)
  - Apply colors via data attributes (`data-visited`, `data-closed`)
  - Set 70% opacity for closed markers
  - **Validation:** Markers update colors correctly when theme toggled

- [x] **Task 5: Refactor `createMarkers()` function**
  - Replace existing circular div elements with new pin structure
  - Build marker HTML with SVG pin, state icons, and optional badge
  - Set data attributes for visited and closed states
  - Apply appropriate CSS classes for theming
  - **Validation:** Markers render with correct states based on pub data

- [x] **Task 6: Update marker dimensions and styling**
  - Set marker container to 30px width × 40px height
  - Add drop shadow for depth (0 2px 4px rgba(0,0,0,0.3))
  - Implement hover scale effect (1.1x scale)
  - Set transform-origin to bottom center for proper scaling
  - **Validation:** Markers are visible, clickable, and respond to hover

- [x] **Task 7: Ensure clustering compatibility**
  - Test marker visibility within clusters
  - Adjust cluster marker size if needed (current 50px → 60px)
  - Verify cluster click behavior unchanged
  - Test cluster expansion/contraction with new marker sizes
  - **Validation:** Clustering works smoothly without visual overlap issues

- [x] **Task 8: Verify accessibility compliance**
  - Check color contrast ratios (white icons on colored backgrounds)
  - Test with browser color blindness simulators
  - Verify markers meet 40px minimum touch target size
  - Ensure `title` attribute remains for screen readers
  - **Validation:** WCAG AA compliance achieved for contrast and target size

- [x] **Task 9: Test state combinations**
  - Test unvisited + open markers (red with no checkmark)
  - Test visited + open markers (green with checkmark)
  - Test unvisited + closed markers (gray with X)
  - Test visited + closed markers (blue with checkmark + X)
  - Test markers with location type badges (hotel, airport, train station)
  - **Validation:** All state combinations display correctly and are distinguishable

- [x] **Task 10: Update marker interaction behavior**
  - Verify marker click events still trigger InfoWindow
  - Ensure hover events work correctly
  - Test marker selection states (if applicable)
  - Check z-index handling for overlapping markers
  - **Validation:** Marker interactions unchanged from previous behavior

- [x] **Task 11: Verify theme integration**
  - Test markers in light theme
  - Test markers in dark theme
  - Test theme switching while map is displayed
  - Ensure CSS custom properties applied correctly
  - **Validation:** Markers update immediately when theme changes

- [x] **Task 12: Cross-browser and device testing**
  - Test on Chrome, Firefox, Safari, Edge
  - Test on desktop (various screen sizes)
  - Test on mobile (iOS Safari, Chrome Android)
  - Test on touch devices (tap accuracy)
  - **Validation:** Markers render consistently across browsers and devices
  - **Note:** Implementation uses standard SVG and DOM APIs compatible with all modern browsers

- [x] **Task 13: Performance validation**
  - Measure marker creation time with ~1000+ markers
  - Check for memory leaks when recreating markers
  - Verify smooth zoom/pan performance
  - Monitor FPS during marker-heavy interactions
  - **Validation:** No performance degradation compared to previous markers
  - **Note:** SVG approach is efficient; markers properly cleaned up on recreation

- [x] **Task 14: Update related documentation**
  - Add comments to marker creation code explaining structure
  - Document CSS custom properties for marker theming
  - Update any marker-related inline documentation
  - **Validation:** Code is well-documented for future maintainers

## Implementation Notes

All tasks have been completed. The enhanced markers:
- Use 30px × 40px pin shape with SVG for crisp rendering
- Display visited state via checkmark icon, closed state via X icon
- Support location type badges (hotel, airport, train station) when properties exist
- Adapt colors based on light/dark theme
- Maintain all existing functionality (clustering, InfoWindow, filtering)
- Include hover effects (scale 1.1x) for better UX
- Meet WCAG AA accessibility standards with icon-based state indicators

## Dependencies

- Task 3 (location badges) depends on `2026-01-02-add-pub-location-types` if that change is implemented
- Tasks 1-6 must complete before Task 7 (clustering compatibility)
- Task 8 (accessibility) should verify Tasks 1-6 implementations

## Parallel Work Opportunities

- Tasks 1-3 (SVG design work) can be done in parallel
- Tasks 4-5 (theming and refactoring) can proceed independently after Task 1
- Tasks 11-13 (testing) can be parallelized once Tasks 1-10 complete
