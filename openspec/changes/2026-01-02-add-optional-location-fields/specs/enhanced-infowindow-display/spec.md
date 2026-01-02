# enhanced-infowindow-display Delta

**Change:** `2026-01-02-add-optional-location-fields`

## MODIFIED Requirements

### Requirement: Location Information Display (REQ-EID-002)
**Priority:** MUST  
**Category:** Functional

**Changes:**
- MODIFY: Display "Unknown" for missing country or region

The system SHALL display "Unknown" for country and region fields when they are null, undefined, or empty strings, ensuring a consistent user experience across all location displays.

**Updated Acceptance Criteria:**
- Address SHALL be displayed with street, town/city, county on separate lines
- **ADDED:** Country SHALL display as "Unknown" if null, undefined, or empty string
- **ADDED:** Region SHALL display as "Unknown" if null, undefined, or empty string
- **EXISTING:** Country and region SHALL be displayed if available
- All address fields SHALL be properly escaped for HTML
- Address section SHALL use appropriate text styling for readability
- Address text size SHALL be readable on mobile devices (min 12px)

#### Scenario: Display Pub with Missing Country
**ADDED:**
**Given** a pub with all location fields except country is null
**When** the info window is rendered
**Then** the country line displays "Unknown"
**And** the region displays the actual value if present
**And** all other address fields display normally

#### Scenario: Display Pub with Missing Region
**ADDED:**
**Given** a pub with all location fields except region is null
**When** the info window is rendered
**Then** the region line displays "Unknown"
**And** the country displays the actual value if present
**And** all other address fields display normally

#### Scenario: Display Pub with Missing Country and Region
**ADDED:**
**Given** a pub where both country and region are null
**When** the info window is rendered
**Then** the country line displays "Unknown"
**And** the region line displays "Unknown"
**And** all other address fields display normally

#### Scenario: Display Pub with Empty String Country
**ADDED:**
**Given** a pub where country is an empty string ""
**When** the info window is rendered
**Then** the country line displays "Unknown"
**And** empty string is treated the same as null/undefined
