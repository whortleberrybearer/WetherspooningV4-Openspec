# pub-navigation-sidebar Specification

## Purpose
TBD - created by archiving change add-pub-navigation-sidebar. Update Purpose after archive.
## Requirements
### Requirement: Sidebar Display (REQ-PNS-001)
**Priority:** MUST  
**Category:** Functional

**Changes:**
- MODIFY: Display "Unknown" for missing country in grouping hierarchy

The system SHALL display "Unknown" as a country group when pubs have null, undefined, or empty string country fields, ensuring all pubs are visible in the sidebar hierarchy.

**Updated Acceptance Criteria:**
- Sidebar displays all pubs from the data source
- Pubs are grouped first by country, then by county
- **MODIFIED:** Country grouping SHALL use "Unknown" for null, undefined, or empty country values
- Countries are sorted alphabetically
- Counties within each country are sorted alphabetically
- Pubs within each county are sorted alphabetically by town/city
- Each grouping level shows the count of pubs it contains

#### Scenario: Group Pubs with Missing Country
**ADDED:**
**Given** some pubs in the data have null or undefined country fields
**When** the sidebar is displayed
**Then** those pubs appear in an "Unknown" country group
**And** the "Unknown" group is sorted alphabetically with other countries
**And** pubs within "Unknown" are still grouped by county
**And** all pubs are visible in the sidebar

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
- A toggle button is visible when sidebar is collapsed or expanded
- Toggle button is positioned floating over the map at top-left
- Clicking toggle button opens the sidebar when closed
- Clicking toggle button closes the sidebar when open
- Sidebar fully hides when collapsed (no icon-only state)
- Sidebar state persists during user session
- Opening/closing is animated smoothly
- Sidebar has fixed width (approximately 352px on desktop)
- Toggle button remains accessible when sidebar is expanded

#### Scenario: Open Sidebar via Toggle Button
**Given** the sidebar is collapsed (fully hidden)  
**And** the map is displayed  
**And** a toggle button is visible at the top-left corner  
**When** the user clicks the toggle button  
**Then** the sidebar slides into view from the left  
**And** the sidebar displays the pub list  
**And** the toggle button remains visible and functional

#### Scenario: Close Sidebar via Toggle Button
**Given** the sidebar is open  
**When** the user clicks the toggle button  
**Then** the sidebar slides out of view to the left  
**And** the sidebar fully disappears from view  
**And** the toggle button remains visible  
**And** the map remains fully functional

#### Scenario: Persistent Sidebar Width
**Given** the sidebar is displayed on desktop  
**When** the sidebar opens  
**Then** the sidebar has a fixed width of approximately 352 pixels  
**And** the width is consistent across interactions

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

**Changes:**
- ADD: Visit count calculations must not impact grouping performance
- ADD: Visit lookups must be optimized for large pub lists

**Updated Acceptance Criteria:**
- Grouping logic completes in under 100ms for 100 pubs
- Expanding/collapsing groups is instant (no lag)
- Sidebar rendering does not block map interactions
- Memory usage is minimal (no duplicate data structures)
- **NEW:** Visit count calculation adds less than 10ms overhead per group
- **NEW:** Visit status lookups use O(1) Set-based implementation
- **NEW:** Changing filter state recalculates counts within 50ms

#### Scenario: Fast Visit Count Calculation
**Given** a country group contains 50 pubs across multiple counties  
**And** the user is authenticated with visit data loaded  
**When** the country group is expanded  
**Then** visit counts for all county sub-groups are calculated  
**And** the calculation completes within 10ms total  
**And** the sidebar remains responsive

#### Scenario: Efficient Filter State Changes
**Given** the sidebar is displaying visit counts for all groups  
**When** the user toggles "Show Closed Pubs" OFF  
**Then** all visit counts recalculate to exclude closed pubs  
**And** the recalculation completes within 50ms  
**And** the UI updates smoothly without lag

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

### Requirement: Visit Progress Indicators (REQ-PNS-008)
**Priority:** MUST  
**Category:** Functional

The system MUST provide visual progress indicators showing visit completion for country and county groups when user is authenticated.

**Acceptance Criteria:**
- Visit progress is displayed as a horizontal progress bar when user is authenticated
- Progress bar shows percentage: (visited / total) * 100
- Progress bar appears next to group name with fraction text ("X/Y")
- Progress bar has minimum width (approximately 100px) to ensure visibility
- Progress bar is styled subtly (approximately 2px height)
- Progress is calculated dynamically based on current filter state
- Progress updates immediately when visit data changes
- When user is not authenticated, simple pub count is shown instead

