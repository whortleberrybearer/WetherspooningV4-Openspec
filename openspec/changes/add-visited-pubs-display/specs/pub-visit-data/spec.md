# pub-visit-data Specification

## Purpose
Manage pub visit data for authenticated users, enabling the application to display which pubs a user has visited and calculate visit statistics.

## ADDED Requirements

### Requirement: Visit Data Source (REQ-PVD-001)
**Priority:** MUST  
**Category:** Functional

The system MUST load visit data from a static JSON file when a user authenticates.

**Acceptance Criteria:**
- Visit data is loaded from `/data/visits-sample.json`
- JSON file contains array of Visit objects
- Each Visit object includes: `id`, `userId`, `pubId`
- Optional fields: `visitedAt` (ISO date string), `rating` (1-5), `notes` (string)
- Loading errors are caught and logged
- Failed loads don't prevent application from functioning
- Empty or invalid JSON is handled gracefully

#### Scenario: Load Visit Data for Authenticated User
**Given** a user is authenticated with userId 1  
**When** the visit data is loaded  
**Then** the system fetches `/data/visits-sample.json`  
**And** parses the JSON into Visit objects  
**And** filters visits to only those with userId matching the authenticated user  
**And** stores the visited pub IDs for quick lookup

#### Scenario: Handle Visit Data Load Failure
**Given** the `/data/visits-sample.json` file is missing or returns an error  
**When** the system attempts to load visit data  
**Then** an error is caught and logged to console  
**And** the visit state remains empty (all pubs appear unvisited)  
**And** the map and sidebar continue to function normally

---

### Requirement: Visit Data Structure (REQ-PVD-002)
**Priority:** MUST  
**Category:** Functional

The system MUST define and validate the Visit entity structure.

**Acceptance Criteria:**
- Visit interface includes required fields: `id`, `userId`, `pubId`
- Visit interface includes optional fields: `visitedAt`, `rating`, `notes`
- `pubId` references a valid pub from the pub data source
- `userId` references the authenticated user
- `rating` is between 1 and 5 (inclusive) if provided
- Invalid visits are logged and skipped during data load

#### Scenario: Process Valid Visit Data
**Given** the visits JSON contains a valid visit entry  
```json
{
  "id": 1,
  "userId": 1,
  "pubId": 5,
  "visitedAt": "2025-12-15T14:30:00Z",
  "rating": 4,
  "notes": "Great atmosphere!"
}
```
**When** the visit data is loaded  
**Then** the visit is successfully added to the user's visited pubs  
**And** `pubId` 5 is marked as visited

#### Scenario: Skip Invalid Visit Entry
**Given** the visits JSON contains an entry missing required field `pubId`  
**When** the visit data is processed  
**Then** a warning is logged to console  
**And** the invalid entry is skipped  
**And** other valid visits are still processed

---

### Requirement: Visit Lookup (REQ-PVD-003)
**Priority:** MUST  
**Category:** Functional

The system MUST provide a method to check if a specific pub has been visited by the current user.

**Acceptance Criteria:**
- `isVisited(pubId: number)` method returns boolean
- Lookup is performant (O(1) using Set data structure)
- Returns `false` for invalid or undefined pub IDs
- Returns `false` if no visit data is loaded
- Works correctly after visit data changes

#### Scenario: Check if Pub is Visited
**Given** the authenticated user has visited pubs with IDs [5, 12, 23]  
**When** `isVisited(12)` is called  
**Then** the method returns `true`

#### Scenario: Check if Pub is Not Visited
**Given** the authenticated user has visited pubs with IDs [5, 12, 23]  
**When** `isVisited(8)` is called  
**Then** the method returns `false`

#### Scenario: Check Visit Before Data Loaded
**Given** visit data has not been loaded yet  
**When** `isVisited(5)` is called  
**Then** the method returns `false`  
**And** no error is thrown

---

### Requirement: Visit Counts (REQ-PVD-004)
**Priority:** MUST  
**Category:** Functional

The system MUST calculate the number of visited pubs within a given group of pubs.

**Acceptance Criteria:**
- `getGroupCounts(pubs: Pub[])` method returns `{ visited: number, total: number }`
- Counts only pubs in the provided array
- `visited` is the count of pubs with visited status
- `total` is the total number of pubs in the array
- Works correctly with empty arrays (returns `{ visited: 0, total: 0 }`)

#### Scenario: Calculate Visit Counts for Group
**Given** the authenticated user has visited pubs with IDs [5, 12]  
**And** a county group contains pubs with IDs [5, 8, 12, 15]  
**When** `getGroupCounts(countyPubs)` is called  
**Then** the method returns `{ visited: 2, total: 4 }`

#### Scenario: Calculate Counts for Group with No Visits
**Given** the authenticated user has visited pubs with IDs [5, 12]  
**And** a county group contains pubs with IDs [20, 21, 22]  
**When** `getGroupCounts(countyPubs)` is called  
**Then** the method returns `{ visited: 0, total: 3 }`

#### Scenario: Calculate Counts for Empty Group
**Given** the visit data is loaded  
**When** `getGroupCounts([])` is called with an empty array  
**Then** the method returns `{ visited: 0, total: 0 }`

---

### Requirement: Authentication Integration (REQ-PVD-005)
**Priority:** MUST  
**Category:** Functional

The system MUST only load and display visit data when a user is authenticated.

**Acceptance Criteria:**
- Visit data loading is triggered when user authenticates
- Visit data is cleared when user logs out
- `isVisited()` returns `false` for all pubs when not authenticated
- Visit counts show 0 visited when not authenticated
- Components watch authentication state to load/clear visit data

#### Scenario: Load Visits on Authentication
**Given** the user is not authenticated  
**And** no visit data is loaded  
**When** the user successfully logs in  
**Then** the visit data loading is triggered automatically  
**And** visited pubs are identified from the data file  
**And** map markers and sidebar counts update to show visit status

#### Scenario: Clear Visits on Logout
**Given** the user is authenticated  
**And** visit data is loaded with visited pub IDs [5, 12, 23]  
**When** the user logs out  
**Then** the visited pub IDs are cleared  
**And** `isVisited()` returns `false` for all pubs  
**And** map markers revert to unvisited states  
**And** sidebar counts show 0 visited for all groups

#### Scenario: Access Visit Data When Not Authenticated
**Given** the user is not authenticated  
**When** `isVisited(5)` is called  
**Then** the method returns `false`  
**And** when `getGroupCounts(pubs)` is called  
**Then** `visited` is always 0
