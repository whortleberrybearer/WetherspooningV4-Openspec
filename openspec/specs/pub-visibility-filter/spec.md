# pub-visibility-filter Specification

## Purpose
TBD - created by archiving change add-closed-pubs-toggle. Update Purpose after archive.
## Requirements
### Requirement: Closed Pubs Toggle Control (REQ-PVF-001)
**Priority:** MUST  
**Category:** Functional

The system MUST provide a toggle control labeled "Show Closed Pubs" that allows users to show or hide closed pubs from the map and sidebar.

**Acceptance Criteria:**
- Toggle control is visible in the sidebar "Options" section
- Toggle label reads "Show Closed Pubs"
- Toggle is OFF by default (closed pubs are hidden from both map and sidebar)
- Toggle state is reactive and immediately updates the display
- Toggle control uses switch UI pattern (slide toggle)
- Toggle is accessible via keyboard (space/enter to toggle)
- Toggle has proper ARIA attributes for accessibility
- Label is associated with toggle for click activation

#### Scenario: Toggle Closed Pubs Visibility
**Given** the map is displayed with both open and closed pubs in the data  
**And** the "Show Closed Pubs" toggle is OFF  
**When** the user clicks the toggle to turn it ON  
**Then** previously hidden closed pub markers appear on the map with visual differentiation  
**And** previously hidden closed pubs appear in the sidebar  
**And** sidebar counts update to include closed pubs

#### Scenario: Hide Closed Pubs by Default
**Given** the application loads for the first time  
**And** the pub data contains both open and closed pubs  
**When** the map and sidebar render  
**Then** only open pubs are displayed  
**And** the "Show Closed Pubs" toggle is in the OFF state  
**And** sidebar counts reflect only open pubs

---

### Requirement: Filter Pubs by Open State (REQ-PVF-002)

The system MUST filter pubs based on their exact openState value, distinguishing between permanently closed and other non-open states.

**MODIFIED Acceptance Criteria:**
- Map markers for pubs with `openState === 'Closed'` (exact match) are hidden when toggle is OFF
- **REMOVED:** Case-insensitive "closed" matching
- **ADDED:** Pubs with states "Temporary Closed", "Reopening dd/MM/yyyy" are shown when toggle is OFF
- Pubs with states "Opening dd/MM/yyyy", "Opening Soon" are shown when toggle is OFF
- Sidebar displays pubs where `openState !== 'Closed'` when toggle is OFF
- Sidebar displays all pubs when toggle is ON
- Permanently closed pubs (openState === 'Closed') in sidebar (when shown) are visually differentiated
- **ADDED:** Non-open pubs (Temporary Closed, Reopening, Opening Soon) are visually differentiated from fully open pubs
- Pubs with `openState` set to "Open" are always shown when toggle is OFF
- Pubs without an `openState` field are treated as "Open" (fail-safe)
- Filter is applied client-side for immediate response
- Groups (countries/counties) with only permanently closed pubs are hidden when toggle is OFF

#### Scenario: Hide Only Permanently Closed Pubs
**Given** the pub data contains:
- 8 pubs with `openState === 'Open'`
- 2 pubs with `openState === 'Temporary Closed'`
- 1 pub with `openState === 'Reopening 15/03/2026'`
- 1 pub with `openState === 'Opening Soon'`
- 3 pubs with `openState === 'Closed'`
**And** the "Show Closed Pubs" toggle is OFF  
**When** the pubs are rendered  
**Then** 12 pubs (all except 'Closed') have markers on the map  
**And** 12 pubs are listed in the sidebar  
**And** the 3 permanently closed pubs are not visible

#### Scenario: Differentiate Non-Open States
**Given** the sidebar contains pubs with various openState values  
**And** the "Show Closed Pubs" toggle is OFF  
**When** the sidebar is rendered  
**Then** pubs with `openState === 'Open'` use normal styling  
**And** pubs with "Temporary Closed", "Reopening", or "Opening Soon" states use subtle differentiation (e.g., slight opacity reduction or muted text)  
**And** all non-permanently-closed pubs remain clearly visible and interactive

#### Scenario: Show All Pubs When Toggle ON
**Given** the pub data contains pubs with all state types  
**And** the "Show Closed Pubs" toggle is ON  
**When** the pubs are rendered  
**Then** all pubs including permanently closed are displayed  
**And** permanently closed pubs are visually differentiated with stronger muting

---

### Requirement: Visual Differentiation of Closed Pubs on Map (REQ-PVF-003)
**Priority:** MUST  
**Category:** Functional

The system MUST visually differentiate closed pub markers from open pub markers on the map when both are displayed.

