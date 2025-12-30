# pub-locations-map Spec Delta

## MODIFIED Requirements

### Requirement: Pub Information Display (REQ-PLM-004)
**Priority:** MUST  
**Category:** Functional

**Changes:**
- UPDATE: InfoWindow card styling to work correctly with Google Maps close button
- ADD: Display postcode when available
- ADD: Display link to Wetherspoons pub page when `url` is defined
- ADD: Display pub image when `imageUrl` is defined
- ADD: Attribution for Wetherspoons images

**Updated Acceptance Criteria:**
- Clicking a marker opens an info window
- Info window displays: pub name, address, postcode (if available), town/city, county
- Info window styling works correctly with Google Maps default close button (no layout conflicts)
- If `url` field is defined, info window includes a link to the Wetherspoons pub page
- Link opens in a new tab with `target="_blank"` and `rel="noopener noreferrer"`
- If `imageUrl` field is defined, info window displays the pub image
- Image is constrained to max height of 200px and maintains aspect ratio
- Image has rounded corners and subtle border for consistency with card design
- If `imageUrl` contains "jdwetherspoon.com", attribution text "Image © JD Wetherspoon" is displayed
- Attribution text uses small, muted styling and appears below the image
- Only one info window is open at a time
- Info window can be closed by clicking the X or clicking another marker
- Selecting a pub from sidebar opens its info window
- Map pans to center selected pub before opening info window

#### Scenario: Display InfoWindow with All Optional Fields Present
**Given** pub "The Moon Under Water" has:
  - `name`: "The Moon Under Water"
  - `address`: "47 High Street"
  - `postcode`: "L1 2BX"
  - `townCity`: "Liverpool"
  - `county`: "Merseyside"
  - `url`: "https://www.jdwetherspoon.com/pubs/all-pubs/england/merseyside/the-moon-under-water"
  - `imageUrl`: "https://www.jdwetherspoon.com/images/pubs/moon-under-water.jpg"
  - `openState`: "Open"
**And** the user is authenticated
**And** the pub has been visited
**When** the user clicks on the pub's marker
**Then** the info window opens with:
  - Pub name as heading
  - Status badge ("Open")
  - Visit badge ("✓ Visited [date]")
  - Pub image (max 200px height, rounded corners)
  - Attribution text "Image © JD Wetherspoon" below image
  - Address line: "47 High Street"
  - Postcode line: "L1 2BX"
  - Location line: "Liverpool, Merseyside"
  - Link "View on Wetherspoons website" opening in new tab
  - "Update Visit" button
**And** the close button functions correctly without styling conflicts

#### Scenario: Display InfoWindow with Missing Optional Fields
**Given** pub "The Regal" has:
  - `name`: "The Regal"
  - `address`: "69 Church Street"
  - `townCity`: "Birmingham"
  - `county`: "West Midlands"
  - No `postcode` field
  - No `url` field
  - No `imageUrl` field
**When** the user clicks on the pub's marker
**Then** the info window opens with:
  - Pub name as heading
  - Status badge
  - Address line: "69 Church Street"
  - Location line: "Birmingham, West Midlands"
  - "Visit" button
  - No postcode line displayed
  - No pub image displayed
  - No Wetherspoons link displayed
  - No attribution text displayed

#### Scenario: Attribution Only for Wetherspoons Images
**Given** pub "The Standing Order" has:
  - `imageUrl`: "https://example.com/pub-photo.jpg" (not jdwetherspoon.com)
**When** the user clicks on the pub's marker
**Then** the info window opens with:
  - Pub image displayed
  - No attribution text (because image is not from jdwetherspoon.com)

#### Scenario: Wetherspoons Link Opens in New Tab
**Given** pub "The Moon Under Water" has a `url` defined
**And** the info window is open
**When** the user clicks the "View on Wetherspoons website" link
**Then** the link opens in a new browser tab
**And** the link has `rel="noopener noreferrer"` for security
**And** the current tab/map remains unchanged

#### Scenario: Image Respects Size Constraints
**Given** pub "The Company Inn" has:
  - `imageUrl`: "https://www.jdwetherspoon.com/images/pubs/large-image-3000x2000.jpg"
**When** the user clicks on the pub's marker
**Then** the info window opens with:
  - Image displayed with max-height of 200px
  - Image width auto-scales to maintain aspect ratio
  - Image does not overflow the info window container
  - Image has rounded corners consistent with card design

#### Scenario: InfoWindow Styling Works with Close Button
**Given** any pub marker is clicked
**When** the info window opens
**Then** the Google Maps default close button (X) is visible and functional
**And** the close button does not overlap or conflict with card content
**And** the card layout renders correctly around the close button
**And** all content remains readable and properly aligned
