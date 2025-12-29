# Spec Delta: pub-navigation-sidebar

## ADDED Requirements

### Requirement: Visit Statistics Summary (REQ-PNS-011)
**Priority:** MUST  
**Category:** Functional

The system MUST display a summary of the user's overall visit statistics in the sidebar header when authenticated.

**Acceptance Criteria:**
- Statistics section displays below user menu and above closed pubs toggle
- Statistics show three key metrics:
  - Number of visited pubs
  - Number of remaining pubs to visit
  - Percentage of pubs visited
- Statistics adapt to "Show Closed Pubs" filter state
- Statistics are hidden when user is not authenticated
- Statistics update in real-time when:
  - A visit is added or removed
  - The closed pubs filter is toggled
  - User logs in or out
- Display is compact and doesn't dominate sidebar header
- Visual styling is consistent with existing progress indicators
- Performance impact is negligible (calculation under 10ms)

#### Scenario: Display Overall Visit Statistics for Authenticated User
**Given** the user is authenticated  
**And** the user has visited 45 out of 150 total pubs  
**And** "Show Closed Pubs" toggle is ON  
**When** the sidebar is displayed  
**Then** the statistics section shows:  
  - "Visited: 45"  
  - "Remaining: 105"  
  - "Progress: 30%"  
**And** the statistics appear below the user menu  
**And** the statistics appear above the closed pubs toggle

#### Scenario: Statistics Exclude Closed Pubs When Toggle OFF
**Given** the user is authenticated  
**And** there are 150 total pubs (10 closed, 140 open)  
**And** the user has visited 45 pubs (5 closed, 40 open)  
**And** "Show Closed Pubs" toggle is OFF  
**When** the sidebar is displayed  
**Then** the statistics section shows:  
  - "Visited: 40" (only open pubs)  
  - "Remaining: 100" (140 open - 40 visited)  
  - "Progress: 29%" (40/140)  
**And** closed pubs are excluded from all calculations

#### Scenario: Statistics Update When Visit Added
**Given** the sidebar displays statistics showing:  
  - "Visited: 45"  
  - "Remaining: 105"  
**When** the user marks a pub as visited  
**And** the visit is successfully saved  
**Then** the statistics update within 50ms to show:  
  - "Visited: 46"  
  - "Remaining: 104"  
  - "Progress: 31%"  
**And** the update is smooth without flicker

#### Scenario: Statistics Update When Visit Removed
**Given** the sidebar displays statistics showing:  
  - "Visited: 46"  
  - "Remaining: 104"  
**When** the user removes a visit  
**And** the removal is successful  
**Then** the statistics update to show:  
  - "Visited: 45"  
  - "Remaining: 105"  
  - "Progress: 30%"

#### Scenario: Statistics Update When Closed Pubs Toggle Changes
**Given** the statistics show "Visited: 45" and "Remaining: 105"  
**And** "Show Closed Pubs" is ON  
**And** 10 pubs are closed (5 visited, 5 unvisited)  
**When** the user toggles "Show Closed Pubs" OFF  
**Then** the statistics recalculate within 50ms  
**And** display updated values excluding closed pubs  
**And** the calculation includes only open pubs in total and visited counts

#### Scenario: Hide Statistics for Unauthenticated Users
**Given** the user is not authenticated  
**When** the sidebar is displayed  
**Then** the visit statistics section is not shown  
**And** the closed pubs toggle appears directly below the login button  
**And** no visit-related data is calculated

#### Scenario: Show Statistics After Login
**Given** the user is not authenticated  
**And** the sidebar shows no statistics  
**When** the user logs in successfully  
**And** visit data is loaded  
**Then** the statistics section appears  
**And** displays the user's visit progress  
**And** the closed pubs toggle moves below the statistics section

#### Scenario: Hide Statistics After Logout
**Given** the user is authenticated  
**And** the statistics section is displayed  
**When** the user logs out  
**Then** the statistics section disappears  
**And** the closed pubs toggle moves up to fill the space  
**And** visit data is cleared

#### Scenario: Display Zero Visits Correctly
**Given** the user is authenticated  
**And** the user has not visited any pubs  
**And** there are 150 total pubs  
**When** the sidebar is displayed  
**Then** the statistics show:  
  - "Visited: 0"  
  - "Remaining: 150"  
  - "Progress: 0%"

#### Scenario: Display Complete Visits
**Given** the user is authenticated  
**And** the user has visited all 150 pubs  
**When** the sidebar is displayed  
**Then** the statistics show:  
  - "Visited: 150"  
  - "Remaining: 0"  
  - "Progress: 100%"

#### Scenario: Statistics Calculation Performance
**Given** the sidebar contains 1000 pubs  
**And** the user is authenticated with 300 visits  
**When** the statistics are calculated  
**Then** the calculation completes in under 10ms  
**And** the sidebar remains responsive  
**And** no UI lag is perceptible

---

## MODIFIED Requirements

None

---

## REMOVED Requirements

None