**Acceptance Criteria:**
- Closed pub markers use a different visual style from open pub markers
- Visual differentiation is clear and easily distinguishable
- Differentiation could include: different color, opacity, icon, or styling
- Closed pub markers remain clickable and functional
- Visual styling is applied based on `openState` field
- Styling is consistent across all closed pub markers

#### Scenario: Apply Visual Differentiation to Closed Pub Markers
**Given** the "Show Closed Pubs" toggle is ON  
**And** the map contains both open and closed pubs  
**When** the map markers are rendered  
**Then** closed pub markers are visually differentiated from open pub markers  
**And** the visual difference is clearly noticeable  
**And** both marker types are clickable

#### Scenario: No Visual Differentiation When Closed Pubs Hidden
**Given** the "Show Closed Pubs" toggle is OFF  
**When** the map markers are rendered  
**Then** only open pub markers are displayed  
**And** no visual differentiation styling is needed

---

### Requirement: Visual Differentiation of Closed Pubs in Sidebar (REQ-PVF-004)
**Priority:** MUST  
**Category:** Functional

The system MUST visually differentiate closed pubs from open pubs in the sidebar using styling when toggle is ON.

**Acceptance Criteria:**
- Closed pubs are only shown in sidebar when toggle is ON
- When shown, closed pubs are displayed with reduced opacity (e.g., opacity-50)
- Closed pubs use muted text color (e.g., text-muted-foreground)
- Visual styling clearly indicates pub is closed
- Styling is consistent across all sidebar views
- Closed pubs remain clickable and functional
- Styling is applied based on `openState` field

#### Scenario: Apply Muted Styling to Closed Pubs
**Given** the sidebar contains both open and closed pubs  
**And** the "Show Closed Pubs" toggle is ON  
**When** the sidebar is rendered  
**Then** closed pubs are displayed with reduced opacity  
**And** closed pubs use a muted text color  
**And** open pubs use normal styling  
**And** the visual difference is clearly noticeable

#### Scenario: Closed Pubs Remain Interactive
**Given** a closed pub is displayed in the sidebar with muted styling  
**And** the "Show Closed Pubs" toggle is ON  
**When** the user clicks on the closed pub  
**Then** the pub selection event is triggered  
**And** the map pans to the pub's location  
**And** the closed pub button is still keyboard accessible

---

### Requirement: Update Map Markers Based on Filter (REQ-PVF-005)
**Priority:** MUST  
**Category:** Functional

The system MUST display map markers based on the visibility filter and apply visual differentiation to closed pubs when shown.

**Acceptance Criteria:**
- Map markers are created only for open pubs when toggle is OFF
- Map markers are created for all pubs when toggle is ON
- Closed pub markers have visual differentiation when toggle is ON
- When toggle changes state, markers are recreated to reflect new filter
- Existing info windows for filtered-out pubs are closed
- Map bounds/zoom do not change when toggling filter
- Marker creation uses the same logic as existing implementation

#### Scenario: Remove Markers When Hiding Closed Pubs
**Given** the map displays 15 markers (10 open, 5 closed with visual differentiation)  
**And** the "Show Closed Pubs" toggle is ON  
**When** the user turns the toggle OFF  
**Then** the 5 closed pub markers are removed from the map  
**And** only 10 open pub markers remain visible  
**And** any open info window for a closed pub is closed  
**And** the 5 closed pubs are removed from the sidebar

#### Scenario: Add Markers When Showing Closed Pubs
**Given** the map displays 10 markers (open pubs only)  
**And** the "Show Closed Pubs" toggle is OFF  
**When** the user turns the toggle ON  
**Then** 5 additional markers for closed pubs appear on the map with visual differentiation  
**And** all 15 pubs now have markers  
**And** markers are positioned correctly at pub coordinates  
**And** the sidebar now shows all 15 pubs with closed pubs styled differently

---

### Requirement: Update Sidebar Counts and Groups Based on Open State (REQ-PVF-006)
**Priority:** MUST  
**Category:** Functional

The system MUST update sidebar group counts and visibility based on the toggle state.

**Acceptance Criteria:**
- When toggle is ON: Country/county counts show format "X (Y closed)" when there are closed pubs
- When toggle is ON: If all pubs in a group are open, show simple count "X" without parentheses
- When toggle is OFF: Counts show only open pub count "X" (no parentheses or closed indication)
- When toggle is OFF: Groups with only closed pubs are hidden entirely
- When toggle is OFF: Groups with mixed open/closed pubs show only open count and open pubs
- Counts update immediately when toggle state changes
- Grouping and sorting remain consistent with existing behavior

