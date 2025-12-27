# pub-navigation-sidebar Specification Delta

## MODIFIED Requirements

### Requirement: Sidebar Display (REQ-PNS-001)
**Priority:** MUST  
**Category:** Functional

**Changes:**
- ADD: Display visit progress for authenticated users
- ADD: Show visited/total count per group
- UPDATE: Group counts now include visit information when user is authenticated

**Updated Acceptance Criteria:**
- Sidebar displays all pubs from the data source
- Pubs are grouped first by country, then by county
- Countries are sorted alphabetically
- Counties within each country are sorted alphabetically
- Pubs within each county are sorted alphabetically by town/city
- Each grouping level shows the count of pubs it contains
- **NEW:** When user is authenticated, each group shows visit progress in format "Visited X/Y"
- **NEW:** When user is not authenticated, groups show only total count "(Y pubs)"
- **NEW:** Visit counts respect the "Show Closed Pubs" filter (only count visible pubs)

#### Scenario: View Sidebar with Visit Progress When Authenticated
**Given** the user is authenticated  
**And** has visited 3 out of 10 Greater Manchester pubs  
**And** has visited 1 out of 5 London pubs  
**When** the sidebar is displayed  
**Then** the Greater Manchester group shows "Visited 3/10"  
**And** the London group shows "Visited 1/5"  
**And** the England country group shows "Visited 4/15"

#### Scenario: View Sidebar Without Visit Progress When Not Authenticated
**Given** the user is not authenticated  
**When** the sidebar is displayed  
**Then** country groups show only total count "(15 pubs)"  
**And** county groups show only total count "(10 pubs)"  
**And** no visit information is displayed

#### Scenario: Visit Counts Update After Login
**Given** the sidebar is displayed for an unauthenticated user  
**And** groups show only total counts  
**When** the user logs in  
**And** visit data is loaded  
**Then** all group displays update to show "Visited X/Y" format  
**And** the counts reflect the user's actual visits

#### Scenario: Visit Counts Clear After Logout
**Given** the user is authenticated  
**And** the sidebar shows visit progress for all groups  
**When** the user logs out  
**Then** group displays revert to showing only total counts "(Y pubs)"  
**And** no visit information is shown

#### Scenario: Visit Counts Respect Closed Pubs Filter
**Given** the user is authenticated  
**And** a county has 10 total pubs (7 open, 3 closed)  
**And** the user has visited 2 open pubs and 1 closed pub  
**And** "Show Closed Pubs" toggle is OFF  
**When** the sidebar is displayed  
**Then** the county group shows "Visited 2/7"  
**And** the closed pub is excluded from both visited and total counts  
**When** the toggle is turned ON  
**Then** the county group shows "Visited 3/10"  
**And** the closed visited pub is included in the count

---

## ADDED Requirements

### Requirement: Visit Progress Indicators (REQ-PNS-008)
**Priority:** MUST  
**Category:** Functional

The system MUST provide visual indicators for visit progress in addition to text counts.

**Acceptance Criteria:**
- Visit progress text appears in "Visited X/Y" format
- Text uses muted color to avoid visual clutter
- Checkmark icon (✓) appears before "Visited" text when at least one pub is visited
- Progress is calculated dynamically based on current filter state
- Progress updates immediately when visit data changes

#### Scenario: Display Visited Checkmark for Groups with Visits
**Given** the user is authenticated  
**And** a county group has 3 visited pubs out of 10  
**When** the sidebar displays the county  
**Then** a checkmark icon appears before the visit count  
**And** the text reads "✓ Visited 3/10"  
**And** the text is styled with muted color

#### Scenario: No Checkmark for Groups with No Visits
**Given** the user is authenticated  
**And** a county group has 0 visited pubs out of 10  
**When** the sidebar displays the county  
**Then** no checkmark icon is shown  
**And** the text reads "Visited 0/10"

#### Scenario: 100% Completion Indication
**Given** the user has visited all pubs in a county (10/10)  
**When** the sidebar displays the county  
**Then** the visit count shows "✓ Visited 10/10"  
**And** the text may use success color (green) to indicate completion  
**And** the visual treatment celebrates the achievement

---

## MODIFIED Requirements

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
