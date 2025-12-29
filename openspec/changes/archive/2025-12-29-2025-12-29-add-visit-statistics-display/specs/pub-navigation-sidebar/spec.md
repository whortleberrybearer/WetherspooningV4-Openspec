# Spec Delta: pub-navigation-sidebar

## ADDED Requirements

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

## MODIFIED Requirements

None

---

## REMOVED Requirements

None
