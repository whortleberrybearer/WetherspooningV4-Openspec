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

### Requirement: Visit Tracking Actions (REQ-PNS-009)
**Priority:** MUST
**Category:** Functional

The system MUST provide UI controls in the pub sidebar for tracking visits.

**Acceptance Criteria:**
- When pub is not visited, display "Mark as Visited" button
- When pub is visited, display visit details section with:
  - Visit date (editable via date picker)
  - Notes field (optional, editable)
  - "Remove Visit" button
- "Mark as Visited" button triggers `addVisit()` with default date
- Date picker allows selecting past dates or clearing date (unknown)
- Date defaults to today when marking as visited
- "Remove Visit" button shows confirmation dialog before deletion
- All mutations show loading state while in progress
- All mutations display error messages on failure
- All mutations update UI immediately on success

#### Scenario: Display Mark as Visited Button
**Given** the sidebar is displaying pub 42
**And** the user has not visited pub 42
**When** the sidebar renders
**Then** a "Mark as Visited" button is displayed
**And** no visit details section is shown

#### Scenario: Mark Pub as Visited with Default Date
**Given** the sidebar is displaying pub 42
**And** pub 42 is not visited
**And** today is 2025-12-29
**When** the user clicks "Mark as Visited"
**Then** `addVisit(42)` is called with no date parameter
**And** the button shows loading state
**And** when the operation succeeds, visit details section appears
**And** the visit date displays 2025-12-29

#### Scenario: Display Visit Details Section
**Given** the sidebar is displaying pub 42
**And** the user visited pub 42 on 2025-11-15
**When** the sidebar renders
**Then** a visit details section is displayed showing:
  - Visit date: 2025-11-15 (with edit icon)
  - Notes field (empty or with existing notes)
  - "Remove Visit" button
**And** the "Mark as Visited" button is not shown

#### Scenario: Edit Visit Date
**Given** the sidebar shows visit details for pub 42 with date 2025-11-15
**When** the user clicks the edit date icon
**Then** a date picker opens
**When** the user selects 2025-12-01
**Then** `updateVisit(42, { visitedAt: '2025-12-01T00:00:00Z' })` is called
**And** the date picker shows loading state
**And** when the operation succeeds, the displayed date updates to 2025-12-01

#### Scenario: Clear Visit Date
**Given** the sidebar shows visit details for pub 42 with a date
**When** the user opens the date picker
**And** clicks "Clear" or removes the date
**Then** `updateVisit(42, { visitedAt: undefined })` is called
**And** when the operation succeeds, the date displays as "Date unknown"

#### Scenario: Add Visit Notes
**Given** the sidebar shows visit details for pub 42
**And** the notes field is empty
**When** the user types "Great atmosphere!" in the notes field
**And** blurs the field or presses Enter
**Then** `updateVisit(42, { notes: 'Great atmosphere!' })` is called
**And** when the operation succeeds, the notes are saved

#### Scenario: Remove Visit with Confirmation
**Given** the sidebar shows visit details for pub 42
**When** the user clicks "Remove Visit"
**Then** a confirmation dialog appears with message:
  - "Remove this visit? This action cannot be undone."
  - "Cancel" button
  - "Remove" button (destructive style)
**When** the user clicks "Remove"
**Then** `removeVisit(42)` is called
**And** the dialog shows loading state
**And** when the operation succeeds:
  - The dialog closes
  - Visit details section disappears
  - "Mark as Visited" button appears

#### Scenario: Cancel Remove Visit
**Given** the remove visit confirmation dialog is open
**When** the user clicks "Cancel"
**Then** the dialog closes
**And** no `removeVisit()` call is made
**And** the visit details remain unchanged

#### Scenario: Display Error on Failed Mutation
**Given** the sidebar is displaying pub 42
**When** the user clicks "Mark as Visited"
**And** the `addVisit()` operation fails with network error
**Then** an error message is displayed: "Unable to save visit. Please try again."
**And** the button returns to normal state
**And** the pub remains unvisited in the UI

---

### Requirement: Visit Tracking Permissions (REQ-PNS-010)
**Priority:** MUST
**Category:** Functional

The system MUST only show visit tracking controls to authenticated users.

**Acceptance Criteria:**
- Visit tracking buttons are hidden when user is not authenticated
- Attempting to track a visit while unauthenticated shows login prompt
- Visit details section is hidden for unauthenticated users even if pub was visited (by this user before logout)

#### Scenario: Hide Visit Tracking When Not Authenticated
**Given** the user is not authenticated
**And** the sidebar is displaying pub 42
**When** the sidebar renders
**Then** no "Mark as Visited" button is displayed
**And** no visit details section is shown
**And** a message may indicate "Sign in to track visits" (optional)

#### Scenario: Show Visit Tracking After Login
**Given** the user is not authenticated
**And** the sidebar is displaying pub 42 with no visit controls
**When** the user signs in
**And** the user has previously visited pub 42
**Then** the visit details section appears
**And** shows the user's visit date and notes

