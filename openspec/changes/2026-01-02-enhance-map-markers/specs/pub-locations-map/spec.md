# pub-locations-map Spec Delta

## MODIFIED Requirements

### Requirement: Pub Markers (REQ-PLM-002)
**Priority:** MUST  
**Category:** Functional

**Changes:**
- MODIFY: Replace small circular markers with larger pin-shaped markers
- MODIFY: Increase marker size from 12px to 30-40px for better visibility
- ADD: Use icons/glyphs as primary state indicators instead of color
- MODIFY: Visual state differentiation to use checkmark and X icons
- ADD: Support for location type badges (hotel, airport, train station)
- MODIFY: Color becomes supplementary indicator, not primary
- ADD: Accessibility improvements for color-independent state recognition

**Updated Description:**
Each pub with valid lat/lng coordinates MUST be represented by a pin-shaped marker that uses icons and visual design (not just color) to communicate visited status, open/closed state, and optionally location type (hotel, airport, train station).

**Updated Acceptance Criteria:**
- Each pub with valid lat/lng coordinates has a corresponding marker
- Markers are positioned accurately at pub coordinates
- Markers display pub name on hover via `title` attribute
- Markers use traditional pin/teardrop shape (familiar map marker appearance)
- **NEW:** Marker size is 30px width × 40px height (significantly larger than previous 12px)
- **NEW:** Markers have white border (2px) for definition against varying map backgrounds
- **NEW:** Pin tip points precisely to pub coordinates
- Invalid/missing coordinates are handled gracefully (logged, skipped)

**Primary State Indicators (Icons, not color):**
- **NEW:** Visited state indicated by checkmark (✓) icon centered in pin body (16px size)
- **NEW:** Unvisited state indicated by empty pin body or minimal dot
- **NEW:** Closed state indicated by X icon overlaid on marker or diagonal strike-through
- **NEW:** Open state has no additional overlay icon

