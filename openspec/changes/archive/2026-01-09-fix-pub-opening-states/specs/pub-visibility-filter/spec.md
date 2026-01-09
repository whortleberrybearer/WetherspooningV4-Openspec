# pub-visibility-filter Spec Delta

## MODIFIED Requirements

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

## ADDED Requirements

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

## MODIFIED Visual Differentiation

### Requirement: Visual Differentiation of Closed Pubs in Sidebar (REQ-PVF-004)

The system MUST visually differentiate pubs based on their opening state with appropriate styling intensity.

**MODIFIED Acceptance Criteria:**
- **ADDED:** Pubs with `openState !== 'Open'` and `openState !== 'Closed'` receive subtle visual differentiation when shown
- Temporarily closed, reopening, and opening soon pubs use lighter opacity reduction (e.g., opacity-75) than permanently closed (opacity-50)
- Permanently closed pubs are only shown when toggle is ON
- All non-open states remain clickable and functional
- State is determined by exact `openState` value, not pattern matching

#### Scenario: Differentiate Temporarily Closed Pubs
**Given** a pub with `openState === 'Temporary Closed'` is in the sidebar  
**And** the "Show Closed Pubs" toggle is OFF  
**When** the sidebar is rendered  
**Then** the pub is visible in the list  
**And** the pub has opacity-75 styling  
**And** the pub uses muted text color  
**And** the pub is clearly distinguishable from fully open pubs

---

## Cross-References
This delta impacts:
- `scheduled-data-sync` - requires accurate openState values
- `pub-detail-sheet` - state badges must match filtered states
- `enhanced-infowindow-display` - infowindow should show state badges
