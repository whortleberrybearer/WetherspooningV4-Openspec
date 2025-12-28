# pub-locations-map Specification Delta

## MODIFIED Requirements

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

## ADDED Requirements

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