#### Scenario: Display Progress Bar for Country with Visits
**Given** the user is authenticated  
**And** England has 15 visited pubs out of 50 total  
**When** the country group is displayed in the sidebar  
**Then** a progress bar appears showing 30% completion  
**And** the progress bar is filled with green color  
**And** the text "15/50" appears next to the progress bar  
**And** the progress bar is approximately 100px wide

#### Scenario: Display Progress Bar for County
**Given** the user is authenticated  
**And** Greater Manchester has 8 visited pubs out of 12 total  
**When** the county group is displayed  
**Then** a progress bar shows 67% completion  
**And** the text "8/12" appears next to the progress bar

#### Scenario: 0% Progress Display
**Given** the user is authenticated  
**And** a county has 0 visited pubs out of 10  
**When** the county is displayed  
**Then** a progress bar shows 0% (empty, no fill)  
**And** the text "0/10" appears next to it

#### Scenario: 100% Completion Display
**Given** the user has visited all pubs in a county (12/12)  
**When** the county is displayed  
**Then** the progress bar shows 100% completion (fully filled)  
**And** the text "12/12" appears

#### Scenario: No Progress Bar When Not Authenticated
**Given** the user is not authenticated  
**When** country or county groups are displayed  
**Then** no progress bars are shown  
**And** only simple pub counts are displayed (e.g., "50")

#### Scenario: Progress Updates When Filter Changes
**Given** the user is authenticated  
**And** a county shows "8/12" with 67% progress bar  
**And** 2 of the 12 pubs are closed  
**When** the user toggles "Show Closed Pubs" OFF  
**Then** the progress recalculates to exclude closed pubs  
**And** the progress bar updates within 50ms  
**And** the new fraction reflects only open pubs (e.g., "8/10")
---

### Requirement: Visit Tracking Permissions (REQ-PNS-010)
**Priority:** MUST
**Category:** Functional

**Changes:**
- REMOVED: Inline visit tracking buttons from sidebar pub list
- Visit tracking is now exclusively handled via the pub detail sheet

The system SHALL display visit status (checkmark and date) for visited pubs in the sidebar when user is authenticated, but SHALL NOT provide inline buttons to add visits. Visit tracking actions are handled through the pub detail sheet.

**Updated Acceptance Criteria:**
- Visit status indicator (checkmark and date) is shown for visited pubs when authenticated
- Visit status is hidden when user is not authenticated
- No inline "Mark as Visited" button is displayed in the sidebar
- Visit tracking actions are performed via the pub detail sheet only

#### Scenario: Display Visit Status for Authenticated User
**Given** the user is authenticated
**And** the user has visited pub 42 on 2025-11-15
**When** the sidebar displays pub 42
**Then** a checkmark icon and visit date "15/11/25" are shown
**And** no "Mark as Visited" button is displayed

#### Scenario: Hide Visit Status When Not Authenticated
**Given** the user is not authenticated
**And** the sidebar is displaying pub 42
**When** the sidebar renders
**Then** no visit status indicator is displayed
**And** no visit tracking controls are shown

#### Scenario: Visit Tracking via Detail Sheet
**Given** the user wants to track a visit to a pub
**When** the user clicks on the pub in the sidebar
**Then** the pub detail sheet opens
**And** the detail sheet provides visit tracking controls

### Requirement: Visit Statistics Summary (REQ-PNS-011)
**Priority:** MUST  
**Category:** Functional

The system MUST display a summary of the user's overall visit statistics in the sidebar at the top of the content area when authenticated.

**Acceptance Criteria:**
- Statistics section displays at the top of sidebar content, above Options section
- Statistics show two cards displayed side by side:
  - "Total Visited" card showing total visited pubs (including closed ones)
  - "Not Visited" card showing open pubs not yet visited
- Total Visited card includes subtext showing count of visited pubs that are now closed
- Not Visited card includes subtext showing total count of open pubs
- Statistics are independent of "Show Closed Pubs" filter state
- Statistics are hidden when user is not authenticated
- Statistics update in real-time when:
  - A visit is added or removed
  - User logs in or out
- Cards use dashboard-style formatting with borders, shadows, and large bold numbers
- Display is compact and visually prominent
- Performance impact is negligible (calculation under 10ms)

