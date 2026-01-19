# Spec Delta: enhanced-infowindow-display

**Change ID:** 2026-01-19-refine-infowindow-layout  
**Capability:** enhanced-infowindow-display

## Overview

This delta refines the InfoWindow display implementation by replacing Google's standard InfoWindow with a custom overlay that provides better control over layout, consistent sizing, and improved mobile responsiveness.

---

## MODIFIED Requirements

### Requirement: InfoWindow Card-Style Layout (REQ-EID-001)
**Priority:** MUST
**Category:** UI/UX

**Changes:**
- MODIFY: Implementation from Google Maps InfoWindow to custom OverlayView
- ADD: Fixed consistent width constraints
- ADD: Improved close button positioning
- ADD: Viewport boundary detection

The pub information display must use a custom overlay implementation (extending `google.maps.OverlayView`) with a Card-based visual structure that has consistent fixed width, proper close button positioning without excessive spacing, and responsive behavior that adapts to viewport size.

**Updated Acceptance Criteria:**
- **MODIFIED:** Overlay content uses custom OverlayView instead of standard InfoWindow
- Overlay content uses white background with rounded corners (existing)
- Content has consistent padding (12-16px) (existing)
- Container has subtle shadow for depth (existing)
- Typography uses system font stack with proper size hierarchy (existing)
- Layout is clean and visually similar to ProximityVisitPrompt Card (existing)
- Content is structured vertically: image → name → details → button (existing)
- **NEW:** Overlay has fixed width: 400px on desktop, 320px on mobile (<450px), 280px on very small screens (<350px)
- **NEW:** Overlay max-width is always `calc(100vw - 20px)` to prevent viewport overflow
- **NEW:** Close button positioned absolutely in top-right corner (8px from edges)
- **NEW:** Close button does not create blank space above content
- **NEW:** Close button is circular (24px diameter) with subtle background
- **NEW:** Overlay repositions if it would extend beyond viewport boundaries (10px margin)

#### Scenario: InfoWindow Displays with Fixed Width on Desktop
**MODIFIED:**
**Given** a user clicks on a pub marker on desktop (screen width >= 450px)
**When** the custom overlay opens
**Then** the overlay displays with 400px fixed width
**And** the overlay has white background and rounded corners
**And** the overlay has max-width of `calc(100vw - 20px)`
**And** the layout matches Card component design patterns
**And** the close button appears in top-right corner without creating blank space

#### Scenario: InfoWindow Displays with Responsive Width on Mobile
**NEW:**
**Given** a user clicks on a pub marker on mobile (screen width < 450px)
**When** the custom overlay opens
**Then** the overlay displays with 320px fixed width
**And** the overlay never exceeds viewport width (max-width: calc(100vw - 20px))
**And** content remains fully visible and readable
**And** the close button appears in top-right corner without creating blank space

#### Scenario: InfoWindow Displays on Very Small Screens
**NEW:**
**Given** a user clicks on a pub marker on very small screen (screen width < 350px)
**When** the custom overlay opens
**Then** the overlay displays with 280px fixed width
**And** the overlay never exceeds viewport width (max-width: calc(100vw - 20px))
**And** content remains fully visible and readable

#### Scenario: Close Button Positioned Without Blank Space
**NEW:**
**Given** a user clicks on a pub marker
**When** the custom overlay opens
**Then** the close button is positioned absolutely in the top-right corner
**And** the button is 8px from the top edge and 8px from the right edge
**And** the button is circular with 24px diameter
**And** the button has subtle semi-transparent background
**And** the button does not create blank space above the pub name or image
**And** the button overlays the content with proper z-index

#### Scenario: Overlay Repositions to Stay Within Viewport
**NEW:**
**Given** a user clicks on a pub marker near the edge of the screen
**When** the custom overlay opens
**And** the overlay would extend beyond the left viewport boundary
**Then** the overlay adjusts its position to maintain 10px margin from left edge
**And** the overlay remains fully visible within viewport

**NEW:**
**Given** a user clicks on a pub marker near the right edge of the screen
**When** the custom overlay opens
**And** the overlay would extend beyond the right viewport boundary
**Then** the overlay adjusts its position to maintain 10px margin from right edge
**And** the overlay remains fully visible within viewport

**NEW:**
**Given** a user clicks on a pub marker near the top edge of the screen
**When** the custom overlay opens
**And** the overlay would extend beyond the top viewport boundary
**Then** the overlay adjusts its position to maintain 10px margin from top edge
**And** the overlay remains fully visible within viewport

---

### Requirement: Responsive InfoWindow Layout (REQ-EID-007)
**Priority:** MUST
**Category:** UI/UX