#### Scenario: Display Total and Closed Counts When Toggle ON
**Given** England has 8 open pubs and 2 closed pubs  
**And** Greater Manchester (England) has 2 open pubs and 1 closed pub  
**And** the "Show Closed Pubs" toggle is ON  
**When** the sidebar renders  
**Then** England's count displays "10 (2 closed)"  
**And** Greater Manchester's count displays "3 (1 closed)"  
**And** all 10 pubs in England are visible in the sidebar

#### Scenario: Display Only Open Count When Toggle OFF
**Given** England has 8 open pubs and 2 closed pubs  
**And** the "Show Closed Pubs" toggle is OFF  
**When** the sidebar renders  
**Then** England's count displays "8" (open count only, no parentheses)  
**And** only the 8 open pubs are listed in the sidebar  
**And** the 2 closed pubs are not visible

#### Scenario: Hide Groups With Only Closed Pubs
**Given** a county has only closed pubs (3 closed, 0 open)  
**And** the "Show Closed Pubs" toggle is OFF  
**When** the sidebar renders  
**Then** the county is not displayed in the hierarchy  
**And** the county group is completely hidden

#### Scenario: Show Groups With Only Closed Pubs When Toggle ON
**Given** a county has only closed pubs (3 closed, 0 open)  
**And** the "Show Closed Pubs" toggle is ON  
**When** the sidebar renders  
**Then** the county is displayed in the hierarchy  
**And** the county shows a count of "3 (3 closed)"  
**And** expanding the county shows 3 pubs with muted styling

#### Scenario: Simplify Count Display When All Open
**Given** a county has only open pubs (5 open, 0 closed)  
**And** the "Show Closed Pubs" toggle is ON  
**When** the sidebar renders  
**Then** the county shows a count of "5" without any closed indication  
**And** all pubs display with normal styling

#### Scenario: Update Counts When Toggling State
**Given** England has 8 open pubs and 2 closed pubs  
**And** the "Show Closed Pubs" toggle is ON  
**And** England's count displays "10 (2 closed)"  
**And** all 10 pubs are visible in the sidebar  
**When** the user turns the toggle OFF  
**Then** England's count updates to "8" (open count only)  
**And** the sidebar now shows only 8 open pubs  
**And** the 2 closed pubs are removed from the sidebar

---

### Requirement: Maintain Filter State During Navigation (REQ-PVF-007)
**Priority:** MUST  
**Category:** Functional

The system MUST maintain the toggle state while the user navigates and interacts with the map.

**Acceptance Criteria:**
- Toggle state persists when selecting pubs from sidebar
- Toggle state persists when clicking map markers
- Toggle state persists when panning/zooming the map
- Toggle state does NOT persist across page refreshes (future enhancement)

#### Scenario: Preserve Filter During Pub Selection
**Given** the "Show Closed Pubs" toggle is OFF  
**And** the map displays only open pub markers  
**And** the sidebar displays only open pubs  
**When** the user selects a pub from the sidebar  
**And** the map pans to that pub's location  
**Then** the toggle remains OFF  
**And** only open pubs continue to have markers on the map  
**And** the sidebar continues to show only open pubs  
**And** the filter state is unchanged

### Requirement: Pub Count Statistics (REQ-PVF-008)

**Priority:** MUST  
**Category:** Functional

The system MUST calculate and display accurate pub counts that reflect operational status.

**Acceptance Criteria:**
- "Total Pubs" count includes all pubs where `openState !== 'Closed'`
- "that are now closed" count includes only pubs where `openState === 'Closed'` (exact match)
- Counts update reactively when toggle state changes
- Counts reflect current filter state (toggle ON shows all pubs in counts)
- Country and county group counts exclude permanently closed pubs when toggle is OFF
- Country and county group counts include all pubs when toggle is ON

#### Scenario: Calculate Total Pubs Excluding Permanently Closed
**Given** the database contains:
- 850 pubs with `openState === 'Open'`
- 15 pubs with `openState === 'Temporary Closed'`
- 8 pubs with `openState === 'Reopening 15/03/2026'`
- 5 pubs with `openState === 'Opening Soon'`
- 22 pubs with `openState === 'Closed'`
**When** the statistics are calculated  
**Then** "Total Pubs" displays 878 (850 + 15 + 8 + 5)  
**And** pubs with `openState === 'Closed'` are excluded from total

#### Scenario: Calculate "that are now closed" Count
**Given** a user has visited 120 pubs total  
**And** 15 of those visited pubs now have `openState === 'Closed'`
**And** 3 of those visited pubs have `openState === 'Temporary Closed'`  
**When** the "that are now closed" statistic is calculated  
**Then** it displays 15 (only permanently closed)  
**And** temporarily closed visited pubs are not counted

---

