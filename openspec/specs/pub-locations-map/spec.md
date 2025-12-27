# pub-locations-map Specification

## Purpose
TBD - created by archiving change add-pub-locations-map. Update Purpose after archive.
## Requirements
### Requirement: Map Display (REQ-PLM-001)
**Priority:** MUST  
**Category:** Functional

**Modifications:**
- Map container must accommodate sidebar overlay on desktop
- Map controls must remain accessible when sidebar is open
- Map must remain interactive when sidebar is displayed

**Updated Acceptance Criteria:**
- Map initializes with center coordinates (54.0, -2.0) at zoom level 6
- Map displays standard roadmap view
- Map includes zoom controls and fullscreen option
- Map is responsive and fills available viewport
- Map is displayed as the home page at route `/`
- **NEW:** Map remains fully interactive when sidebar is overlaid
- **NEW:** Map controls are not obscured by sidebar

#### Scenario: Map with Sidebar Open
**Given** the pub locations map is displayed  
**And** the sidebar is open  
**When** the user interacts with the map  
**Then** the map remains fully functional (pan, zoom, marker clicks)  
**And** map controls remain accessible  
**And** sidebar does not interfere with map interactions

---

### Requirement: Pub Markers (REQ-PLM-002)
**Priority:** MUST  
**Category:** Functional

**Changes:**
- ADD: Markers MUST show 4 distinct visual states based on visit status and open state
- ADD: Visit status is determined by checking authenticated user's visit data
- UPDATE: Visual differentiation includes both open/closed state and visited/unvisited status