**Changes:**
- MODIFY: Width constraints to use fixed responsive widths instead of min/max only
- REMOVE: Minimum width of 250px (replaced with fixed breakpoint widths)
- MODIFY: Maximum width constraints with viewport-aware calculations

**Original:**
The InfoWindow content must be mobile-friendly with appropriate width constraints, responsive text sizing, and proper spacing that works well on both mobile and desktop screens.

**Updated:**
The custom overlay content must use fixed responsive widths with viewport-aware constraints to ensure consistent sizing across devices while preventing overflow on narrow screens.

**Updated Acceptance Criteria:**
- **MODIFIED:** Overlay fixed width is 400px on desktop (>= 450px viewport)
- **MODIFIED:** Overlay fixed width is 320px on mobile (< 450px viewport)
- **NEW:** Overlay fixed width is 280px on very small screens (< 350px viewport)
- **MODIFIED:** Overlay max-width is always `calc(100vw - 20px)` to prevent viewport overflow
- Text sizing remains readable on small screens (minimum 14px for body) (existing)
- Padding and spacing scale appropriately for screen size (existing)
- Images maintain aspect ratio and don't overflow container (existing)
- Touch targets for buttons meet minimum 44px height requirement (existing)

#### Scenario: Mobile Screen Display with Fixed Width
**MODIFIED:**
**Given** user views map on mobile device (screen width < 450px and >= 350px)
**When** the custom overlay opens
**Then** overlay has fixed width of 320px
**And** overlay max-width is `calc(100vw - 20px)`
**And** text remains readable at 14px minimum
**And** button height meets 44px minimum for touch targets
**And** images don't overflow container

#### Scenario: Very Small Screen Display
**NEW:**
**Given** user views map on very small device (screen width < 350px)
**When** the custom overlay opens
**Then** overlay has fixed width of 280px
**And** overlay max-width is `calc(100vw - 20px)`
**And** all content remains readable and properly formatted
**And** touch targets remain accessible

#### Scenario: Desktop Screen Display with Fixed Width
**MODIFIED:**
**Given** user views map on desktop device (screen width >= 450px)
**When** the custom overlay opens
**Then** overlay has fixed width of 400px
**And** layout remains visually balanced
**And** all content is easily readable

---

### Requirement: InfoWindow Accessibility (REQ-EID-008)
**Priority:** MUST
**Category:** Accessibility

**Changes:**
- ADD: Dialog role and ARIA attributes for custom overlay
- ADD: Keyboard close functionality (ESC key)
- ADD: Focus management when opening/closing
- ADD: Close button accessibility improvements

The custom overlay must follow accessibility best practices including proper semantic HTML, dialog role with ARIA attributes, keyboard navigation support including ESC key to close, focus management, and sufficient color contrast.

**Updated Acceptance Criteria:**
- Heading uses proper semantic HTML (h3 or similar) (existing)
- External link includes ARIA label or title for screen readers (existing)
- Button has accessible label and focus indication (existing)
- Color contrast meets WCAG AA standards (4.5:1 for text) (existing)
- Interactive elements are keyboard accessible (existing)
- Focus order follows logical reading order (existing)
- **NEW:** Overlay container has `role="dialog"` attribute
- **NEW:** Overlay container has `aria-label` describing content (e.g., "Pub information for [pub name]")
- **NEW:** Close button has `aria-label="Close"` attribute
- **NEW:** ESC key closes the overlay when it has focus
- **NEW:** Opening overlay moves focus to close button or first focusable element
- **NEW:** Closing overlay returns focus to map or triggering marker (when feasible)

#### Scenario: Screen Reader Access with Dialog Role
**MODIFIED:**
**Given** user navigates with screen reader
**When** the custom overlay opens
**Then** overlay is announced as a dialog
**And** pub name is announced as heading
**And** aria-label describes the overlay purpose
**And** badges provide meaningful text content
**And** link provides clear destination information
**And** close button has clear "Close" label
**And** action button has clear action description

#### Scenario: Keyboard Navigation and ESC Key
**MODIFIED:**
**Given** user navigates with keyboard only
**When** the custom overlay opens
**Then** focus moves to close button or first focusable element
**And** link, buttons are focusable with Tab key
**And** focused elements show visible focus indicator
**And** Enter or Space key activates buttons
**And** ESC key closes the overlay
**And** focus order follows logical sequence: close → link → action button
**And** closing overlay returns focus appropriately

