# enhanced-infowindow-display Specification

## Purpose
TBD - created by archiving change 2025-12-31-enhance-infowindow-display. Update Purpose after archive.
## Requirements
### Requirement: InfoWindow Card-Style Layout (REQ-EID-001)
**Priority:** MUST  
**Category:** UI/UX

The InfoWindow displaying pub information must use a Card-based visual structure with consistent design patterns including proper spacing, shadows, rounded corners, and typography matching the shadcn/vue Card component design system.

**Acceptance Criteria:**
- InfoWindow content uses white background with rounded corners
- Content has consistent padding (12-16px)
- Container has subtle shadow for depth
- Typography uses system font stack with proper size hierarchy
- Layout is clean and visually similar to ProximityVisitPrompt Card
- Content is structured vertically: image → name → details → button

#### Scenario: InfoWindow Displays Card-Style Layout
**Given** a user clicks on a pub marker  
**When** the InfoWindow opens  
**Then** the InfoWindow content displays with white background and rounded corners  
**And** the content has subtle shadow for visual depth  
**And** the layout matches Card component design patterns  
**And** content is structured in vertical order: image, name, details, button

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

The InfoWindow content must be mobile-friendly with appropriate width constraints, responsive text sizing, and proper spacing that works well on both mobile and desktop screens.

**Acceptance Criteria:**
- InfoWindow minimum width is 250px for small screens
- InfoWindow maximum width is 400-500px to prevent excessive width
- Text sizing remains readable on small screens (minimum 14px for body)
- Padding and spacing scale appropriately for screen size
- Images maintain aspect ratio and don't overflow container
- Touch targets for buttons meet minimum 44px height requirement

#### Scenario: Mobile Screen Display
**Given** user views map on mobile device (screen width < 450px)  
**When** the InfoWindow opens  
**Then** content width is constrained to appropriate size for mobile  
**And** text remains readable at 14px minimum  
**And** button height meets 44px minimum for touch targets  
**And** images don't overflow container

#### Scenario: Desktop Screen Display
**Given** user views map on desktop device (screen width >= 450px)  
**When** the InfoWindow opens  
**Then** content width is constrained to maximum 500px  
**And** layout remains visually balanced  
**And** all content is easily readable

### Requirement: InfoWindow Accessibility (REQ-EID-008)
**Priority:** MUST  
**Category:** Accessibility

The InfoWindow content must follow accessibility best practices including proper semantic HTML, ARIA attributes for links, keyboard navigation support, and sufficient color contrast.

**Acceptance Criteria:**
- Heading uses proper semantic HTML (h3 or similar)
- External link includes ARIA label or title for screen readers
- Button has accessible label and focus indication
- Color contrast meets WCAG AA standards (4.5:1 for text)
- Interactive elements are keyboard accessible
- Focus order follows logical reading order

#### Scenario: Screen Reader Access
**Given** user navigates with screen reader  
**When** the InfoWindow opens  
**Then** pub name is announced as heading  
**And** badges provide meaningful text content  
**And** link provides clear destination information  
**And** button has clear action description

#### Scenario: Keyboard Navigation
**Given** user navigates with keyboard only  
**When** the InfoWindow opens  
**Then** link and button are focusable with Tab key  
**And** focused elements show visible focus indicator  
**And** Enter or Space key activates button  
**And** focus order follows logical sequence

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

