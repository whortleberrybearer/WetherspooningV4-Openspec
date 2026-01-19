# enhanced-infowindow-display Specification

## Purpose
TBD - created by archiving change 2025-12-31-enhance-infowindow-display. Update Purpose after archive.
## Requirements
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

### Requirement: Pub Image Display (REQ-EID-002)
**Priority:** MUST  
**Category:** UI/UX

When a pub has an imageUrl property, the InfoWindow must display the image at the top of the content with rounded corners, proper object-fit to maintain aspect ratio, and conditional attribution text for images hosted on jdwetherspoon.com.

**Acceptance Criteria:**
- Image displays at full width within InfoWindow container
- Image has rounded corners (8px border-radius)
- Image uses object-fit: cover to maintain aspect ratio
- Image height is constrained to reasonable maximum (e.g., 200px)
- Attribution text "Image © JD Wetherspoon" displays only for jdwetherspoon.com URLs
- Attribution text uses small font size (10-12px) and muted color
- If no imageUrl exists, image section is omitted entirely

#### Scenario: Display Image with Attribution
**Given** a pub has an imageUrl from jdwetherspoon.com  
**When** the InfoWindow opens  
**Then** the pub image displays at the top with rounded corners  
**And** image maintains proper aspect ratio with object-fit: cover  
**And** image height is constrained to maximum 200px  
**And** attribution text "Image © JD Wetherspoon" displays below image  
**And** attribution text uses small muted styling

#### Scenario: Display Image without Attribution
**Given** a pub has an imageUrl from external source (not jdwetherspoon.com)  
**When** the InfoWindow opens  
**Then** the pub image displays at the top with rounded corners  
**And** no attribution text is shown

#### Scenario: No Image Available
**Given** a pub has no imageUrl property  
**When** the InfoWindow opens  
**Then** no image section is displayed  
**And** content begins with pub name

### Requirement: Pub Name and Address Display (REQ-EID-003)
**Priority:** MUST  
**Category:** UI/UX

The InfoWindow must display the pub name as a prominent title using heading-level typography, followed by the full address formatted with proper line breaks for optimal readability.

**Acceptance Criteria:**
- Pub name displays as heading with semibold weight (600)
- Name font size is larger than body text (16-18px)
- Address displays below name with proper spacing
- Address uses readable font size (14px)
- Address text uses muted color for visual hierarchy
- Full address is shown without truncation

#### Scenario: Display Pub Name and Address
**Given** a user clicks on a pub marker  
**When** the InfoWindow opens  
**Then** the pub name displays as prominent heading with semibold weight  
**And** name font size is 16-18px  
**And** full address displays below name with 14px font size  
**And** address uses muted text color for hierarchy

### Requirement: Status and Visit Badges (REQ-EID-004)
**Priority:** MUST  
**Category:** UI/UX

**Changes:**
- MODIFY: Visited badge to include rating stars when available
- ADD: Notes preview display below badges when notes exist

The InfoWindow must display status badges (Open/Closed) and visit badges (Visited with date/rating) for authenticated users.

