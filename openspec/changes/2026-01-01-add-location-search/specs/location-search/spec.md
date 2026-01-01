# location-search Specification

## Purpose
Enable users to search for geographic locations using Google Places Autocomplete and center the map on selected results.

## ADDED Requirements

### Requirement: Search Input Display (REQ-LS-001)
**Priority:** MUST  
**Category:** Functional

The map MUST display a search input field that allows users to search for locations.

**Acceptance Criteria:**
- Search input is visible on the map view
- Input field is positioned in a non-obstructive location (top area of map)
- Input has clear placeholder text indicating its purpose (e.g., "Search for a location")
- Input is responsive and accessible on mobile devices
- Input does not obscure map controls or sidebar trigger
- Input styling is consistent with application theme (light/dark mode)
- Input is keyboard accessible and supports standard navigation

#### Scenario: Search Input Visible on Desktop
**Given** the user opens the map view on a desktop browser  
**When** the map loads  
**Then** a search input field is displayed at the top-center of the map  
**And** the input has placeholder text "Search for a location"  
**And** the input does not overlap the sidebar trigger or map controls  
**And** the input styling matches the current theme (light or dark)

#### Scenario: Search Input Visible on Mobile
**Given** the user opens the map view on a mobile device  
**When** the map loads  
**Then** a search input field is displayed at the top of the map  
**And** the input is appropriately sized for touch interaction  
**And** the input does not obscure the sidebar trigger  
**And** the input is horizontally centered or left-aligned with appropriate margins

#### Scenario: Search Input Keyboard Accessible
**Given** the user is navigating via keyboard  
**When** the user tabs through page elements  
**Then** the search input receives focus in the correct tab order  
**And** the user can type into the input when focused  
**And** pressing Escape clears autocomplete suggestions

---

### Requirement: Autocomplete Suggestions (REQ-LS-002)
**Priority:** MUST  
**Category:** Functional

The search input MUST provide autocomplete suggestions using Google Places Autocomplete API as users type.

**Acceptance Criteria:**
- Autocomplete requests are triggered after user types at least 3 characters
- Autocomplete requests are debounced (300ms delay) to avoid excessive API calls
- Suggestions are displayed in a dropdown below the input field
- Suggestions include location names and addresses
- Suggestions are styled consistently with application theme
- Loading state is shown while fetching suggestions
- Network errors fail gracefully without crashing the UI
- User can navigate suggestions via keyboard (arrow keys)
- User can select a suggestion via click or Enter key
- Suggestions are cleared when input is cleared

#### Scenario: Autocomplete Shows Suggestions
**Given** the user has the map view open  
**When** the user types "London" into the search input  
**Then** a loading indicator is briefly shown  
**And** a dropdown of location suggestions appears below the input  
**And** each suggestion shows the location name and additional context (e.g., "London, UK")  
**And** suggestions are styled to match the current theme

#### Scenario: Autocomplete Debounced
**Given** the user is typing rapidly in the search input  
**When** the user types "Man" quickly  
**Then** no API request is made until 300ms after the last keystroke  
**And** only one request is made for the complete term  
**And** previous pending requests are cancelled

#### Scenario: Minimum Character Requirement
**Given** the user has the map view open  
**When** the user types "Lo" (2 characters) into the search input  
**Then** no autocomplete suggestions are shown  
**And** no API request is made  
**When** the user types a third character  
**Then** autocomplete suggestions are fetched and displayed

#### Scenario: Keyboard Navigation
**Given** autocomplete suggestions are displayed  
**When** the user presses the Down arrow key  
**Then** the first suggestion is highlighted  
**When** the user presses Down again  
**Then** the next suggestion is highlighted  
**When** the user presses Up  
**Then** the previous suggestion is highlighted  
**When** the user presses Enter on a highlighted suggestion  
**Then** the location is selected and the map centers on it

#### Scenario: Network Error Handling
**Given** the user types "Paris" into the search input  
**And** the Google Places API request fails due to network error  
**When** the error occurs  
**Then** no suggestions are displayed  
**And** a console warning is logged  
**And** the UI remains functional (no crash)  
**And** the user can retry by typing again

---

### Requirement: Map Centering on Selection (REQ-LS-003)
**Priority:** MUST  
**Category:** Functional

When a user selects a location from autocomplete suggestions, the map MUST center on that location.

**Acceptance Criteria:**
- Selecting a suggestion centers the map on the location's coordinates
- Map zoom level adjusts to an appropriate level for the location type (e.g., 14 for cities, 16 for addresses)
- Map pans smoothly to the new location (animated transition)
- Existing pub markers remain visible and functional
- Search input is cleared or shows the selected location name
- User can still interact with the map normally after centering
- Centering works for all location types (cities, addresses, landmarks)

#### Scenario: Center on City Selection
**Given** the user has typed "Manchester" into the search input  
**And** autocomplete suggestions are displayed  
**When** the user clicks "Manchester, UK" from the suggestions  
**Then** the map smoothly pans to Manchester's coordinates  
**And** the zoom level changes to 14  
**And** pub markers in the Manchester area become visible  
**And** the search input shows "Manchester, UK" or is cleared  
**And** the autocomplete dropdown closes

