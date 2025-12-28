# pub-locations-map Specification

## Purpose
TBD - created by archiving change add-pub-locations-map. Update Purpose after archive.
## Requirements
### Requirement: Map Display (REQ-PLM-001)
**Priority:** MUST  
**Category:** Functional

**Changes:**
- ADD: Map should attempt to center on user's current location via Geolocation API
- ADD: Map should fall back to default center if geolocation unavailable
- UPDATE: Initial center behavior is now dynamic based on geolocation availability

**Updated Acceptance Criteria:**
- Map initializes with default center coordinates (54.0, -2.0) at zoom level 6
- **NEW:** Map requests user's current location via browser Geolocation API after initialization
- **NEW:** If geolocation succeeds, map re-centers to user's coordinates at zoom level 12
- **NEW:** If geolocation fails or is denied, map remains at default center
- **NEW:** Geolocation request is non-blocking and does not delay initial map render
- Map displays standard roadmap view
- Map includes zoom controls and fullscreen option
- Map is responsive and fills available viewport
- Map is displayed as the home page at route `/`
- Map remains fully interactive when sidebar is overlaid
- Map controls are not obscured by sidebar

#### Scenario: Center on User Location When Permission Granted
**Given** the user visits the page  
**And** the browser supports geolocation  
**When** the map initializes  
**Then** the map is initially displayed at default center (54.0, -2.0) with zoom 6  
**And** a geolocation permission prompt is shown  
**When** the user grants location permission  
**Then** the map smoothly pans to the user's current coordinates  
**And** the zoom level changes to 12  
**And** pub markers are visible in the user's area

#### Scenario: Stay at Default Center When Permission Denied
**Given** the user visits the page  
**And** the browser supports geolocation  
**When** the map initializes  
**Then** the map is displayed at default center (54.0, -2.0) with zoom 6  
**And** a geolocation permission prompt is shown  
**When** the user denies location permission  
**Then** the map remains at default center (54.0, -2.0)  
**And** the zoom level remains at 6  
**And** no error message is displayed to the user  
**And** a warning is logged to the console

#### Scenario: Stay at Default Center When Geolocation Not Supported
**Given** the user visits the page  
**And** the browser does not support geolocation  
**When** the map initializes  
**Then** the map is displayed at default center (54.0, -2.0) with zoom 6  
**And** no geolocation permission prompt is shown  
**And** a warning is logged to the console  
**And** the map remains functional

#### Scenario: Geolocation Timeout
**Given** the user visits the page  
**And** the user grants location permission  
**And** the geolocation request takes longer than 5 seconds  
**When** the timeout is reached  
**Then** the geolocation request is cancelled  
**And** the map remains at default center (54.0, -2.0)  
**And** the zoom level remains at 6  
**And** a warning is logged to the console

#### Scenario: User Location Outside UK
**Given** the user visits the page from outside the UK  
**And** the user grants location permission  
**When** the geolocation succeeds  
**Then** the map centers on the user's actual coordinates (anywhere in the world)  
**And** the zoom level changes to 12  
**And** pub markers for that region are displayed (if available)

#### Scenario: Non-Blocking Geolocation Request
**Given** the user visits the page  
**When** the map initializes  
**Then** the map renders immediately with default center  
**And** the geolocation request happens asynchronously  
**And** pub data loading is not blocked by geolocation  
**And** the user can interact with the map immediately

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

### Requirement: Geolocation-Based Centering (REQ-PLM-009)
**Priority:** MUST  
**Category:** User Experience

The system MUST attempt to center the map on the user's current location using the browser's Geolocation API, falling back to a default center if geolocation is unavailable or denied.

**Acceptance Criteria:**
- System checks for browser Geolocation API support (`'geolocation' in navigator`)
- If supported, system calls `navigator.geolocation.getCurrentPosition()` after map initialization
- Geolocation options are configured:
  - `enableHighAccuracy: false` (faster response, sufficient accuracy for pub finding)
  - `timeout: 5000` (5 second timeout prevents indefinite waiting)
  - `maximumAge: 300000` (cached positions up to 5 minutes old are acceptable)
- On successful geolocation:
  - Map centers on user's latitude/longitude coordinates
  - Zoom level is set to 12 (neighborhood-level detail)
  - Action is logged to console for debugging
- On geolocation failure (permission denied, timeout, error):
  - Map remains at default center (54.0, -2.0)
  - Zoom level remains at default (6)
  - Warning is logged to console
  - No user-facing error message is displayed
- Geolocation request does not block map rendering or pub data loading
- User can interact with map before geolocation completes

#### Scenario: Successful Geolocation
**Given** the user has not previously granted or denied location permission  
**And** the browser supports geolocation  
**When** the page loads  
**Then** the map renders immediately at default center  
**And** a browser permission prompt appears requesting location access  
**When** the user grants permission  
**Then** the geolocation API returns the user's coordinates within 2 seconds  
**And** the map smoothly pans to those coordinates  
**And** the zoom level increases to 12  
**And** a console log confirms the new center coordinates

#### Scenario: Permission Previously Granted
**Given** the user previously granted location permission  
**And** the browser has cached the permission  
**When** the page loads  
**Then** no permission prompt is shown  
**And** the map centers on the user's location within 1-2 seconds  
**And** the zoom level is set to 12  
**And** no user interaction is required

#### Scenario: Permission Previously Denied
**Given** the user previously denied location permission  
**And** the browser has cached the denial  
**When** the page loads  
**Then** no permission prompt is shown  
**And** the map remains at default center (54.0, -2.0)  
**And** the zoom level remains at 6  
**And** a console warning is logged  
**And** the map functions normally

#### Scenario: Geolocation Error Handling
**Given** the browser supports geolocation  
**And** the user grants permission  
**When** the geolocation API encounters an error (e.g., GPS unavailable)  
**Then** the error callback is triggered  
**And** the map remains at default center  
**And** a console warning is logged with the error message  
**And** the map remains fully functional  
**And** no error banner or alert is shown to the user

#### Scenario: Smooth Pan Animation
**Given** the map is displayed at default center  
**When** geolocation succeeds and returns coordinates  
**Then** the map pans smoothly to the new center (not an instant jump)  
**And** the zoom transition is animated  
**And** pub markers remain visible during the transition  
**And** user can still interact with the map during the transition

#### Scenario: Concurrent Operations
**Given** the page is loading  
**When** the map initializes  
**Then** geolocation request starts asynchronously  
**And** pub data fetch happens concurrently  
**And** markers are created when pub data arrives  
**And** map can recenter while markers are being created  
**And** no race conditions occur between operations

