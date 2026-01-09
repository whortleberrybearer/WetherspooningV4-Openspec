# scheduled-data-sync Spec Delta

## MODIFIED Requirements

### Requirement: Full Sync Execution (REQ-SDS-003)

The system MUST extract pub data from individual pub pages including opening state, with support for reopening dates.

**MODIFIED Acceptance Criteria:**
- Open state is extracted from `<p class="open-status">` element with logic for "Opening soon", "Closed temporarily", "Reopening", or "Open"
- For "Opening soon" status, extract opening date from sibling `<p class="opening-closing-time">` and format as "Opening dd/MM/yyyy"
- **ADDED:** For "Reopening" status (detected in sibling `<p class="opening-closing-time">`), extract date and format as "Reopening dd/MM/yyyy"
- For "Closed temporarily" status, set as "Temporary Closed"
- Default to "Open" for all other cases

#### Scenario: Extract Reopening State with Date
**Given** a pub page with `<p class="open-status is-style-highlight-red">` containing "Closed"  
**And** a sibling `<p class="opening-closing-time">` containing "Reopening Monday 12 January 2026"  
**When** the scraper extracts the pub data  
**Then** the `openState` is set to "Reopening 12/01/2026"  
**And** the date format is dd/MM/yyyy  

#### Scenario: Extract Reopening State Without Valid Date
**Given** a pub page with text indicating "Reopening" but no parseable date  
**When** the scraper attempts to extract the opening state  
**Then** the `openState` is set to "Reopening dd/MM/yyyy" with a fallback date or "Unknown" if date parsing fails  

#### Scenario: Extract Opening Soon with Date (Existing)
**Given** a pub page with `<p class="open-status">` containing "Opening soon"  
**And** a sibling `<p class="opening-closing-time">` containing a valid date  
**When** the scraper extracts the pub data  
**Then** the `openState` is formatted as "Opening dd/MM/yyyy"

#### Scenario: Extract Temporarily Closed State (Existing)
**Given** a pub page with `<p class="open-status">` containing "Closed temporarily"  
**When** the scraper extracts the pub data  
**Then** the `openState` is set to "Temporary Closed"

---

## MODIFIED Data Model

### ScrapedPubData Interface
**Field:** `openState: string`

**Valid Values:**
- `"Open"` - Pub is currently open
- `"Closed"` - Pub is permanently closed
- `"Temporary Closed"` - Pub is temporarily closed (no reopening date)
- `"Opening dd/MM/yyyy"` - New pub opening on specific date
- **ADDED:** `"Reopening dd/MM/yyyy"` - Temporarily closed pub reopening on specific date
- `"Opening Soon"` - New pub opening soon (no specific date)
- `"Unknown"` - State could not be determined

---

## Cross-References
This delta impacts:
- `pub-visibility-filter` - filtering logic must handle new "Reopening" states
- `pub-detail-sheet` - display logic must show new state badges