#### Scenario: Display Overall Visit Statistics for Authenticated User
**Given** the user is authenticated  
**And** there are 150 total pubs (10 closed, 140 open)
**And** the user has visited 45 pubs total (5 that are now closed, 40 open)  
**When** the sidebar is displayed  
**Then** the statistics section shows two cards at the top:  
  - Total Visited card: "45" with subtext "5 that are now closed"  
  - Not Visited card: "100" with subtext "140 Total Pubs"  
**And** the statistics appear above the Options section

#### Scenario: Statistics Exclude Closed Pubs from Not Visited Count
**Given** the user is authenticated  
**And** there are 150 total pubs (10 closed, 140 open)  
**And** the user has visited 45 pubs (5 closed, 40 open)  
**And** there are 5 closed pubs not yet visited
**When** the sidebar displays statistics  
**Then** the Not Visited card shows "100" (140 open - 40 visited)  
**And** the Total Pubs subtext shows "140 Total Pubs" (excludes all closed)  
**And** closed unvisited pubs are not counted

#### Scenario: Statistics Independent of Closed Pubs Filter
**Given** the user is authenticated  
**And** the statistics show "Total Visited: 45" and "Not Visited: 100"  
**And** "Show Closed Pubs" toggle is OFF  
**When** the user toggles "Show Closed Pubs" ON  
**Then** the statistics remain unchanged  
**And** Total Visited still shows 45 (including the 5 closed)  
**And** Not Visited still shows 100  
**And** the filter only affects the pub listings, not the statistics

#### Scenario: Statistics Update When Visit Added
**Given** the sidebar displays statistics showing:  
  - "Total Visited: 45"  
  - "Not Visited: 100"  
**When** the user marks an open pub as visited  
**And** the visit is successfully saved  
**Then** the statistics update within 50ms to show:  
  - "Total Visited: 46"  
  - "Not Visited: 99"  
**And** the update is smooth without flicker

#### Scenario: Statistics Update When Visit Removed
**Given** the sidebar displays statistics showing:  
  - "Total Visited: 46"  
  - "Not Visited: 99"  
**When** the user removes a visit for an open pub  
**And** the removal is successful  
**Then** the statistics update to show:  
  - "Total Visited: 45"  
  - "Not Visited: 100"

#### Scenario: Hide Statistics for Unauthenticated Users
**Given** the user is not authenticated  
**When** the sidebar is displayed  
**Then** the visit statistics section is not shown  
**And** the Options section appears at the top of the sidebar content  
**And** no visit-related data is calculated

#### Scenario: Show Statistics After Login
**Given** the user is not authenticated  
**And** the sidebar shows no statistics  
**When** the user logs in successfully  
**And** visit data is loaded  
**Then** the statistics section appears at the top of the sidebar  
**And** displays the user's visit progress  
**And** the Options section moves below the statistics section

#### Scenario: Hide Statistics After Logout
**Given** the user is authenticated  
**And** the statistics section is displayed  
**When** the user logs out  
**Then** the statistics section disappears  
**And** the Options section moves to the top  
**And** visit data is cleared

#### Scenario: Display Zero Visits Correctly
**Given** the user is authenticated  
**And** the user has not visited any pubs  
**And** there are 140 open pubs  
**When** the sidebar is displayed  
**Then** the statistics show:  
  - Total Visited: "0" with subtext "0 that are now closed"  
  - Not Visited: "140" with subtext "140 Total Pubs"

#### Scenario: Display All Open Pubs Visited
**Given** the user is authenticated  
**And** the user has visited all 140 open pubs  
**And** 5 of those visited pubs are now closed  
**When** the sidebar is displayed  
**Then** the statistics show:  
  - Total Visited: "145" with subtext "5 that are now closed"  
  - Not Visited: "0" with subtext "140 Total Pubs"

#### Scenario: Statistics Calculation Performance
**Given** the sidebar contains 1000 pubs  
**And** the user is authenticated with 300 visits  
**When** the statistics are calculated  
**Then** the calculation completes in under 10ms  
**And** the sidebar remains responsive  
**And** no UI lag is perceptible

#### Scenario: Closed Visited Pubs Tracked in Subtext
**Given** the user is authenticated  
**And** the user has visited 50 pubs total  
**And** 8 of those visited pubs have since closed  
**When** the statistics are displayed  
**Then** the Total Visited card shows "50"  
**And** the subtext shows "8 that are now closed"  
**And** the closed count updates if pub status changes

---