#### Scenario: Focus Management on Close
**NEW:**
**Given** the custom overlay is open
**And** user has interacted with overlay elements
**When** user closes the overlay (via close button or ESC)
**Then** overlay is removed from view
**And** focus returns to a logical element (map or marker)
**And** keyboard navigation continues normally

---

## ADDED Requirements

### Requirement: Custom Overlay Positioning (REQ-EID-009)
**Priority:** MUST
**Category:** Technical

The custom overlay must position itself correctly relative to the map marker, reposition when the map view changes (pan/zoom), and adjust position to stay within viewport boundaries.

**Acceptance Criteria:**
- Overlay extends `google.maps.OverlayView` class
- Overlay is added to map's overlay layer
- Overlay position is calculated from marker's LatLng coordinates
- Overlay repositions when map pans or zooms
- Overlay adjusts position if it would extend beyond viewport edges (10px margin)
- Overlay is centered horizontally above marker (with pointer/gap offset)
- Overlay vertical position accounts for overlay height and marker position
- Overlay z-index is higher than map elements but lower than modals/dialogs

#### Scenario: Overlay Positions Above Marker
**Given** a user clicks on a pub marker
**When** the custom overlay opens
**Then** the overlay is positioned above the marker
**And** the overlay is horizontally centered on the marker
**And** there is a 20px gap between overlay bottom and marker top
**And** the overlay remains anchored to the marker's geographic position

#### Scenario: Overlay Repositions on Map Pan
**Given** the custom overlay is open
**When** user pans the map
**Then** the overlay repositions to maintain its position relative to the marker
**And** the overlay remains visible and properly positioned

#### Scenario: Overlay Repositions on Map Zoom
**Given** the custom overlay is open
**When** user zooms the map in or out
**Then** the overlay repositions to maintain its position relative to the marker
**And** the overlay remains visible and properly sized

#### Scenario: Overlay Updates Content Independently of Repositioning
**Given** the custom overlay is open
**When** the map view changes (pan/zoom)
**Then** the overlay repositions without re-rendering content
**And** content updates only when pub data changes
**And** performance remains smooth during map interactions

---

### Requirement: Custom Overlay Lifecycle Management (REQ-EID-010)
**Priority:** MUST
**Category:** Technical

The custom overlay must properly manage its lifecycle including creation, display, updates, hiding, and cleanup to prevent memory leaks and ensure proper behavior.

**Acceptance Criteria:**
- Single overlay instance is created and reused for all pub markers
- Overlay is initialized when map is ready
- Overlay is added to map once and remains attached
- Overlay shows/hides by updating DOM visibility, not by adding/removing from map
- Event listeners are attached when overlay is shown
- Event listeners are cleaned up when overlay is hidden or destroyed
- Overlay content is updated when pub data changes
- Overlay properly cleans up when component is unmounted

#### Scenario: Single Overlay Instance Reused
**Given** the map is initialized
**When** user clicks multiple different pub markers
**Then** the same overlay instance is reused for all markers
**And** only the overlay content and position update
**And** no duplicate overlays are created

#### Scenario: Overlay Shows and Hides Efficiently
**Given** the custom overlay is attached to the map
**When** user clicks a pub marker
**Then** the overlay becomes visible by updating display/opacity
**And** the overlay does not get re-added to the map
**When** user closes the overlay
**Then** the overlay becomes hidden by updating display/opacity
**And** the overlay does not get removed from the map

#### Scenario: Event Listeners Cleaned Up
**Given** the custom overlay is showing with event listeners attached
**When** the overlay is hidden or new pub data is shown
**Then** previous event listeners are removed
**And** new event listeners are attached for the new content
**And** no duplicate event listeners exist

#### Scenario: Overlay Cleanup on Component Unmount
**Given** the custom overlay is active on the map
**When** the PubLocationsMap component is unmounted
**Then** the overlay is properly removed from the map
**And** all event listeners are cleaned up
**And** overlay DOM elements are removed
**And** no memory leaks occur

---

## REMOVED Requirements

None. All existing requirements remain valid with modifications noted above.

---

## Summary of Changes

**Modified Requirements:**
- REQ-EID-001: Updated to use custom OverlayView with fixed widths and improved close button
- REQ-EID-007: Updated responsive layout with fixed breakpoint widths
- REQ-EID-008: Enhanced accessibility with dialog role, ESC key, and focus management

**Added Requirements:**
- REQ-EID-009: Custom overlay positioning and viewport boundary detection
- REQ-EID-010: Custom overlay lifecycle management and cleanup

**Removed Requirements:**
- None

**Impact:**
This change maintains all existing functional requirements while significantly improving the layout, consistency, and mobile responsiveness of the pub information display through a custom overlay implementation.
