# pub-navigation-sidebar Delta

**Change:** `2026-01-02-add-optional-location-fields`

## MODIFIED Requirements

### Requirement: Pub List Item Display (REQ-PNS-003)
**Priority:** MUST  
**Category:** Functional

**Changes:**
- MODIFY: Display "Unknown" for missing country or region in pub list items

The system SHALL display "Unknown" in sidebar pub list items when country or region fields are null, undefined, or empty strings, maintaining visual consistency and clarity for users.

**Updated Acceptance Criteria:**
- Each pub SHALL display name, town/city, and county
- **ADDED:** Region SHALL display as "Unknown" if null, undefined, or empty string
- **ADDED:** Country SHALL display as "Unknown" if null, undefined, or empty string
- **EXISTING:** Region and country SHALL be shown if available
- Visited pubs SHALL show checkmark icon
- Closed pubs SHALL show "Closed" badge in red
- Click on pub SHALL highlight it and trigger map zoom
- Text SHALL be readable on both light and dark themes

#### Scenario: Display Pub in List with Missing Region
**ADDED:**
**Given** a pub in the sidebar list has region field as null
**When** the pub list item renders
**Then** the region displays as "Unknown"
**And** the country displays normally if present
**And** all other fields display correctly

#### Scenario: Display Pub in List with Missing Country
**ADDED:**
**Given** a pub in the sidebar list has country field as undefined
**When** the pub list item renders
**Then** the country displays as "Unknown"
**And** the region displays normally if present
**And** all other fields display correctly

#### Scenario: Display Pub with Both Missing
**ADDED:**
**Given** a pub in the sidebar list has both country and region as null
**When** the pub list item renders
**Then** both country and region display as "Unknown"
**And** the pub is still selectable and functional
**And** no rendering errors occur