#### Scenario: Center on Address Selection
**Given** the user has typed "10 Downing Street" into the search input  
**And** autocomplete suggestions are displayed  
**When** the user selects "10 Downing Street, London, UK"  
**Then** the map smoothly pans to the address coordinates  
**And** the zoom level changes to 16 (closer zoom for specific address)  
**And** nearby pub markers are visible  
**And** the autocomplete dropdown closes

#### Scenario: Center on Landmark Selection
**Given** the user searches for "Big Ben"  
**When** the user selects "Big Ben, London, UK" from suggestions  
**Then** the map centers on Big Ben's coordinates  
**And** the zoom level is appropriate for viewing the area (15-16)  
**And** the map remains fully interactive

---

### Requirement: Google Places API Integration (REQ-LS-004)
**Priority:** MUST  
**Category:** Technical

The implementation MUST use Google Places Autocomplete API correctly and efficiently.

**Acceptance Criteria:**
- Uses Google Places Autocomplete (New) API endpoint
- API key is sourced from existing environment variable `VITE_GOOGLE_MAPS_API_KEY`
- API requests include appropriate region biasing (UK preferred)
- API requests use appropriate place types (geocode, establishment)
- Session tokens are used to optimize billing
- API calls are properly cleaned up to prevent memory leaks
- Errors from API are caught and logged appropriately
- Implementation follows Google Places API best practices

#### Scenario: API Integration with Session Tokens
**Given** the user starts typing in the search input  
**When** autocomplete requests are made  
**Then** a session token is generated for the autocomplete session  
**And** the same token is reused for all requests in that session  
**And** a new session token is created when a place is selected  
**And** this minimizes API billing costs per Google's recommendations

#### Scenario: Region Biasing for UK
**Given** the application is focused on UK pubs  
**When** autocomplete requests are made  
**Then** the API request includes region biasing for UK (componentRestrictions or location bias)  
**And** UK locations appear first in suggestions  
**But** users can still search for international locations if needed

#### Scenario: API Error Logging
**Given** the user searches for a location  
**When** the Google Places API returns an error (e.g., quota exceeded, invalid request)  
**Then** the error is caught and logged to the console with details  
**And** the user sees no broken UI  
**And** the search input remains functional for future attempts

---

### Requirement: Mobile Responsiveness (REQ-LS-005)
**Priority:** MUST  
**Category:** Functional

The location search feature MUST work effectively on mobile devices.

**Acceptance Criteria:**
- Search input is appropriately sized for touch interaction (minimum 44x44px touch target)
- Autocomplete dropdown is readable and scrollable on small screens
- Suggestions are touch-friendly (adequate spacing, size)
- Virtual keyboard does not obscure search input or suggestions
- Search input can be hidden/minimized to maximize map viewport on mobile
- Feature works on iOS Safari and Android Chrome

#### Scenario: Mobile Touch Interaction
**Given** the user opens the map on a mobile device  
**When** the user taps the search input  
**Then** the virtual keyboard appears  
**And** the search input remains visible above the keyboard  
**When** autocomplete suggestions appear  
**Then** the dropdown is positioned to avoid being hidden by the keyboard  
**And** each suggestion has adequate touch target size (minimum 44px height)  
**And** the user can tap a suggestion to select it

#### Scenario: Mobile Viewport Management
**Given** the user is on a mobile device  
**When** the search input is not in use  
**Then** it occupies minimal vertical space  
**And** the map viewport is maximized  
**When** the user focuses the search input  
**Then** the layout adjusts to accommodate keyboard and suggestions  
**And** the user can still dismiss the keyboard to return to full map view

---

### Requirement: Theme Consistency (REQ-LS-006)
**Priority:** MUST  
**Category:** UI/UX

The search input and autocomplete suggestions MUST match the application's theme (light/dark mode).

**Acceptance Criteria:**
- Search input background and text colors match current theme
- Autocomplete dropdown background and text match current theme
- Hover/focus states are visible in both light and dark modes
- Theme changes are applied immediately to search UI components

#### Scenario: Dark Mode Styling
**Given** the user has dark mode enabled  
**When** the search input is displayed  
**Then** the input has a dark background with light text  
**And** the border/outline is visible against the dark background  
**When** autocomplete suggestions appear  
**Then** the dropdown has a dark background with light text  
**And** hover states use appropriate dark mode colors

#### Scenario: Light Mode Styling
**Given** the user has light mode enabled  
**When** the search input is displayed  
**Then** the input has a light background with dark text  
**When** autocomplete suggestions appear  
**Then** the dropdown has a light background with dark text  
**And** all elements are clearly visible

#### Scenario: Theme Toggle
**Given** the user has the search input open with suggestions visible  
**When** the user toggles from light to dark mode  
**Then** the search input and dropdown immediately update to dark mode styling  
**And** no visual glitches or layout shifts occur