**Color as Supplementary Context:**
- **MODIFIED:** Visited + Open: Green background (#22c55e light, #16a34a dark) at 100% opacity
- **MODIFIED:** Visited + Closed: Blue background (#3b82f6 light, #2563eb dark) at 70% opacity
- **MODIFIED:** Unvisited + Open: Red background (#ef4444 light, #dc2626 dark) at 100% opacity
- **MODIFIED:** Unvisited + Closed: Gray background (#6b7280 light, #4b5563 dark) at 70% opacity
- **NEW:** Opacity for closed markers changed from 60% to 70% for improved visibility

**Location Type Badges (Optional):**
- **NEW:** When `isHotel` is true, small hotel badge (🏨) appears in top-right corner (12px)
- **NEW:** When `inAirport` is true, small airport badge (✈️) appears in top-right corner (12px)
- **NEW:** When `inTrainStation` is true, small train badge (🚂) appears in top-right corner (12px)
- **NEW:** Badge is positioned as overlay, does not obscure primary state icons
- **NEW:** Badge has white background circle for contrast

**Interaction:**
- Markers are easily clickable (40px height meets WCAG 2.5.5 target size)
- **NEW:** Markers scale on hover (1.1x) for visual feedback
- **NEW:** Hovered marker has elevated z-index to appear above adjacent markers

**Theme Support:**
- **NEW:** Marker colors adapt to light and dark themes via CSS custom properties
- **NEW:** Icon colors (white) provide sufficient contrast in both themes (WCAG AA)

**Visit Status Behavior:**
- Visit status is determined by checking authenticated user's visit data
- When user is not authenticated, only 2 visual states shown (open/closed without visit status)
- When user is authenticated, 4 visual states shown (visited/unvisited × open/closed)

#### Scenario: Display Large Pin Marker with Visited and Open State
**Given** the user is authenticated  
**And** the user has visited pub ID 5  
**And** pub 5 has `openState: "Open"`  
**When** the marker is rendered  
**Then** the marker is a pin shape 30px wide and 40px tall  
**And** the marker has a green background (#22c55e in light theme)  
**And** the marker displays a white checkmark (✓) icon centered in the pin body  
**And** the marker has no X overlay (open state)  
**And** the marker has 100% opacity  
**And** the marker has a 2px white border  
**And** the pin tip points to the pub's exact coordinates

#### Scenario: Display Pin Marker with Closed and Unvisited State
**Given** the user is authenticated  
**And** pub 8 has `openState: "Closed"`  
**And** pub 8 has not been visited  
**When** the marker is rendered  
**Then** the marker is a pin shape 30px wide and 40px tall  
**And** the marker has a gray background (#6b7280 in light theme)  
**And** the marker displays no checkmark icon (unvisited)  
**And** the marker displays a white X icon or strike-through (closed state)  
**And** the marker has 70% opacity  
**And** the marker has a 2px white border

#### Scenario: Display Pin Marker with Location Type Badge
**Given** pub 12 is unvisited and open  
**And** pub 12 has `inAirport: true`  
**When** the marker is rendered  
**Then** the marker is a pin shape with red background  
**And** the marker displays no checkmark (unvisited)  
**And** the marker displays no X (open state)  
**And** a small airport badge (✈️) appears in the top-right corner  
**And** the badge is 12px diameter with white background circle  
**And** the badge does not obscure the main pin icon area

#### Scenario: Display Pin Marker Without Visit Status (Unauthenticated)
**Given** the user is not authenticated  
**And** pub 15 has `openState: "Open"`  
**When** the marker is rendered  
**Then** the marker is a pin shape with red background (default for open)  
**And** the marker displays no checkmark (visit status not shown when unauthenticated)  
**And** the marker displays no X (open state)  
**And** only 2 states are differentiated: open (red) vs closed (gray)

#### Scenario: Hover Over Pin Marker
**Given** a marker is displayed on the map  
**When** the user hovers over the marker  
**Then** the marker scales up to 1.1x size  
**And** the marker's z-index increases to appear above adjacent markers  
**And** the cursor changes to pointer  
**And** the pub name appears as tooltip (via title attribute)

#### Scenario: Click Pin Marker to Open InfoWindow
**Given** a pin marker is displayed  
**When** the user clicks the marker  
**Then** the InfoWindow opens anchored to the marker  
**And** the InfoWindow displays pub details  
**And** the click interaction is unchanged from previous marker behavior

#### Scenario: Pin Markers Adapt to Theme Change
**Given** markers are displayed in light theme  
**And** a visited pub marker has green background (#22c55e)  
**When** the user switches to dark theme  
**Then** the visited pub marker background updates to dark green (#16a34a)  
**And** all other markers update to their dark theme colors  
**And** icons remain white for consistent contrast

#### Scenario: Color Blind User Distinguishes States by Icons
**Given** a user with red-green color blindness views the map  
**And** there are visited, unvisited, open, and closed markers  
**When** the user examines the markers  
**Then** visited markers are identifiable by the checkmark icon (not color)  
**And** closed markers are identifiable by the X icon (not opacity)  
**And** the user can distinguish all 4 states without relying on color perception

#### Scenario: Pin Markers Meet Accessibility Target Size
**Given** a user interacts with the map on a touch device  
**When** the user attempts to tap a marker  
**Then** the marker's 40px height provides a sufficient touch target  
**And** the marker meets WCAG 2.5.5 guidelines (40px ≈ 44px recommended)  
**And** the marker is easier to tap accurately than previous 12px markers

#### Scenario: Update Markers After Authentication
**Given** the map is displayed with unauthenticated markers (2 states: open/closed)  
**When** the user logs in  
**And** visit data is loaded  
**Then** all markers are recreated with new pin design  
**And** visited pubs show checkmark icons  
**And** unvisited pubs show no checkmark  
**And** markers show 4 visual states (visited/unvisited × open/closed)

#### Scenario: Pin Markers with Invalid Coordinates Skipped
**Given** a pub has missing `lat` or `lng` properties  
**When** markers are created  
**Then** no marker is created for that pub  
**And** a warning is logged: "Pub [name] is missing coordinates"  
**And** marker creation continues for remaining valid pubs
