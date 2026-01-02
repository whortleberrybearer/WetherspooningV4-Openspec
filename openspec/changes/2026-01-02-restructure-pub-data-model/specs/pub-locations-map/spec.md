# pub-locations-map Specification Delta

## MODIFIED Requirements

### Requirement: Marker Rendering (REQ-PLM-002)
**Priority:** MUST  
**Category:** Functional

**Changes:**
- MODIFIED: Markers are only created for pubs with defined `position` data
- MODIFIED: Access coordinates via `pub.position.lat` and `pub.position.lng`
- ADDED: Pubs without position are automatically excluded from map rendering

**Updated Acceptance Criteria:**
- Each pub with valid position data is displayed as a marker on the map
- **MODIFIED:** Pubs with `position: null` are not rendered on the map
- **MODIFIED:** Position coordinates are accessed via `pub.position.lat` and `pub.position.lng`
- Markers use Google Maps Advanced Marker API
- Each marker displays correct position from pub data
- Markers are interactive (clickable)
- **MODIFIED:** Marker filtering validates `position` exists before rendering
- Marker rendering is performant with 100+ positioned pubs

#### Scenario: Render Map with Mixed Position Data
**ADDED:**
**Given** the pub data includes 10 pubs  
**And** 7 pubs have `position: { lat, lng }` defined  
**And** 3 pubs have `position: null`  
**When** the map is rendered  
**Then** exactly 7 markers are displayed  
**And** the 3 pubs without position are not rendered  
**And** no errors are logged for pubs without position

#### Scenario: Access Position Coordinates
**MODIFIED:**
**Given** a pub has `position: { lat: 52.4931, lng: -1.8843 }`  
**When** a marker is created for the pub  
**Then** the marker is positioned at coordinates (52.4931, -1.8843)  
**And** the position is accessed via `pub.position.lat` and `pub.position.lng`

#### Scenario: Skip Rendering for Null Position
**ADDED:**
**Given** a pub has `position: null`  
**When** markers are being created  
**Then** no marker is created for this pub  
**And** the pub is filtered out before marker creation  
**And** no error is thrown or logged

---

### Requirement: Pub Info Window (REQ-PLM-003)
**Priority:** MUST  
**Category:** Functional

**Changes:**
- MODIFIED: Info windows only open for pubs with position data (since only they have markers)
- MODIFIED: Selected pub highlighting validates position exists

**Updated Acceptance Criteria:**
- Clicking a marker opens an info window for that pub
- Info window displays pub name, address, and visit status
- Only one info window is visible at a time
- **MODIFIED:** Info windows only appear for pubs with defined position (only positioned pubs have markers)
- Clicking outside closes the info window
- Closing one info window before opening another works correctly

#### Scenario: Open Info Window for Positioned Pub
**MODIFIED:**
**Given** a pub with `position: { lat: 52.4931, lng: -1.8843 }` has a marker on the map  
**When** the user clicks the marker  
**Then** an info window opens for that pub  
**And** the info window displays pub details

---

### Requirement: Proximity-based Visit Prompts (REQ-PLM-006)
**Priority:** MUST  
**Category:** Functional

**Changes:**
- MODIFIED: Proximity checks only consider pubs with position data
- MODIFIED: Distance calculations validate position exists before computing

**Updated Acceptance Criteria:**
- **MODIFIED:** System checks user's location against only pubs with defined `position`
- **MODIFIED:** Pubs with `position: null` are excluded from proximity checks
- When user is within 200 meters of a positioned, unvisited pub, a visit prompt appears
- Prompt shows pub name and distance
- User can accept or dismiss the prompt

#### Scenario: Check Proximity Against Positioned Pubs Only
**ADDED:**
**Given** the user's location is at (52.4931, -1.8843)  
**And** pub A has `position: { lat: 52.4935, lng: -1.8843 }` (30 meters away)  
**And** pub B has `position: null`  
**When** proximity check runs  
**Then** pub A is considered for proximity prompt  
**And** pub B is excluded from proximity check  
**And** no error occurs when checking pub B

#### Scenario: Calculate Distance for Positioned Pub
**MODIFIED:**
**Given** user location is (52.4931, -1.8843)  
**And** a pub has `position: { lat: 52.4935, lng: -1.8843 }`  
**When** distance is calculated  
**Then** coordinates are accessed via `pub.position.lat` and `pub.position.lng`  
**And** distance is approximately 45 meters

---

## ADDED Requirements

### Requirement: Position-based Filtering (REQ-PLM-007)
**Priority:** MUST  
**Category:** Functional

The system MUST filter pubs based on position availability before rendering map markers.

**Acceptance Criteria:**
- Pubs are filtered to include only those with non-null `position` before marker creation
- Filtering occurs before clustering and marker instantiation
- Filter function checks `pub.position !== null`
- Filtered list is used for all map-specific operations
- Sidebar continues to receive unfiltered pub list

#### Scenario: Filter Pubs for Map Rendering
**Given** 15 pubs are loaded from the data source  
**And** 12 pubs have `position` defined  
**And** 3 pubs have `position: null`  
**When** pubs are filtered for map rendering  
**Then** the filtered list contains exactly 12 pubs  
**And** all pubs in the filtered list have non-null `position`  
**And** no pubs with `position: null` are in the filtered list

#### Scenario: Preserve Full List for Sidebar
**Given** 10 pubs total (7 with position, 3 without)  
**When** pubs are provided to the sidebar component  
**Then** all 10 pubs are included  
**And** filtering is only applied for map rendering, not sidebar

---

### Requirement: Position Null-safety (REQ-PLM-008)
**Priority:** MUST  
**Category:** Functional

The system MUST safely handle null position values in all map operations without errors.

**Acceptance Criteria:**
- All position access uses optional chaining or null checks
- No runtime errors occur when processing pubs with `position: null`
- TypeScript compiler enforces null checks on position access
- Distance calculations guard against null position
- Clustering operations skip pubs without position

#### Scenario: Safe Position Access
**Given** a pub has `position: null`  
**When** code attempts to access `pub.position?.lat`  
**Then** the result is `undefined`  
**And** no runtime error occurs

#### Scenario: Safe Distance Calculation
**Given** distance calculation function receives a pub with `position: null`  
**When** calculation is attempted  
**Then** the function returns early or returns null  
**And** no error is thrown  
**And** no NaN values are produced
