# pub-navigation-sidebar Spec Delta

## MODIFIED Requirements

### Requirement: Sidebar Display (REQ-PNS-001)
**Priority:** MUST  
**Category:** Functional

**Changes:**
- MODIFY: Update pub sorting within counties to use multi-level ordering
- MODIFY: Adjust sidebar width to prevent horizontal scrollbar
- MODIFY: Reposition location type icons after pub name

The system SHALL display pubs within each county sorted by name (primary), then townCity (secondary), then openState (tertiary), with open pubs appearing before closed pubs when name and townCity match.

The sidebar SHALL have a fixed width that prevents horizontal scrollbar while maintaining readability (approximately 400px on desktop).

Location type indicators (hotel, airport, train station) SHALL appear after the pub name rather than before it.

**Updated Acceptance Criteria:**
- Sidebar displays all pubs from the data source
- Pubs are grouped first by country, then by county
- Country grouping SHALL use "Unknown" for null, undefined, or empty country values
- Countries are sorted alphabetically
- Counties within each country are sorted alphabetically
- **MODIFIED:** Pubs within each county are sorted by:
  1. Name (alphabetically, case-insensitive)
  2. TownCity (alphabetically, case-insensitive)
  3. OpenState (open before closed)
- Each grouping level shows the count of pubs it contains
- **MODIFIED:** Sidebar has fixed width of approximately 400px on desktop
- **MODIFIED:** Sidebar content does not cause horizontal scrollbar
- **MODIFIED:** Location type icons (hotel 🏨, airport ✈️, train station 🚂) display after pub name

#### Scenario: Group Pubs with Missing Country
**Given** some pubs in the data have null or undefined country fields  
**When** the sidebar is displayed  
**Then** those pubs appear in an "Unknown" country group  
**And** the "Unknown" group is sorted alphabetically with other countries  
**And** pubs within "Unknown" are still grouped by county  
**And** all pubs are visible in the sidebar

#### Scenario: Sort Pubs by Name Within County
**ADDED:**  
**Given** Greater Manchester county contains pubs:
  - "The Moon Under Water" in Manchester
  - "The Paramount" in Manchester  
  - "The Britannia" in Stockport
  - "The Angel" in Manchester  
**When** the county group is expanded  
**Then** pubs are displayed in this order:
  1. "The Angel" - Manchester
  2. "The Britannia" - Stockport
  3. "The Moon Under Water" - Manchester
  4. "The Paramount" - Manchester  
**And** the alphabetical name ordering is maintained

#### Scenario: Sort Pubs with Same Name by TownCity
**ADDED:**  
**Given** Essex county contains pubs:
  - "The Moon Under Water" in Chelmsford
  - "The Moon Under Water" in Basildon
  - "The Moon Under Water" in Colchester  
**When** the county group is expanded  
**Then** pubs are displayed in this order:
  1. "The Moon Under Water" - Basildon
  2. "The Moon Under Water" - Chelmsford
  3. "The Moon Under Water" - Colchester  
**And** townCity provides secondary sort when names match

#### Scenario: Sort Open Before Closed When Name and Town Match
**ADDED:**  
**Given** a county contains two pubs:
  - "The Moon Under Water" in Chelmsford (openState: "Open")
  - "The Moon Under Water" in Chelmsford (openState: "Closed")  
**When** the county group is expanded  
**Then** the open pub appears before the closed pub  
**And** the open pub is displayed with normal opacity  
**And** the closed pub is displayed with reduced opacity (opacity-50)

#### Scenario: Sidebar Width Prevents Horizontal Scroll
**ADDED:**  
**Given** the sidebar is displayed on desktop  
**And** pubs have visit progress indicators showing  
**When** the sidebar renders with all content  
**Then** no horizontal scrollbar appears  
**And** all content fits within approximately 400px width  
**And** progress bars, pub names, and visit dates are fully visible  
**And** content does not overflow horizontally

#### Scenario: Location Type Icons Appear After Pub Name
**ADDED:**  
**Given** a pub named "The Crown" has isHotel: true  
**When** the pub is displayed in the sidebar  
**Then** the pub name "The Crown" is displayed first  
**And** the hotel icon 🏨 appears immediately after the name  
**And** the name and icon are on the same line  
**And** the name is the leftmost text element for easy scanning

#### Scenario: Multiple Location Type Icons Display After Name
**ADDED:**  
**Given** a pub named "Wetherspoons" has:
  - isHotel: true
  - inAirport: true  
**When** the pub is displayed in the sidebar  
**Then** the pub name "Wetherspoons" is displayed first  
**And** the hotel icon 🏨 appears after the name  
**And** the airport icon ✈️ appears after the hotel icon  
**And** all icons are grouped together after the name  
**And** icons do not interrupt the visual flow of scanning names