**Updated Acceptance Criteria:**
- Each pub with valid lat/lng coordinates has a corresponding marker
- Markers are positioned accurately at pub coordinates
- Markers display pub name on hover
- Markers are visually distinct and easily clickable
- Invalid/missing coordinates are handled gracefully (logged, skipped)
- **NEW:** Markers display one of 4 visual states:
  - Unvisited + Open: Red (#ea4335) at 100% opacity
  - Unvisited + Closed: Gray (#9ca3af) at 60% opacity
  - Visited + Open: Green (#34a853) at 100% opacity
  - Visited + Closed: Blue (#4285f4) at 60% opacity
- **NEW:** Visit status is only shown when user is authenticated
- **NEW:** When user is not authenticated, only 2 states are shown (open/closed without visit status)

#### Scenario: Display Markers with Visit Status for Authenticated User
**Given** the user is authenticated  
**And** the user has visited pubs with IDs [5, 12]  
**And** pub 5 has `openState: "Open"`  
**And** pub 12 has `openState: "Closed"`  
**And** pub 8 has `openState: "Open"` and is not visited  
**When** the markers are rendered  
**Then** pub 5's marker is green at 100% opacity (visited + open)  
**And** pub 12's marker is blue at 60% opacity (visited + closed)  
**And** pub 8's marker is red at 100% opacity (unvisited + open)

#### Scenario: Display Markers Without Visit Status When Not Authenticated
**Given** the user is not authenticated  
**And** the pub data includes both open and closed pubs  
**When** the markers are rendered  
**Then** open pubs show red markers at 100% opacity  
**And** closed pubs show gray markers at 60% opacity  
**And** no visit status differentiation is shown (only 2 states)

#### Scenario: Update Markers After Authentication
**Given** the map is displayed with unauth enticated markers (2 states)  
**When** the user logs in  
**And** visit data is loaded  
**Then** all markers are recreated  
**And** visited pubs show green (open) or blue (closed) markers  
**And** unvisited pubs retain red (open) or gray (closed) markers

#### Scenario: Update Markers After Logout
**Given** the user is authenticated  
**And** markers are showing 4 visual states based on visit data  
**When** the user logs out  
**Then** all markers are recreated  
**And** markers revert to 2 states (open/closed only)  
**And** visit status is no longer shown

---

### Requirement: Data Source (REQ-PLM-003)
**Priority:** MUST  
**Category:** Functional

The system MUST load pub location data from a static JSON file.

**Acceptance Criteria:**
- Data is loaded from `/data/pubs-sample.json`
- JSON file contains array of pub objects
- Each pub object includes: id, name, lat, lng
- Optional fields: address, townCity, county, region, country, url, imageUrl, openState
- Loading errors are caught and logged
- Empty or invalid JSON is handled gracefully

#### Scenario: Load Sample Pub Data
**Given** the `/data/pubs-sample.json` file exists  
**And** contains valid JSON with pub array  
**When** the map component initializes  
**Then** the JSON file is fetched successfully  
**And** pub data is parsed into JavaScript objects  
**And** the data is used to create map markers

#### Scenario: Handle Data Load Failure
**Given** the `/data/pubs-sample.json` file is missing or invalid  
**When** the map component attempts to load data  
**Then** an error is caught and logged  
**And** a user-friendly error message is displayed  
**And** the map still initializes without markers

---

### Requirement: Pub Information Display (REQ-PLM-004)
**Priority:** MUST  
**Category:** Functional

**Modifications:**
- Info windows can be triggered from sidebar pub selection
- Info windows display correctly when triggered via sidebar

**Updated Acceptance Criteria:**
- Clicking a marker opens an info window
- Info window displays: pub name, address, town/city, county
- If available, info window includes link to pub details page
- Only one info window is open at a time
- Info window can be closed by clicking the X or clicking another marker
- **NEW:** Selecting a pub from sidebar opens its info window
- **NEW:** Map pans to center selected pub before opening info window

#### Scenario: Select Pub from Sidebar
**Given** the sidebar is open  
**And** the map is displayed  
**When** the user clicks a pub in the sidebar list  
**Then** the map pans to center on that pub's location  
**And** the pub's info window opens  
**And** any previously open info window is closed  
**And** the info window displays the same information as marker clicks

---

### Requirement: Mobile Responsiveness (REQ-PLM-005)
**Priority:** MUST  
**Category:** Non-Functional

The map view MUST be fully functional and optimized for mobile devices.

**Acceptance Criteria:**
- Map container uses full viewport width on all screen sizes
- Map height adapts appropriately (full viewport on mobile, contained on desktop)
- Touch gestures work correctly (pinch zoom, pan)
- Markers are touch-friendly (minimum 44x44px tap target)
- Info windows are readable on small screens
- Map controls are accessible on mobile

#### Scenario: View Map on Mobile Device
**Given** the user accesses the map on a mobile device (screen width < 768px)  
**When** the map renders  
**Then** the map fills the full viewport width  
**And** the map is at least 80% of viewport height  
**And** pinch-to-zoom gestures work correctly  
**And** markers can be easily tapped with a finger  
**And** info windows display properly without overflow

---

### Requirement: Google Maps Integration (REQ-PLM-006)
**Priority:** MUST  
**Category:** Technical

The system MUST integrate with Google Maps JavaScript API securely and efficiently.

**Acceptance Criteria:**
- Google Maps API key is stored in environment variable
- API script is loaded asynchronously
- Map initializes only after API is ready
- API requests are minimized to reduce costs
- No API key is exposed in client-side code (use environment variables)

#### Scenario: Initialize Google Maps API
**Given** the map component is mounted  
**When** the Google Maps API script loads  
**Then** the API key from environment variable is used  
**And** the map initializes successfully  
**And** no console errors related to API key appear  
**And** the map is interactive and functional

---

### Requirement: Performance (REQ-PLM-007)
**Priority:** MUST  
**Category:** Non-Functional

The map view MUST load and become interactive within 3 seconds on a standard connection.

**Acceptance Criteria:**
- Initial map render occurs within 2 seconds
- All markers appear within 3 seconds
- Map is interactive (pannable, zoomable) within 2 seconds
- No blocking JavaScript delays user interaction

#### Scenario: Fast Map Loading
**Given** the user navigates to the map view  
**When** the page starts loading  
**Then** the map container appears within 1 second  
**And** the map becomes interactive within 2 seconds  
**And** all markers are visible within 3 seconds  
**And** the user can interact with the map immediately after it loads

---

### Requirement: Visit Date in Info Window (REQ-PLM-008)
**Priority:** MUST  
**Category:** Functional

The system MUST display the visit date in the pub info window when the user is authenticated and the pub has been visited.

**Acceptance Criteria:**
- Info window shows visit date for visited pubs when user is authenticated
- Visit date is displayed in human-readable format (e.g., "Visited on Nov 15, 2025")
- Visit date appears after the pub details (address, etc.)
- If visit has no date, no date text is shown
- Visit date uses appropriate styling to stand out
- Date is not shown when user is not authenticated

#### Scenario: Display Visit Date in Info Window for Visited Pub
**Given** the user is authenticated  
**And** pub "The Moon Under Water" was visited on "2025-11-15T14:30:00Z"  
**When** the user clicks on the pub's marker  
**Then** the info window opens  
**And** displays "Visited on Nov 15, 2025" after the pub details  
**And** the date text is styled distinctively

#### Scenario: No Visit Date for Unvisited Pub
**Given** the user is authenticated  
**And** pub "The Regal" has not been visited  
**When** the user clicks on the pub's marker  
**Then** the info window opens  
**And** no visit date text is shown

#### Scenario: No Visit Date When Not Authenticated
**Given** the user is not authenticated  
**When** the user clicks on any pub marker  
**Then** the info window opens with standard pub details  
**And** no visit date text is shown

#### Scenario: No Visit Date When Visit Lacks Date Field
**Given** the user is authenticated  
**And** pub "The Company Inn" has been visited  
**And** the visit record has no `visitedAt` field  
**When** the user clicks on the pub's marker  
**Then** the info window opens  
**And** no visit date text is shown

