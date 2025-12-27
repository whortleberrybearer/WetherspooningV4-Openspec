# pub-locations-map Specification Delta

## MODIFIED Requirements

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

## MODIFIED Requirements

### Requirement: Visual Differentiation (REQ-PLM-007)
**Priority:** MUST  
**Category:** Functional

**Changes:**
- UPDATE: Expand from 2 visual states to 4 visual states
- ADD: Integrate visit status from pub-visit-data capability
- ADD: Authentication-dependent visual differentiation

**Updated Description:**
The system MUST provide clear visual differentiation between pub markers based on their open state and visit status.

**Updated Acceptance Criteria:**
- **NEW:** Four distinct marker colors are used:
  - Red (#ea4335): Unvisited + Open
  - Gray (#9ca3af): Unvisited + Closed  
  - Green (#34a853): Visited + Open
  - Blue (#4285f4): Visited + Closed
- Closed pub markers (gray and blue) use 60% opacity for secondary visual hierarchy
- Open pub markers (red and green) use 100% opacity for primary visual hierarchy
- All markers have white 2px border and shadow for visibility
- **NEW:** Marker colors update dynamically when visit data loads or clears
- **NEW:** Color selection follows Material Design palette for consistency and accessibility

#### Scenario: Distinguish All 4 Marker States
**Given** the user is authenticated with visit data loaded  
**And** the map displays multiple pubs  
**When** the user views the map  
**Then** unvisited open pubs appear as solid red markers  
**And** unvisited closed pubs appear as faded gray markers  
**And** visited open pubs appear as solid green markers  
**And** visited closed pubs appear as faded blue markers  
**And** each state is clearly distinguishable from the others

#### Scenario: Color Accessibility
**Given** the map is displayed with all 4 marker states  
**When** a user with common color vision deficiency views the map  
**Then** the states remain distinguishable due to:  
- Opacity difference between open (100%) and closed (60%)  
- Distinct hue differences (red, green, blue, gray)  
- White borders on all markers for additional contrast

#### Scenario: Visual Consistency with Material Design
**Given** the application uses Material Design color palette  
**When** map markers are rendered  
**Then** marker colors match Material Design standard colors:  
- Red: #ea4335 (Material Red 600)  
- Green: #34a853 (Material Green 600)  
- Blue: #4285f4 (Material Blue 500)  
- Gray: #9ca3af (Tailwind Gray 400)  
**And** colors are consistent with the rest of the application's color scheme
