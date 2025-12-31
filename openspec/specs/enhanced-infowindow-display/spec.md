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

The InfoWindow must display Open/Closed status badge and Visited badge (when applicable) using consistent Badge component styling with appropriate colors, spacing, and formatted visit dates.

**Acceptance Criteria:**
- Status badge displays based on pub.openState property
- Open badge uses green background (bg-green-500) with white text
- Closed badge uses destructive/red background with white text
- Badges use rounded-md border-radius and appropriate padding (px-2.5 py-0.5)
- Visited badge displays only when user is authenticated and has visited the pub
- Visited badge shows formatted date (DD/MM/YY) from visit record
- Visited badge uses green background with checkmark icon (✓)
- Badges display horizontally with gap spacing (8px)
- Badge text uses small font size (12px) and semibold weight

#### Scenario: Display Open Status Badge
**Given** a pub has openState not containing "closed"  
**When** the InfoWindow opens  
**Then** an "Open" badge displays with green background and white text  
**And** badge uses proper padding and rounded corners

#### Scenario: Display Closed Status Badge
**Given** a pub has openState containing "closed"  
**When** the InfoWindow opens  
**Then** a "Closed" badge displays with red/destructive background and white text  
**And** badge uses proper padding and rounded corners

#### Scenario: Display Visited Badge with Date
**Given** user is authenticated  
**And** user has visited the pub on a specific date  
**When** the InfoWindow opens  
**Then** a "✓ Visited DD/MM/YY" badge displays with green background  
**And** date is formatted correctly from visit record  
**And** badge appears next to status badge with proper spacing

#### Scenario: Display Visited Badge without Date
**Given** user is authenticated  
**And** user has visited the pub but no date is recorded  
**When** the InfoWindow opens  
**Then** a "✓ Visited" badge displays with green background  
**And** badge appears next to status badge

#### Scenario: No Visited Badge for Unauthenticated User
**Given** user is not authenticated  
**When** the InfoWindow opens  
**Then** only the status badge displays  
**And** no visited badge appears

#### Scenario: No Visited Badge for Unvisited Pub
**Given** user is authenticated  
**And** user has not visited the pub  
**When** the InfoWindow opens  
**Then** only the status badge displays  
**And** no visited badge appears

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

