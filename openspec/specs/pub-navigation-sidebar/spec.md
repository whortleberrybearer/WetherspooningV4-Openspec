# pub-navigation-sidebar Specification

## Purpose
TBD - created by archiving change add-pub-navigation-sidebar. Update Purpose after archive.
## Requirements
### Requirement: Sidebar Display (REQ-PNS-001)
**Priority:** MUST  
**Category:** Functional

The system MUST display a sidebar showing all pub locations in a hierarchical structure organized by country, then county.

**Acceptance Criteria:**
- Sidebar displays all pubs from the data source
- Pubs are grouped first by country, then by county
- Countries are sorted alphabetically
- Counties within each country are sorted alphabetically
- Pubs within each county are sorted alphabetically by town/city
- Each grouping level shows the count of pubs it contains

#### Scenario: View Sidebar with Multiple Countries
**Given** the pub data includes pubs from England, Scotland, and Wales  
**When** the sidebar is displayed  
**Then** countries appear in alphabetical order (England, Scotland, Wales)  
**And** each country shows the total number of pubs in that country  
**And** counties within each country are sorted alphabetically  
**And** each county shows the number of pubs in that county

#### Scenario: View Pubs Within County
**Given** a county group contains multiple pubs  
**When** the county is expanded  
**Then** pubs are displayed sorted alphabetically by town/city  
**And** each pub shows its name and town/city

---

### Requirement: Group Expansion (REQ-PNS-002)
**Priority:** MUST  
**Category:** Functional

The system MUST allow users to expand and collapse country and county groups independently.

**Acceptance Criteria:**
- Country groups can be expanded to show their counties
- Country groups can be collapsed to hide their counties
- County groups can be expanded to show their pubs
- County groups can be collapsed to hide their pubs
- Expanding/collapsing one group does not affect other groups
- Visual indicator (chevron) shows current state (collapsed → vs expanded ↓)

#### Scenario: Expand Country Group
**Given** the sidebar displays countries  
**And** a country group is collapsed  
**When** the user clicks on the country  
**Then** the country expands to show its counties  
**And** the chevron icon rotates to indicate expanded state  
**And** other country groups remain in their current state

#### Scenario: Collapse County Group
**Given** a county group is expanded showing pubs  
**When** the user clicks on the county  
**Then** the county collapses to hide its pubs  
**And** the chevron icon rotates to indicate collapsed state  
**And** the parent country group remains expanded

---

### Requirement: Sidebar Toggle (REQ-PNS-003)
**Priority:** MUST  
**Category:** Functional

The system MUST provide a way to open and close the sidebar.

**Acceptance Criteria:**
- A burger menu button is visible when sidebar is closed
- Clicking burger menu opens the sidebar
- Sidebar includes a close button
- Clicking close button hides the sidebar
- Sidebar state persists during user session
- Opening/closing is animated smoothly

#### Scenario: Open Sidebar via Burger Menu
**Given** the sidebar is closed  
**And** the map is displayed  
**When** the user clicks the burger menu button  
**Then** the sidebar slides into view from the left  
**And** the sidebar displays the pub list  
**And** the burger menu button remains visible

#### Scenario: Close Sidebar via Close Button
**Given** the sidebar is open  
**When** the user clicks the close button in the sidebar header  
**Then** the sidebar slides out of view to the left  
**And** the burger menu button remains visible  
**And** the map remains fully functional

---

### Requirement: Pub Selection (REQ-PNS-004)
**Priority:** MUST  
**Category:** Functional

The system MUST allow users to select a pub from the sidebar to view it on the map.

**Acceptance Criteria:**
- Pubs in the sidebar are clickable
- Clicking a pub focuses the map on that pub's location
- The map displays the pub's info window after selection
- Pub selection works regardless of current map zoom/position
- Visual feedback indicates clickable pub items (hover state)

#### Scenario: Select Pub from Sidebar
**Given** the sidebar is open  
**And** a county group is expanded showing pubs  
**When** the user clicks on a specific pub  
**Then** the map pans to center on that pub's marker  
**And** the pub's info window opens showing pub details  
**And** the info window remains visible until dismissed or another pub is selected

#### Scenario: Select Distant Pub
**Given** the map is currently viewing London area  
**And** the user has the sidebar open  
**When** the user clicks a pub in Edinburgh  
**Then** the map pans and adjusts zoom to show Edinburgh  
**And** the selected pub's marker is centered and visible  
**And** the info window opens for the Edinburgh pub

---

### Requirement: Mobile Responsiveness (REQ-PNS-005)
**Priority:** MUST  
**Category:** Non-Functional

The sidebar MUST be fully functional and optimized for mobile devices.

**Acceptance Criteria:**
- Sidebar overlays the map on mobile devices
- Semi-transparent backdrop appears behind sidebar on mobile
- Tapping backdrop closes the sidebar on mobile
- Sidebar width is appropriate for mobile screens (80% max)
- Touch interactions work for expanding/collapsing groups
- Burger menu button is touch-friendly (44x44px minimum)

#### Scenario: Use Sidebar on Mobile Device
**Given** the user accesses the site on a mobile device (screen width < 768px)  
**When** the user taps the burger menu button  
**Then** the sidebar opens and overlays the map  
**And** a semi-transparent backdrop appears behind the sidebar  
**And** tapping the backdrop closes the sidebar  
**And** the sidebar is scrollable if content exceeds viewport height

---

### Requirement: Performance (REQ-PNS-006)
**Priority:** MUST  
**Category:** Non-Functional

The sidebar MUST group and display pubs efficiently without impacting map performance.

**Acceptance Criteria:**
- Grouping logic completes in under 100ms for 100 pubs
- Expanding/collapsing groups is instant (no lag)
- Sidebar rendering does not block map interactions
- Memory usage is minimal (no duplicate data structures)

#### Scenario: Fast Sidebar Rendering
**Given** the pub data contains 15+ pubs across multiple countries  
**When** the sidebar is opened for the first time  
**Then** all groups are calculated and rendered within 100ms  
**And** the map remains responsive during sidebar initialization  
**And** subsequent opens/closes are instant

---

### Requirement: Accessibility (REQ-PNS-007)
**Priority:** MUST  
**Category:** Non-Functional

The sidebar MUST be accessible to users with disabilities.

**Acceptance Criteria:**
- All interactive elements are keyboard accessible
- Burger menu and close buttons have ARIA labels
- Screen readers announce group counts correctly
- Focus is visible on all interactive elements
- Tab order follows logical hierarchy (country → county → pub)

#### Scenario: Navigate Sidebar with Keyboard
**Given** the user is using keyboard navigation  
**When** the user tabs through the sidebar  
**Then** focus moves in logical order through groups and pubs  
**And** pressing Enter/Space on a group expands/collapses it  
**And** pressing Enter/Space on a pub selects it  
**And** all focused elements have visible focus indicators

---

