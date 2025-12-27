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

## ADDED Requirements

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

