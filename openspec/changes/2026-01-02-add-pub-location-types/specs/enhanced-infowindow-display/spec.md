# enhanced-infowindow-display Spec Delta

**Change:** `2026-01-02-add-pub-location-types`

## ADDED Requirements

### Requirement: Location Type Badge Display (REQ-EID-010)
**Priority:** MUST  
**Category:** UI/UX

**Changes:**
- ADD: Display location type badges in InfoWindow

The InfoWindow MUST display location type badges when a pub has location type properties set, indicating whether the pub is in a hotel, airport, or train station.

**Acceptance Criteria:**
- Location type badges display in the `iw-badges` container alongside status and visit badges
- Hotel badge displays "Hotel" text when `isHotel` is true
- Airport badge displays "Airport" text when `inAirport` is true
- Train Station badge displays "Train Station" text when `inTrainStation` is true
- Location type badges use distinct colors from status/visit badges (e.g., amber/orange for hotel, blue for airport, purple/violet for train station)
- Location type badges have rounded corners and padding consistent with existing badge styling
- Only one location type badge displays per pub
- Badges do not display if no location type properties are set
- Badge colors adapt to theme (light/dark mode)
- Badges remain readable and accessible in both themes

#### Scenario: Display Hotel Badge
**Given** a pub has `isHotel: true`  
**When** the InfoWindow opens  
**Then** a badge with text "Hotel" displays in the badges container  
**And** the badge uses amber/orange background color  
**And** the badge appears alongside status and visit badges  
**And** no other location type badges display

#### Scenario: Display Airport Badge
**Given** a pub has `inAirport: true`  
**When** the InfoWindow opens  
**Then** a badge with text "Airport" displays in the badges container  
**And** the badge uses blue background color  
**And** the badge appears alongside status and visit badges  
**And** no other location type badges display

#### Scenario: Display Train Station Badge
**Given** a pub has `inTrainStation: true`  
**When** the InfoWindow opens  
**Then** a badge with text "Train Station" displays in the badges container  
**And** the badge uses purple/violet background color  
**And** the badge appears alongside status and visit badges  
**And** no other location type badges display

#### Scenario: No Location Type Badge for Standard Pub
**Given** a pub has no location type properties set (isHotel, inAirport, inTrainStation are all undefined or false)  
**When** the InfoWindow opens  
**Then** no location type badge displays  
**And** only status and visit badges (if applicable) are shown

#### Scenario: Location Badge in Dark Theme
**Given** a pub has a location type property set  
**And** the user has dark theme enabled  
**When** the InfoWindow opens  
**Then** the location type badge displays with dark theme appropriate colors  
**And** the badge text remains readable against the dark background  
**And** badge contrast meets accessibility standards

#### Scenario: Multiple Badges Display Together
**Given** a pub has `inAirport: true` and `openState: "Open"` and user has visited it  
**When** the InfoWindow opens  
**Then** three badges display in the badges container  
**And** badges are: "Open", "Visited", and "Airport"  
**And** badges wrap appropriately on smaller screens  
**And** badges maintain consistent spacing via flex gap
