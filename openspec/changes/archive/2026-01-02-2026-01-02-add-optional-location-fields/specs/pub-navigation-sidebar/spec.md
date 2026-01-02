# pub-navigation-sidebar Delta

**Change:** `2026-01-02-add-optional-location-fields`

## MODIFIED Requirements

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
