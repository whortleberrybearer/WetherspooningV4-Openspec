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

The system MUST display a marker on the map for each pub location loaded from the data source.

**Acceptance Criteria:**
- Each pub with valid lat/lng coordinates has a corresponding marker
- Markers are positioned accurately at pub coordinates
- Markers display pub name on hover
- Markers are visually distinct and easily clickable
- Invalid/missing coordinates are handled gracefully (logged, skipped)

#### Scenario: Display All Pub Markers
**Given** the map has loaded  
**And** pub data contains 15 sample pubs  
**When** the markers are rendered  
**Then** 15 markers appear on the map  
**And** each marker is positioned at the correct coordinates  
**And** hovering over a marker shows the pub name

#### Scenario: Handle Missing Coordinates
**Given** the pub data contains a pub without lat/lng coordinates  
**When** the markers are rendered  
**Then** the pub without coordinates is skipped  
**And** a warning is logged to the console  
**And** other valid pubs are still displayed

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

