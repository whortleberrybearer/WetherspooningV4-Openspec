# proximity-visit-prompt Specification

## Purpose
TBD - created by archiving change 2025-12-30-add-proximity-visit-prompt. Update Purpose after archive.
## Requirements
### Requirement: Proximity Detection on Initial Geolocation (REQ-PVP-001)
**Priority:** MUST  
**Category:** Functional

The system MUST detect when the user's current location is within 100 metres of an open Wetherspoon pub on the first geolocation position detection only.

**Acceptance Criteria:**
- System uses browser Geolocation API via `navigator.geolocation.getCurrentPosition()`
- Geolocation is requested with `enableHighAccuracy: false` (balanced accuracy)
- Distance calculation uses Haversine formula for accuracy
- Distance is calculated in metres
- Only open pubs are considered (pubs with `openState` containing "closed" are excluded)
- System identifies the single closest open pub
- Proximity check happens ONLY once on first successful geolocation
- If geolocation is denied or unavailable, feature is disabled gracefully
- No continuous location tracking (no watchPosition)

#### Scenario: Detect Nearby Open Pub on Initial Load
**Given** the user has granted geolocation permission  
**And** the user's location is at coordinates (53.4808, -2.2426)  
**And** there is an open pub at (53.4816, -2.2430) approximately 95 metres away  
**And** all other pubs are farther than 100 metres  
**And** this is the first geolocation check  
**When** the geolocation position is received  
**Then** the system calculates the distance using Haversine formula  
**And** identifies the pub at (53.4816, -2.2430) as the closest  
**And** determines the user is within 100 metres of that pub

#### Scenario: No Nearby Open Pubs
**Given** the user's location is known  
**And** the closest open pub is 250 metres away  
**When** the initial geolocation position is received  
**Then** the system determines no pubs are within 100 metres  
**And** no automatic centering occurs  
**And** map remains at user's current location

#### Scenario: Nearby Pub is Closed
**Given** the user is 50 metres from a pub  
**And** that pub has `openState` set to "Closed"  
**When** the initial geolocation position is received  
**Then** the system excludes that pub from consideration  
**And** checks other open pubs for proximity  
**And** no auto-centering occurs if no open pubs are within 100m

#### Scenario: Geolocation Permission Denied
**Given** the user has denied geolocation permission  
**When** the page loads  
**Then** the proximity detection feature is disabled  
**And** no auto-centering occurs  
**And** no errors are thrown  
**And** the map continues to function normally at default center

#### Scenario: Proximity Check Only Runs Once
**Given** the user's initial location was within 100m of a pub  
**And** proximity detection has already run once  
**When** the user moves to a new location  
**Then** no additional proximity checks are performed  
**And** no auto-centering occurs

---

### Requirement: Auto-Center Map and Display Info Window (REQ-PVP-002)
**Priority:** MUST  
**Category:** User Interface

The system MUST center the map on the nearby pub's location and automatically display its info window when proximity is detected.

**Acceptance Criteria:**
- Map centers on the pub's coordinates using `map.panTo()` or `map.setCenter()`
- Map zoom level adjusts to appropriate level (e.g., 15-16) for pub detail view
- Info window opens automatically for the nearby pub
- Info window displays standard pub information (image, name, address, badges, link, button)
- No separate prompt dialog is shown
- Centering and info window display happen immediately after proximity detection
- User can close the info window and interact with map normally
- No visit is automatically created - user must click button in info window

#### Scenario: Auto-Center and Show Info Window for Nearby Pub
**Given** the user is within 95 metres of "The Moon Under Water"  
**And** "The Moon Under Water" is open  
**And** this is the first geolocation check  
**When** proximity is detected  
**Then** the map centers on "The Moon Under Water" coordinates  
**And** the map zoom level adjusts to 15  
**And** the info window opens for "The Moon Under Water"  
**And** the info window displays the pub's image (if available)  
**And** the info window displays the pub's name and address  
**And** the info window displays status and visit badges  
**And** the info window displays the website link (if available)  
**And** the info window displays the appropriate action button

#### Scenario: User Can Close Auto-Opened Info Window
**Given** the info window was auto-opened due to proximity  
**When** the user clicks the close button on the info window  
**Then** the info window closes  
**And** the map remains centered on the pub  
**And** the user can interact with other markers normally

#### Scenario: No Auto-Center When Not Within Proximity
**Given** the user's location is known  
**And** no open pubs are within 100 metres  
**When** the initial geolocation position is received  
**Then** the map does NOT auto-center on any pub  
**And** the map centers on the user's current location  
**And** no info window is displayed

---

### Requirement: Single Proximity Check (REQ-PVP-003)
**Priority:** MUST  
**Category:** Performance

The system MUST perform proximity checking only once on the initial geolocation detection, not continuously.

**Acceptance Criteria:**
- Proximity check executes only after first successful geolocation
- No continuous location tracking (no watchPosition)
- No repeated proximity checks if user moves
- No performance impact from continuous distance calculations
- Feature does not interfere with normal map interactions
- No session storage or persistence needed

#### Scenario: No Repeated Checks After Initial Detection
**Given** the initial proximity check has completed  
**And** a nearby pub was found and info window displayed  
**When** the user moves to a different location  
**Then** no additional proximity checks are performed  
**And** no new auto-centering occurs  
**And** the previously opened info window remains (or is closed by user)

#### Scenario: No Checks After User Dismisses Info Window
**Given** the info window was auto-opened due to proximity  
**When** the user closes the info window  
**Then** no additional proximity checks are triggered  
**And** the closed info window stays closed  
**And** the user can manually interact with other pub markers