**Updated Acceptance Criteria:**
- Status badge (Open/Closed) displays based on `openState` field
- Open badge has green background (#34a853), Closed has red (#ea4335)
- For authenticated users, visited badge displays if pub is visited
- **MODIFIED:** Visited badge includes rating stars when rating exists
- **MODIFIED:** Badge format with rating: "✓ Visited DD/MM/YY ★★★★☆" (example 4 stars)
- **MODIFIED:** Badge format without date but with rating: "✓ Visited ★★★★☆"
- Badge format without rating: "✓ Visited DD/MM/YY" or "✓ Visited"
- **NEW:** Rating displays as filled (★) and empty (☆) stars (1-5 total)
- Badges display horizontally with gap spacing (8px)
- Badge text uses small font size (12px) and semibold weight
- **NEW:** Notes preview displays below badges if notes exist
- **NEW:** Notes preview shows first 100 characters with ellipsis if longer
- **NEW:** Notes preview uses muted text color and smaller font (11-12px)
- **NEW:** Notes preview has subtle background or border for separation

#### Scenario: Display Visited Badge with Date and Rating
**MODIFIED:**
**Given** user is authenticated  
**And** user visited the pub on "2025-12-25"  
**And** the visit has rating 4  
**When** the InfoWindow opens  
**Then** a "✓ Visited 25/12/25 ★★★★☆" badge displays with green background  
**And** 4 filled stars and 1 empty star are shown  
**And** badge appears next to status badge with proper spacing

#### Scenario: Display Visited Badge with Rating Only
**ADDED:**
**Given** user is authenticated  
**And** user visited the pub but no date is recorded  
**And** the visit has rating 5  
**When** the InfoWindow opens  
**Then** a "✓ Visited ★★★★★" badge displays with green background  
**And** all 5 stars are filled  
**And** no date is shown

#### Scenario: Display Visited Badge Without Rating
**Given** user is authenticated  
**And** user visited the pub on "2025-11-10"  
**And** the visit has no rating  
**When** the InfoWindow opens  
**Then** a "✓ Visited 10/11/25" badge displays with green background  
**And** no stars are shown (existing behavior)

#### Scenario: Display Notes Preview
**ADDED:**
**Given** user is authenticated  
**And** user visited the pub  
**And** the visit has notes "Great atmosphere, friendly staff, excellent beer selection"  
**When** the InfoWindow opens  
**Then** the visited badge displays  
**And** a notes preview displays below the badges  
**And** the preview shows "Great atmosphere, friendly staff, excellent beer selection"  
**And** the preview uses muted text color  
**And** the preview has subtle background or border

#### Scenario: Display Truncated Notes Preview
**ADDED:**
**Given** user is authenticated  
**And** user visited the pub  
**And** the visit has notes longer than 100 characters  
**When** the InfoWindow opens  
**Then** the notes preview displays first 100 characters  
**And** the preview ends with "..." ellipsis  
**And** full notes can be viewed by opening PubDetailSheet

#### Scenario: No Notes Preview When Notes Empty
**ADDED:**
**Given** user is authenticated  
**And** user visited the pub  
**And** the visit has no notes  
**When** the InfoWindow opens  
**Then** the visited badge displays  
**And** no notes preview is shown  
**And** content flows directly to website link or button

#### Scenario: No Rating or Notes for Unauthenticated User
**ADDED:**
**Given** user is not authenticated  
**When** the InfoWindow opens  
**Then** only the status badge displays  
**And** no visited badge appears  
**And** no rating is shown  
**And** no notes preview is shown

---

### Requirement: Wetherspoons Website Link (REQ-EID-005)
**Priority:** MUST  
**Category:** Functional

When a pub has a url property, the InfoWindow must display a "View on Wetherspoons website" link that opens the URL in a new tab with proper security attributes to prevent security vulnerabilities.

**Acceptance Criteria:**
- Link displays when pub.url property exists
- Link text is "View on Wetherspoons website"
- Link opens in new tab (target="_blank")
- Link includes rel="noopener noreferrer" for security
- Link uses primary color and underlines on hover
- Link font size matches body text (14px)
- Link is omitted entirely if pub.url is missing

#### Scenario: Display Website Link
**Given** a pub has a url property  
**When** the InfoWindow opens  
**Then** a "View on Wetherspoons website" link displays  
**And** link points to the pub's url  
**And** link opens in new tab with target="_blank"  
**And** link includes rel="noopener noreferrer" attributes  
**And** link uses primary text color and underlines on hover

#### Scenario: No Website Link
**Given** a pub has no url property  
**When** the InfoWindow opens  
**Then** no website link is displayed  
**And** content flows directly from badges to action button

### Requirement: Authentication-Aware Action Button (REQ-EID-006)
**Priority:** MUST  
**Category:** Functional

The InfoWindow must display different action buttons based on user authentication state and visit status, with each button triggering the appropriate action (opening PubDetailSheet or LoginDialog).

**Acceptance Criteria:**
- Button displays at full width within InfoWindow
- Button uses primary background color and proper padding/height
- Button text is "Visit" when user is authenticated and pub not visited
- Button text is "Update Visit" when user is authenticated and pub is visited
- Button text is "Sign in to track visit" when user is not authenticated
- "Visit"/"Update Visit" button opens PubDetailSheet when clicked
- "Sign in to track visit" button opens LoginDialog when clicked
- Button maintains hover and focus states for accessibility
- Button ID includes pub ID to enable dynamic event listener attachment

#### Scenario: Show Visit Button for Authenticated Unvisited Pub
**Given** user is authenticated  
**And** user has not visited the pub  
**When** the InfoWindow opens  
**Then** a "Visit" button displays at full width  
**And** button uses primary background color  
**When** user clicks the button  
**Then** PubDetailSheet opens for the pub

#### Scenario: Show Update Visit Button for Authenticated Visited Pub
**Given** user is authenticated  
**And** user has already visited the pub  
**When** the InfoWindow opens  
**Then** an "Update Visit" button displays at full width  
**And** button uses primary background color  
**When** user clicks the button  
**Then** PubDetailSheet opens for the pub

#### Scenario: Show Sign In Button for Unauthenticated User
**Given** user is not authenticated  
**When** the InfoWindow opens  
**Then** a "Sign in to track visit" button displays at full width  
**And** button uses primary background color  
**When** user clicks the button  
**Then** LoginDialog opens

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

### Requirement: InfoWindow Layout with Notes (REQ-EID-007)
**Priority:** MUST  
**Category:** UI/UX

The InfoWindow must maintain clean vertical layout when displaying rating and notes, ensuring content remains readable and not cluttered.

**Acceptance Criteria:**
- Content follows vertical order: image → name → badges → notes → link → button
- Notes preview has appropriate spacing from badges (8-12px margin)
- Notes preview does not push content height beyond reasonable limits
- Total InfoWindow max-height remains manageable (e.g., 400-450px)
- Scrolling is not required for typical visits with short notes
- Long notes are truncated to prevent excessive height
- All spacing follows consistent 8px grid system

#### Scenario: Layout with All Visit Details
**Given** a visited pub with image, rating 5, and notes  
**When** the InfoWindow opens  
**Then** the image displays at top  
**And** pub name displays below image  
**And** badges display below name (Open badge, Visited badge with stars)  
**And** notes preview displays below badges with spacing  
**And** website link displays below notes  
**And** action button displays at bottom  
**And** total height is reasonable and content is readable

#### Scenario: Layout Without Notes
**Given** a visited pub with rating but no notes  
**When** the InfoWindow opens  
**Then** the layout shows: image → name → badges → link → button  
**And** no extra space appears where notes would be  
**And** content flows naturally without gaps

#### Scenario: Compact Layout for Unvisited Pub
**Given** an unvisited pub  
**When** the InfoWindow opens  
**Then** the layout shows: image → name → status badge → link → button  
**And** no visit details (rating/notes) are shown  
**And** layout is compact and clean

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

